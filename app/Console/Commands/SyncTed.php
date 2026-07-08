<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

/**
 * Importa avvisi di gara/appalto dal portale TED (Tenders Electronic Daily) — api.ted.europa.eu
 *
 * TED pubblica le gare d'appalto di tutte le PA europee.
 * L'API v3 è open (nessuna auth per la lettura).
 *
 * Endpoint: POST https://api.ted.europa.eu/v3/notices/search
 * Docs:     https://docs.ted.europa.eu/api/latest/search.html
 *
 * NOTA: TED copre appalti (lavori, servizi, forniture), non bandi di contributo/finanziamento.
 * Viene importato con categoria "appalti" per distinguerlo dai bandi di agevolazione.
 */
class SyncTed extends Command
{
    protected $signature = 'bandi:sync-ted
                            {--paese=ITA : Codice paese ISO alpha-3 (ITA=Italia)}
                            {--regione=sicilia : Filtra per nome regione/città acquirente (opzionale)}
                            {--tipo=* : Tipi acquirente: regional-or-local-authority,body-governed-by-public-law}
                            {--limit=50 : Numero massimo di avvisi per chiamata}
                            {--pagine=3 : Numero di pagine da importare}
                            {--giorni=90 : Importa solo avvisi pubblicati negli ultimi N giorni}';

    protected $description = 'Sincronizza gare d\'appalto da TED (Tenders Electronic Daily) per PA italiane';

    private const ENDPOINT = 'https://api.ted.europa.eu/v3/notices/search';
    private const FONTE    = 'ted';

