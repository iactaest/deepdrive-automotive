<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

class SyncRegioneSicilia extends Command
{
    protected $signature = 'bandi:sync-regione-sicilia
                            {--dataset= : Sincronizza solo un dataset specifico (ID o slug)}
                            {--limit=30 : Numero massimo di dataset da processare}
                            {--rows=100 : Risultati per pagina nella package_search}
                            {--keep-files : Mantiene i file scaricati per debug}';

    protected $description = 'Sincronizza bandi e finanziamenti dal portale open data della Regione Siciliana (CKAN)';

    // Termini di ricerca per trovare dataset di bandi/finanziamenti
    private array $searchTerms = [
        'bandi', 'finanziamento', 'finanziamenti', 'contributi',
        'agevolazioni', 'fondi', 'PNRR', 'sovvenzione', 'incentivi',
    ];

    // Pattern da escludere — dataset meteo/ambientali/civili che matchano per errore
    private array $excludePatterns = [
        'meteo', 'allerta', 'sismico', 'sismica', 'idrogeologico', 'idrogeologica',
        'incendi', 'fuochi', 'vulcanico', 'vulcano', 'protezione-civile',
        'protezione_civile', 'rifiuti', 'qualita-aria', 'qualita_aria',
        'rete-stradale', 'rete_stradale', 'catasto', 'cartografia',
        'rischio', 'pericolosita', 'zoonosi', 'fitosanitari',
        'precipitazioni', 'temperatura', 'vento', 'mareggiate',
    ];

    // Whitelist di dataset ID noti contenenti bandi/finanziamenti
    private array $whitelistIds = [
        '0959a9ad-6010-442c-bec2-77c5d8080679', // Progetti finanziati ricerca finalizzata
    ];

    public function handle(): void
    {
        $this->info('🔄 Sincronizzazione bandi Regione Siciliana (CKAN)...');

        if ($this->option('dataset')) {
            $count = $this->processDataset($this->option('dataset'));
            $this->info("✅ Importati $count bandi.");
            return;
        }

        $datasets = $this->findGrantDatasets();
        $this->info("📊 Dataset grant rilevanti trovati: " . count($datasets));

        $limit = (int) $this->option('limit');
        $imported = 0;
        $processed = 0;

        foreach ($datasets as $id) {
            if ($processed >= $limit) break;

            $this->info("📥 Processando: $id");
            $imported += $this->processDataset($id);
            $processed++;
            sleep(1);
        }

        $this->info("✅ Completato — Dataset: $processed, Bandi importati: $imported");
    }

    /**
     * Cerca i dataset rilevanti via package_search (invece del vecchio package_list generico).
     * Per ogni termine di ricerca fa una chiamata separata, poi deuplica i risultati.
     */
    private function findGrantDatasets(): array
    {
        $ids = $this->whitelistIds;
        $rows = (int) $this->option('rows');

        foreach ($this->searchTerms as $term) {
            $response = Http::timeout(30)->get(
                'https://dati.regione.sicilia.it/api/3/action/package_search',
                ['q' => $term, 'rows' => $rows]
            );

            if (!$response->successful()) {
                $this->warn("⚠️ Ricerca fallita per termine: $term");
                continue;
            }

            $results = $response->json('result.results') ?? [];

            foreach ($results as $package) {
                $id = $package['id'] ?? $package['name'] ?? null;
                if (!$id) continue;

                $name = strtolower($package['name'] ?? $id);
                $title = strtolower($package['title'] ?? '');

                if ($this->isExcluded($name, $title)) continue;

                if (!in_array($id, $ids)) {
                    $ids[] = $id;
                }
            }

            sleep(1); // rispetta rate limit
        }

        return array_unique($ids);
    }

    private function isExcluded(string $name, string $title): bool
    {
        foreach ($this->excludePatterns as $pattern) {
            if (str_contains($name, $pattern) || str_contains($title, $pattern)) {
                return true;
            }
        }
        return false;
    }

