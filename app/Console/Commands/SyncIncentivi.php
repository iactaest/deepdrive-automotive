<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

/**
 * Importa agevolazioni dal portale incentivi.gov.it (MIMIT + programmi Invitalia).
 *
 * Il portale pubblica dump open data (IODL 2.0) in JSON e CSV.
 * La pagina open data è: https://www.incentivi.gov.it/it/open-data
 *
 * Poiché non c'è un endpoint REST con filtri, il comando:
 * 1. Scarica la pagina open-data per estrarre l'URL del file JSON corrente
 * 2. Scarica il file e importa ogni incentivo in bandi_importati
 */
class SyncIncentivi extends Command
{
    protected $signature = 'bandi:sync-incentivi
                            {--url= : URL diretto al file JSON (bypassa auto-discovery)}
                            {--limit=0 : Limite record (0 = tutti)}
                            {--solo-attivi : Importa solo incentivi con data chiusura futura o non specificata}
                            {--includi-imprese : Importa anche incentivi rivolti solo a imprese private (default: esclusi)}
                            {--solo-enti : Importa SOLO incentivi esplicitamente rivolti a enti pubblici}';

    protected $description = 'Sincronizza agevolazioni da incentivi.gov.it (MIMIT + Invitalia)';

    private const OPEN_DATA_PAGE  = 'https://www.incentivi.gov.it/it/open-data';
    private const SOLR_ENDPOINT   = 'https://www.incentivi.gov.it/solr/coredrupal/select';
    private const SOLR_ROWS       = 8000;
    private const FONTE           = 'incentivi_gov_it';

    // Mappa campi Solr → nomi leggibili (da aliases_file nel JS del portale)
    private const FL = 'ID_Incentivo:zs_nid,'
                     . 'Titolo:zs_title,'
                     . 'Descrizione:zs_body,'
                     . 'Obiettivo_Finalita:zm_field_scopes_value,'
                     . 'Data_apertura:zs_field_open_date,'
                     . 'Data_chiusura:zs_field_close_date,'
                     . 'Dimensioni:zm_field_dimensions_value,'
                     . 'Tipologia_Soggetto:zm_field_subject_type_value,'
                     . 'Forma_agevolazione:zm_field_support_form_value,'
                     . 'Spesa_Ammessa_min:zs_field_cost_min,'
                     . 'Spesa_Ammessa_max:zs_field_cost_max,'
                     . 'Settore_Attivita:zm_field_activity_sector_value,'
                     . 'Regioni:zm_field_regions_value,'
                     . 'Soggetto_Concedente:zs_field_subject_grant,'
                     . 'Stanziamento_incentivo:zs_field_budget_allocation,'
                     . 'Link_istituzionale:zs_field_link';

    public function handle(): int
    {
        $this->info('🔄 Sincronizzazione incentivi.gov.it (via Solr open data)...');

        $soloAttivi     = $this->option('solo-attivi');
        $includiImprese = $this->option('includi-imprese');
        $soloEnti       = $this->option('solo-enti');
        $limit          = (int) $this->option('limit');
        $oggi           = now()->toDateString();

        // Costruisce la query Solr con i campi mappati (stesso meccanismo del bottone "Download JSON")
        $params = http_build_query([
            'q.op' => 'OR',
            'wt'   => 'json',
            'rows' => self::SOLR_ROWS,
            'fl'   => self::FL,
            'q'    => '*:*',
            'fq'   => 'sm_context_tags:search_api_X2f_index_X3a_incentivi',
        ]);
        $url = self::SOLR_ENDPOINT . '?' . $params;

        $this->info("📥 Download da Solr: " . self::SOLR_ENDPOINT);

        try {
            $response = Http::timeout(120)->get($url);

            if (!$response->successful()) {
                $this->error("❌ Solr error HTTP " . $response->status());
                return self::FAILURE;
            }

            $incentivi = $response->json('response.docs') ?? [];

            if (empty($incentivi)) {
                $this->warn("⚠️ Nessun incentivo trovato.");
                return self::SUCCESS;
            }

            $this->info("📊 Trovati " . count($incentivi) . " incentivi");

            $imported = 0;
            $skipped  = 0;
            $batch    = [];

            foreach ($incentivi as $item) {
                if ($limit > 0 && $imported >= $limit) break;
                if (!is_array($item)) continue;

                if ($soloAttivi) {
                    $chiusura = $item['Data_chiusura'] ?? null;
                    if ($chiusura && $this->parseDate($chiusura) < $oggi) {
                        $skipped++;
                        continue;
                    }
                }

                $bando = $this->mapToBando($item);
                if ($bando) {
                    if ($soloEnti && !$this->isRivoltoEnte($bando['target'])) {
                        $skipped++;
                        continue;
                    } elseif (!$includiImprese && !$soloEnti && $this->isSoloImprese($bando['target'])) {
                        $skipped++;
                        continue;
                    }
                    $batch[] = $bando;
                    $imported++;

                    if (count($batch) >= 50) {
                        $this->insertBatch($batch);
                        $batch = [];
                        $this->output->write('.');
                    }
                }
            }

            if (!empty($batch)) $this->insertBatch($batch);
            $this->newLine();

            $filtroLabel = $soloEnti ? ' (solo enti pubblici)' : ($includiImprese ? '' : ' (escluse imprese private)');
            $this->info("✅ Importati: $imported incentivi{$filtroLabel}" . ($skipped ? ", $skipped saltati" : ''));
            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("❌ Errore: " . $e->getMessage());
            return self::FAILURE;
        }
    }