    public function handle(): int
    {
        $this->info('🔄 Sincronizzazione TED — Tenders Electronic Daily...');

        $paese  = $this->option('paese');
        $limit  = (int) $this->option('limit');
        $pagine = (int) $this->option('pagine');
        $giorni = (int) $this->option('giorni');
        $regione = strtolower($this->option('regione') ?? '');

        // Tipi di acquirente da cercare (enti locali + organismi di diritto pubblico)
        $tipiAcquirente = $this->option('tipo') ?: [
            'regional-or-local-authority',
            'body-governed-by-public-law',
        ];

        $dataDal = now()->subDays($giorni)->format('Y') . '-'
                 . now()->subDays($giorni)->format('m') . '-'
                 . now()->subDays($giorni)->format('d');

        $this->info("📊 Parametri: paese=$paese, ultimi {$giorni} giorni, pagine=$pagine");

        $totalImported = 0;

        for ($page = 1; $page <= $pagine; $page++) {
            $this->info("📄 Pagina $page/$pagine...");

            $body = $this->buildQuery($paese, $tipiAcquirente, $dataDal, $limit, $page);

            try {
                $response = Http::timeout(30)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'Accept'       => 'application/json',
                    ])
                    ->post(self::ENDPOINT, $body);

                if (!$response->successful()) {
                    $this->error("❌ Errore API TED (HTTP " . $response->status() . "): " . substr($response->body(), 0, 300));
                    break;
                }

                $data    = $response->json();
                $notices = $data['notices'] ?? $data['results'] ?? $data['hits'] ?? [];

                if (empty($notices)) {
                    $this->info("  Nessun avviso trovato in pagina $page, stop.");
                    break;
                }

                $this->info("  📋 " . count($notices) . " avvisi ricevuti");

                $batch = [];
                foreach ($notices as $notice) {
                    $bando = $this->mapToBando($notice, $regione);
                    if ($bando) $batch[] = $bando;
                }

                if (!empty($batch)) {
                    $this->insertBatch($batch);
                    $totalImported += count($batch);
                }

                // Se la pagina è incompleta non ci sono altre pagine
                if (count($notices) < $limit) break;

                sleep(1); // rispetta rate limit TED

            } catch (\Exception $e) {
                $this->error("❌ Errore: " . $e->getMessage());
                break;
            }
        }

        $this->info("✅ TED — {$totalImported} avvisi importati.");
        return self::SUCCESS;
    }

    private function buildQuery(
        string $paese,
        array $tipiAcquirente,
        string $dataDal,
        int $limit,
        int $page
    ): array {
        // TED v3 Expert Search — data in formato YYYYMMDD (senza trattini)
        $dataDalFormatted = str_replace('-', '', $dataDal);

        $queryParts   = ["buyer-country=$paese"];
        $queryParts[] = "publication-date>=$dataDalFormatted";

        return [
            'query'  => implode(' AND ', $queryParts),
            'fields' => [
                'notice-identifier',
                'publication-number',
                'notice-title',
                'title-lot',
                'title-part',
                'buyer-name',
                'organisation-name-buyer',
                'buyer-city',
                'description-lot',
                'description-part',
                'classification-cpv',
                'main-classification-lot',
                'estimated-value-lot',
                'estimated-value-cur-lot',
                'total-value',
                'deadline-receipt-tender-date-lot',
                'dispatch-date',
                'submission-url-lot',
                'notice-type',
            ],
            'page'   => $page,
            'limit'  => $limit,
        ];
    }

    private function mapToBando(array $notice, string $regioneFiltro): ?array
    {
        // Titolo: notice-title ha una language-map; title-lot ha {ita: [array]}
        $titolo = $this->scalar($notice['notice-title'] ?? null, true)
               ?? $this->scalar($notice['title-lot'] ?? null, true)
               ?? $this->scalar($notice['title-part'] ?? null, true);
        if (empty($titolo)) return null;

        // ID: notice-identifier (UUID) oppure publication-number (es. "370729-2026")
        $id = $this->scalar($notice['notice-identifier'] ?? null)
            ?? ($notice['publication-number'] ?? null);

        // URL: link ITA dall'oggetto links sempre presente, o submission-url-lot
        $url = $notice['links']['html']['ITA']
            ?? $notice['links']['htmlDirect']['ITA']
            ?? $this->scalar($notice['submission-url-lot'] ?? null, true);

        $desc = $this->scalar($notice['description-lot'] ?? null, true)
             ?? $this->scalar($notice['description-part'] ?? null, true);

        // deadline-receipt-tender-date-lot restituisce ["2026-06-12+02:00", ...] — prendi primo
        $scadenza = $this->parseDate(
            $this->scalar($notice['deadline-receipt-tender-date-lot'] ?? null, true)
        );

        // dispatch-date restituisce "2026-05-28+02:00" (stringa con timezone)
        $pubDate = $this->parseDate(
            $this->scalar($notice['dispatch-date'] ?? null)
        );

        // estimated-value-lot è un array numerico — somma o prendi il primo
        $estValues = $notice['estimated-value-lot'] ?? [];
        $budget = is_array($estValues) && !empty($estValues)
            ? array_sum(array_map('floatval', $estValues))
            : ($this->parseNumber($this->scalar($notice['total-value'] ?? null)) ?? null);
        if (!$budget && isset($notice['total-value'])) {
            $budget = is_numeric($notice['total-value']) ? (float) $notice['total-value'] : null;
        }

        $buyerName = $this->scalar($notice['buyer-name'] ?? null, true)
                  ?? $this->scalar($notice['organisation-name-buyer'] ?? null, true);

        $buyerCity = $this->scalar($notice['buyer-city'] ?? null, true);

        // CPV: array di codici — prendi il primo
        $cpv = $this->scalar($notice['classification-cpv'] ?? null, true)
            ?? $this->scalar($notice['main-classification-lot'] ?? null, true);

        $categoria = $this->cpvToCategoria($cpv);

        $descrizioneCompleta = trim(implode("\n\n", array_filter([
            $desc,
            $buyerName ? "Ente appaltante: $buyerName" : null,
            $buyerCity ? "Città: $buyerCity" : null,
            $cpv       ? "CPV: $cpv" : null,
        ])));

        return [
            'codice_esterno'     => $id,
            'fonte'              => self::FONTE,
            'titolo'             => mb_substr($titolo, 0, 255),
            'descrizione'        => $this->truncaConEllissi($descrizioneCompleta),
            'url'                => $url ? mb_substr($url, 0, 255) : null,
            'categoria'          => $categoria ?? 'appalti',
            'livello'            => 'europeo',
            'regione'            => 'Italia',
            'target'             => 'Operatori economici',
            'budget_totale'      => $budget,
            'budget_min'         => null,
            'budget_max'         => null,
            'scadenza'           => $scadenza,
            'data_pubblicazione' => $pubDate,
            'data_inizio'        => $pubDate,
            'stato'              => $this->determinaStato($scadenza),
            'extra_data'         => json_encode($notice, JSON_UNESCAPED_UNICODE),
        ];
    }

    /**
     * Estrae stringa da un campo TED che può essere:
     * - scalare ("valore")
     * - array semplice (["v1", "v2"]) → prende il primo
     * - language-map ({"ita": "...", "eng": "..."}) → preferisce ita/eng/qualsiasi
     * - language-map con array interni ({"ita": ["v1", "v2"]}) → ita[0]
     */
    private function scalar(mixed $v, bool $first = false): ?string
    {
        if ($v === null || $v === '') return null;

        if (is_array($v)) {
            // Language map: chiavi come "ita", "eng", "mul", "hun", ...
            if (!array_is_list($v)) {
                $val = $v['ita'] ?? $v['eng'] ?? $v['mul'] ?? reset($v);
                return $this->scalar($val, $first);
            }
            // Array semplice: prendi primo elemento o tutti
            if ($first || count($v) === 1) {
                return $this->scalar($v[0] ?? null);
            }
            $parts = array_filter(array_map(fn ($x) => is_scalar($x) ? trim((string) $x) : null, $v));
            return implode(', ', $parts) ?: null;
        }

        return trim((string) $v) ?: null;
    }

    /**
     * Converte il codice CPV in categoria leggibile.
     * CPV = Common Procurement Vocabulary (es. 45000000 = Lavori di costruzione)
     */
    private function cpvToCategoria(?string $cpv): ?string
    {
        if (!$cpv) return null;
        $prefix = substr(preg_replace('/[^0-9]/', '', $cpv), 0, 2);

        return match (true) {
            in_array($prefix, ['45'])           => 'lavori pubblici',
            in_array($prefix, ['72', '48'])     => 'informatica e software',
            in_array($prefix, ['79'])           => 'servizi professionali',
            in_array($prefix, ['85'])           => 'servizi sociali e sanitari',
            in_array($prefix, ['80'])           => 'formazione e istruzione',
            in_array($prefix, ['90'])           => 'ambiente e rifiuti',
            in_array($prefix, ['71'])           => 'ingegneria e architettura',
            in_array($prefix, ['60', '63'])     => 'trasporti',
            in_array($prefix, ['32', '34'])     => 'tecnologie e veicoli',
            in_array($prefix, ['09'])           => 'energia',
            default                             => 'appalti',
        };
    }

    private function parseNumber(?string $value): ?float
    {
        if (empty($value)) return null;
        $v = preg_replace('/[^0-9.,]/', '', $value);
        $v = str_replace(',', '.', $v);
        return empty($v) ? null : (float) $v;
    }

    /**
     * Tronca a $max caratteri sull'ultimo confine di parola invece di tagliare a metà
     * e aggiunge "…".
     */
    private function truncaConEllissi(?string $testo, int $max = 2000): ?string
    {
        if (empty($testo)) return null;
        if (mb_strlen($testo) <= $max) return $testo;

        $tagliato = mb_substr($testo, 0, $max);
        $ultimoSpazio = mb_strrpos($tagliato, ' ');
        if ($ultimoSpazio !== false) {
            $tagliato = mb_substr($tagliato, 0, $ultimoSpazio);
        }
        return rtrim($tagliato, ".,;: \t\n") . '…';
    }

    private function parseDate(?string $value): ?string
    {
        if (empty($value)) return null;
        if (preg_match('/^(\d{4}-\d{2}-\d{2})/', trim($value), $m)) return $m[1];
        foreach (['d/m/Y', 'd-m-Y', 'Y/m/d'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, trim($value));
            if ($d) return $d->format('Y-m-d');
        }
        return null;
    }

    private function determinaStato(?string $scadenza): string
    {
        if (!$scadenza) return 'aperto';
        $diff = now()->diffInDays($scadenza, false);
        if ($diff < 0) return 'chiuso';
        if ($diff <= 30) return 'in_scadenza';
        return 'aperto';
    }

    private function insertBatch(array $batch): void
    {
        try {
            BandoImportato::upsert(
                $batch,
                ['codice_esterno', 'fonte'],
                ['titolo', 'descrizione', 'scadenza', 'stato', 'budget_totale',
                 'categoria', 'url', 'extra_data']
            );
        } catch (\Exception $e) {
            $this->warn('⚠️ Batch insert fallito: ' . $e->getMessage());
            foreach ($batch as $record) {
                try { BandoImportato::create($record); } catch (\Exception) {}
            }
        }
    }
}