    private function processDataset(string $datasetId): int
    {
        $response = Http::timeout(30)->get(
            'https://dati.regione.sicilia.it/api/3/action/package_show',
            ['id' => $datasetId]
        );

        if (!$response->successful()) {
            $this->warn("⚠️ Impossibile ottenere dettagli per: $datasetId");
            return 0;
        }

        $package = $response->json('result');
        if (!$package) return 0;

        $resources = $package['resources'] ?? [];
        if (empty($resources)) {
            $this->warn("⚠️ Nessuna risorsa in: $datasetId");
            return 0;
        }

        $count = 0;
        foreach ($resources as $resource) {
            $format = strtolower($resource['format'] ?? '');
            $url    = $resource['url'] ?? null;
            if (!$url || !in_array($format, ['csv', 'json', 'xlsx', 'xls'])) continue;

            $this->info("  📥 Risorsa: " . ($resource['name'] ?? 'unnamed') . " ($format)");
            $count += $this->importResource($url, $format, $datasetId);
        }

        return $count;
    }

    private function importResource(string $url, string $format, string $source): int
    {
        try {
            $response = Http::timeout(60)->get($url);
            if (!$response->successful()) {
                $this->warn("⚠️ Download fallito: $url");
                return 0;
            }

            $timestamp = time();
            $path = storage_path("app/temp_{$source}_{$timestamp}.$format");
            file_put_contents($path, $response->body());

            $count = match ($format) {
                'csv'  => $this->importCsv($path, $source),
                'json' => $this->importJson($path, $source),
                default => 0,
            };

            if (!$this->option('keep-files')) {
                @unlink($path);
            }

            return $count;
        } catch (\Exception $e) {
            $this->warn("⚠️ Errore import: " . $e->getMessage());
            return 0;
        }
    }

    private function importCsv(string $path, string $source): int
    {
        $handle = fopen($path, 'r');
        if (!$handle) return 0;

        // Rileva BOM UTF-8 e separatore
        $firstLine = fgets($handle);
        $firstLine = ltrim($firstLine, "\xEF\xBB\xBF");
        $separator = str_contains($firstLine, ';') ? ';' : ',';
        rewind($handle);

        $headers = fgetcsv($handle, 0, $separator);
        if (!$headers) { fclose($handle); return 0; }

        $headers = array_map(fn ($h) => trim(ltrim($h, "\xEF\xBB\xBF")), $headers);

        $count = 0;
        $batch = [];
        $row = 0;

        while (($line = fgetcsv($handle, 0, $separator)) !== false) {
            $row++;
            if (empty(array_filter($line)) || count($line) !== count($headers)) continue;

            $data = array_combine($headers, $line);
            if (!$data) continue;

            $bando = $this->mapToBando($data, $source);
            if ($bando) {
                $batch[] = $bando;
                $count++;
                if (count($batch) >= 100) {
                    $this->insertBatch($batch);
                    $batch = [];
                }
            }
        }

        if (!empty($batch)) $this->insertBatch($batch);
        fclose($handle);

        $this->info("  ✅ CSV: $count record importati");
        return $count;
    }

    private function importJson(string $path, string $source): int
    {
        $content = file_get_contents($path);
        $data    = json_decode($content, true);
        if (empty($data)) return 0;

        $items = match (true) {
            isset($data[0]) && is_array($data[0]) => $data,
            isset($data['data']) && is_array($data['data']) => $data['data'],
            is_array($data) => [$data],
            default => [],
        };

        $count = 0;
        $batch = [];

        foreach ($items as $item) {
            if (!is_array($item)) continue;
            $bando = $this->mapToBando($item, $source);
            if ($bando) {
                $batch[] = $bando;
                $count++;
                if (count($batch) >= 100) {
                    $this->insertBatch($batch);
                    $batch = [];
                }
            }
        }

        if (!empty($batch)) $this->insertBatch($batch);
        $this->info("  ✅ JSON: $count record importati");
        return $count;
    }