    private function mapToBando(array $item): ?array
    {
        // I campi Solr sono già rinominati con i nomi italiani leggibili (da aliases_file)
        $titolo = $this->scalar($item['Titolo'] ?? null);
        if (empty($titolo)) return null;

        $codice  = $this->scalar($item['ID_Incentivo'] ?? null);
        $desc    = $this->scalar($item['Descrizione'] ?? null);
        $obiett  = $this->scalar($item['Obiettivo_Finalita'] ?? null);
        $forma   = $this->scalar($item['Forma_agevolazione'] ?? null);
        $gestore = $this->scalar($item['Soggetto_Concedente'] ?? null);

        $scadenza   = $this->parseDate($this->scalar($item['Data_chiusura'] ?? null));
        $dataInizio = $this->parseDate($this->scalar($item['Data_apertura'] ?? null));

        $budgetRaw = $this->scalar($item['Stanziamento_incentivo'] ?? null);
        $budget    = $this->parseNumber($budgetRaw);

        $settoreArr = $item['Settore_Attivita'] ?? null;
        $settore    = is_array($settoreArr) ? implode(', ', $settoreArr) : $this->scalar($settoreArr);

        $regioniArr = $item['Regioni'] ?? null;
        $regioni    = is_array($regioniArr) ? $regioniArr : (is_string($regioniArr) ? [$regioniArr] : []);
        $regione    = empty($regioni) ? 'Nazionale' : implode(', ', $regioni);

        $targetArr  = $item['Tipologia_Soggetto'] ?? null;
        $target     = is_array($targetArr) ? implode(', ', $targetArr) : $this->scalar($targetArr);

        $url = $this->scalar($item['Link_istituzionale'] ?? null);

        [$comuneBando, $provinciaBando] = $this->estraiTerritorioConcedente($gestore);

        $descrizioneCompleta = trim(implode("\n\n", array_filter([
            $desc ? strip_tags($desc) : null,
            $obiett ? "Obiettivo: " . (is_array($obiett) ? implode(', ', $obiett) : $obiett) : null,
            $forma  ? "Forma agevolazione: $forma" : null,
            $gestore ? "Soggetto concedente: $gestore" : null,
        ])));

        return [
            'codice_esterno'     => $codice,
            'fonte'              => self::FONTE,
            'titolo'             => mb_substr($titolo, 0, 255),
            'descrizione'        => $this->truncaConEllissi($descrizioneCompleta),
            'url'                => $url ? mb_substr($url, 0, 255) : null,
            'categoria'          => $settore ? mb_substr($settore, 0, 255) : null,
            'livello'            => 'nazionale',
            'regione'            => mb_substr($regione, 0, 255),
            'provincia'          => $provinciaBando,
            'comune'             => $comuneBando,
            'target'             => $target ? mb_substr($target, 0, 255) : null,
            'budget_totale'      => $budget,
            'budget_min'         => $this->parseNumber($this->scalar($item['Spesa_Ammessa_min'] ?? null)),
            'budget_max'         => $this->parseNumber($this->scalar($item['Spesa_Ammessa_max'] ?? null)),
            'scadenza'           => $scadenza,
            'data_pubblicazione' => $dataInizio,
            'data_inizio'        => $dataInizio,
            'stato'              => $this->determinaStato($scadenza),
            'extra_data'         => json_encode($item, JSON_UNESCAPED_UNICODE),
        ];
    }

    /**
     * Restituisce true se il bando include esplicitamente enti pubblici tra i destinatari,
     * oppure se il target non è specificato (beneficio del dubbio).
     */
    private function isRivoltoEnte(?string $target): bool
    {
        if (empty($target)) return true; // target non specificato → aperto a tutti

        $t = strtolower($target);

        $keywordsEnte = [
            'ente pubblico', 'ente locale', 'enti locali', 'pubblica amministrazione',
            'comune', 'provincia', 'regione', 'università', 'ente di ricerca',
            'no profit', 'non profit', 'cooperativ', 'associaz', 'terzo settore',
            'fondazione', 'scuola', 'istituto',
        ];
        foreach ($keywordsEnte as $kw) {
            if (str_contains($t, $kw)) return true;
        }

        return false;
    }