    private function mapToBando(array $data, string $source): ?array
    {
        // — Righe di trasparenza L.190/monitoraggio progetti (registro erogazioni già
        // effettuate, non bandi) — Diversi schemi osservati sul portale CKAN: "Amministrazione
        // Trasparente" (NORMA/INDIVIDUAZIONE/BENEFICIARIO/DATI_FISCALI) e "monitoraggio
        // unitario progetti" (Cup/CodiceLocaleIntervento/DenominazioneBeneficiario). In
        // entrambi i casi la riga descrive un pagamento già avvenuto a un beneficiario
        // specifico, non un'opportunità a cui candidarsi — va scartata a prescindere da cosa
        // cita come base legale: quasi sempre citano proprio "Avviso pubblico ..." come atto
        // che ha originato il pagamento, quindi un filtro sul contenuto di quel campo non basta.
        $chiaviTrasparenza = ['norma', 'individuazione', 'beneficiario', 'dati_fiscali', 'cup', 'codicelocaleintervento', 'denominazionebeneficiario'];
        $chiaviPresenti    = array_map('strtolower', array_keys($data));
        if (array_intersect($chiaviTrasparenza, $chiaviPresenti)) {
            return null;
        }

        // Cerca il titolo con supporto per formati CKAN siciliani
        $titolo = $this->findField($data, [
            'titolo', 'nome', 'denominazione', 'oggetto', 'title', 'name',
            'Titolo', 'Nome', 'sovvenzione', 'bando',
        ]);

        if (empty($titolo)) return null;

        $scadenza = $this->findField($data, [
            'scadenza', 'data_scadenza', 'termine', 'deadline', 'DataTermine', 'DATA',
        ]);
        $scadenza = $scadenza ? $this->parseDate($scadenza) : null;

        $importo = $this->parseNumber($this->findField($data, [
            'importo', 'budget', 'stanziamento', 'finanziamento', 'amount',
            'IMPORTO_N', 'IMPORTO',
        ]));

        $codice = $this->findField($data, ['id', 'codice', 'code', 'ID']);
        // Se non c'è codice univoco, crea uno slug dal titolo (evita duplicati su re-sync)
        if (empty($codice)) {
            $codice = 'rs_' . substr(md5($titolo), 0, 12);
        }

        $tema   = $this->findField($data, ['tema', 'categoria', 'settore', 'area_tematica', 'tipo']);
        $target = $this->findField($data, ['destinatari', 'soggetto_ammissibile', 'beneficiari_ammissibili']);
        $url    = $this->findField($data, ['url', 'link', 'sito', 'fonte', 'URL']);
        $ufficio = $this->findField($data, ['UFFICIO', 'ufficio', 'descrizione', 'description', 'Descrizione']);

        return [
            'codice_esterno'     => $codice,
            'fonte'              => 'regione_sicilia',
            'titolo'             => mb_substr($titolo, 0, 255),
            'descrizione'        => $ufficio ? mb_substr($ufficio, 0, 2000) : null,
            'url'                => $url ? mb_substr($url, 0, 255) : null,
            'categoria'          => $tema ? mb_substr($tema, 0, 255) : null,
            'livello'            => 'regionale',
            'regione'            => 'Sicilia',
            'target'             => $target ? mb_substr($target, 0, 255) : null,
            'budget_totale'      => $importo,
            'budget_min'         => $importo,
            'budget_max'         => $importo,
            'scadenza'           => $scadenza,
            'data_pubblicazione' => null,
            'data_inizio'        => null,
            'stato'              => $this->determinaStato($scadenza),
            'extra_data'         => json_encode($data, JSON_UNESCAPED_UNICODE),
        ];
    }

    private function findField(array $data, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (!empty($data[$key]) && $data[$key] !== 'null') {
                return trim((string) $data[$key]);
            }
        }
        // Ricerca case-insensitive come fallback
        foreach ($keys as $key) {
            foreach ($data as $k => $v) {
                if (is_string($k) && strtolower($k) === strtolower($key) && !empty($v) && $v !== 'null') {
                    return trim((string) $v);
                }
            }
        }
        return null;
    }

    private function parseNumber(?string $value): ?float
    {
        if (empty($value) || $value === 'null') return null;
        $value = str_replace(['.', ' '], ['', ''], trim($value));
        $value = str_replace(',', '.', $value);
        $value = preg_replace('/[^0-9.]/', '', $value);
        return empty($value) ? null : (float) $value;
    }

    private function parseDate(?string $value): ?string
    {
        if (empty($value)) return null;
        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y', 'm/d/Y'] as $fmt) {
            $d = \DateTime::createFromFormat($fmt, trim($value));
            if ($d) return $d->format('Y-m-d');
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
                ['titolo', 'descrizione', 'scadenza', 'stato', 'budget_totale', 'extra_data']
            );
        } catch (\Exception $e) {
            $this->warn('⚠️ Batch insert fallito: ' . $e->getMessage());
            foreach ($batch as $record) {
                try { BandoImportato::create($record); } catch (\Exception) {}
            }
        }
    }
}