    /**
     * Restituisce true se il bando è rivolto ESCLUSIVAMENTE a soggetti privati/imprese
     * (nessuna PA, ente locale, no-profit, università, ecc.).
     */
    private function isSoloImprese(?string $target): bool
    {
        if (empty($target)) return false;

        $t = strtolower($target);

        // Se contiene almeno una keyword "pubblica" → non è solo imprese
        $keywordsEnte = [
            'ente pubblico', 'ente locale', 'enti locali', 'pubblica amministrazione',
            'comune', 'provincia', 'regione', 'università', 'ente di ricerca',
            'no profit', 'non profit', 'cooperativ', 'associaz', 'terzo settore',
            'fondazione', 'scuola', 'istituto',
        ];
        foreach ($keywordsEnte as $kw) {
            if (str_contains($t, $kw)) return false;
        }

        // Contiene solo keyword "privato"?
        $keywordsImpresa = ['impresa', 'professionista', 'lavorator', 'persona fisica'];
        foreach ($keywordsImpresa as $kw) {
            if (str_contains($t, $kw)) return true;
        }

        return false; // target sconosciuto → tieni
    }

    /** Converte array Solr monovalutato o stringa → stringa, o null */
    private function scalar(mixed $v): ?string
    {
        if ($v === null || $v === '') return null;
        if (is_array($v)) return trim(implode(', ', array_filter($v))) ?: null;
        return trim((string) $v) ?: null;
    }

    private function findField(array $data, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (isset($data[$key]) && $data[$key] !== null && $data[$key] !== '') {
                return trim((string) $data[$key]);
            }
        }
        // Ricerca case-insensitive
        $dataLower = array_change_key_case($data, CASE_LOWER);
        foreach ($keys as $key) {
            $kl = strtolower($key);
            if (isset($dataLower[$kl]) && $dataLower[$kl] !== null && $dataLower[$kl] !== '') {
                return trim((string) $dataLower[$kl]);
            }
        }
        return null;
    }

    /**
     * Se il soggetto concedente è un Comune o una Provincia specifica (es. "Comune di Camastra"),
     * il fondo è amministrato e riservato a quel territorio — non è un bando regionale/nazionale
     * aperto a tutti gli enti della regione. "Provincia Autonoma di Trento/Bolzano" è esclusa
     * perché ha un ruolo di governo regionale, non di ente locale singolo.
     */
    private function estraiTerritorioConcedente(?string $gestore): array
    {
        if (empty($gestore)) return [null, null];
        $gestore = trim($gestore);

        if (preg_match('/^Comune di (.+)$/ui', $gestore, $m)) {
            return [trim($m[1]), null];
        }
        if (preg_match('/^Provincia di (.+)$/ui', $gestore, $m)) {
            return [null, trim($m[1])];
        }

        return [null, null];
    }

    /**
     * I campi budget di Solr (zs_field_budget_allocation, zs_field_cost_min/max) sono già
     * numeri in formato standard (punto decimale, nessun separatore migliaia) — non testo
     * italiano da normalizzare.
     */
    private function parseNumber(?string $value): ?float
    {
        if (empty($value)) return null;
        $v = trim($value);
        return is_numeric($v) ? (float) $v : null;
    }

    /**
     * Tronca a $max caratteri sull'ultimo confine di parola invece di tagliare a metà
     * (mb_substr secco lasciava frasi mozzate tipo "...gli interventi p") e aggiunge "…".
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
        $value = trim($value);
        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'Y/m/d', 'd.m.Y'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, $value);
            if ($d) return $d->format('Y-m-d');
        }
        // Gestisce formati ISO con ora (2025-12-31T00:00:00)
        if (preg_match('/^(\d{4}-\d{2}-\d{2})/', $value, $m)) {
            return $m[1];
        }
        $ts = strtotime($value);
        return $ts ? date('Y-m-d', $ts) : null;
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
                ['titolo', 'descrizione', 'scadenza', 'stato', 'budget_totale', 'budget_min', 'budget_max',
                 'regione', 'provincia', 'comune', 'target', 'categoria', 'extra_data']
            );
        } catch (\Exception $e) {
            $this->warn('⚠️ Batch insert fallito: ' . $e->getMessage());
            foreach ($batch as $record) {
                try { BandoImportato::create($record); } catch (\Exception) {}
            }
        }
    }
}
