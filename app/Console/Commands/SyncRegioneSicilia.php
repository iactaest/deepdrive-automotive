<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\BandoImportato;

class SyncRegioneSicilia extends Command
{
    protected $signature = 'bandi:sync-regione-sicilia
                            {--dataset= : Sincronizza solo un dataset specifico}
                            {--limit=10 : Numero massimo di dataset da processare}
                            {--keep-files : Mantiene i file scaricati per debug}';
    
    protected $description = 'Sincronizza bandi e avvisi dal portale open data della Regione Siciliana (CKAN)';

    // Lista di parole chiave per identificare dataset rilevanti
    private $keywords = [
        'bandi', 'avvisi', 'finanziamenti', 'contributi', 'gare', 'appalti',
        'agevolazioni', 'incentivi', 'sostegno', 'fondi', 'pnrr'
    ];

    public function handle()
    {
        $this->info('🔄 Sincronizzazione dataset Regione Siciliana...');

        // 1. Ottieni la lista dei dataset
        $response = Http::get('https://dati.regione.sicilia.it/api/3/action/package_list');
        
        if (!$response->successful()) {
            $this->error('❌ Impossibile ottenere la lista dei dataset');
            return;
        }

        $packages = $response->json('result') ?? [];
        $this->info("📊 Trovati " . count($packages) . " dataset totali");

        // 2. Filtra i dataset rilevanti
        $relevantPackages = $this->filterRelevantPackages($packages);
        $this->info("📊 Dataset rilevanti: " . count($relevantPackages));

        // 3. Se specificato un dataset, processa solo quello
        if ($this->option('dataset')) {
            $datasetName = $this->option('dataset');
            if (in_array($datasetName, $packages)) {
                $this->processDataset($datasetName);
            } else {
                $this->error("❌ Dataset '$datasetName' non trovato");
            }
            return;
        }

        // 4. Processa i dataset rilevanti
        $limit = (int)$this->option('limit');
        $processed = 0;
        $imported = 0;

        foreach ($relevantPackages as $packageName) {
            if ($processed >= $limit) {
                break;
            }

            $this->info("📥 Processando: $packageName");
            $count = $this->processDataset($packageName);
            $imported += $count;
            $processed++;

            // Rispetta il rate limit
            sleep(1);
        }

        $this->info("✅ Sincronizzazione completata!");
        $this->info("📊 Dataset processati: $processed");
        $this->info("📊 Bandi importati: $imported");
    }

    private function filterRelevantPackages($packages)
    {
        return array_filter($packages, function ($name) {
            $nameLower = strtolower($name);
            foreach ($this->keywords as $keyword) {
                if (str_contains($nameLower, $keyword)) {
                    return true;
                }
            }
            return false;
        });
    }

    private function processDataset($packageName)
    {
        $this->info("📥 Ottenendo dettagli per: $packageName");

        $response = Http::get("https://dati.regione.sicilia.it/api/3/action/package_show?id={$packageName}");
        
        if (!$response->successful()) {
            $this->warn("⚠️ Impossibile ottenere dettagli per: $packageName");
            return 0;
        }

        $package = $response->json('result');
        
        if (!$package) {
            return 0;
        }

        // Estrai le risorse (file)
        $resources = $package['resources'] ?? [];
        
        if (empty($resources)) {
            $this->warn("⚠️ Nessuna risorsa trovata per: $packageName");
            return 0;
        }

        $this->info("📊 Trovate " . count($resources) . " risorse");

        $count = 0;
        foreach ($resources as $resource) {
            // Cerca file CSV o JSON
            $format = strtolower($resource['format'] ?? '');
            $url = $resource['url'] ?? null;

            if (!$url) {
                continue;
            }

            if (in_array($format, ['csv', 'json', 'xlsx', 'xls'])) {
                $this->info("📥 Importando risorsa: " . ($resource['name'] ?? 'unnamed'));
                $count += $this->importResource($url, $format, $packageName);
            }
        }

        return $count;
    }

    private function importResource($url, $format, $source)
    {
        try {
            $response = Http::timeout(60)->get($url);
            
            if (!$response->successful()) {
                $this->warn("⚠️ Impossibile scaricare: $url");
                return 0;
            }

            $data = $response->body();
            
            // Salva il file localmente per elaborazione
            $timestamp = time();
            $path = storage_path("app/temp_{$source}_{$timestamp}.$format");
            file_put_contents($path, $data);

            $this->info("✅ Scaricato: " . basename($path));

            // Processa in base al formato
            $count = 0;
            if ($format === 'csv') {
                $count = $this->importCsv($path, $source);
            } elseif ($format === 'json') {
                $count = $this->importJson($path, $source);
            }

            // Pulisci file temporaneo SOLO se non è richiesto di mantenerli
            if (!$this->option('keep-files')) {
                @unlink($path);
            }

            return $count;

        } catch (\Exception $e) {
            $this->warn("⚠️ Errore importazione: " . $e->getMessage());
            return 0;
        }
    }

    private function importCsv($path, $source)
    {
        $this->info("📊 Importazione CSV da: $source");
        
        if (!file_exists($path)) {
            return 0;
        }
        
        // Leggi le prime righe per capire il formato
        $content = file_get_contents($path);
        $lines = explode("\n", $content);
        $firstLine = $lines[0] ?? '';
        
        // Determina il separatore
        $separator = ';';
        if (str_contains($firstLine, ',')) {
            $separator = ',';
        }
        
        $this->info("📋 Separatore rilevato: '$separator'");
        
        $handle = fopen($path, 'r');
        if (!$handle) {
            return 0;
        }
        
        // Leggi intestazione
        $headers = fgetcsv($handle, 0, $separator);
        if (!$headers) {
            fclose($handle);
            return 0;
        }
        
        // Pulisci header
        $headers = array_map(function($h) {
            $h = trim($h);
            $h = preg_replace('/^\xEF\xBB\xBF/', '', $h); // Rimuovi BOM
            return $h;
        }, $headers);
        
        $this->info("📋 Colonne trovate: " . count($headers));
        $this->info("📋 Prime 5 colonne: " . implode(', ', array_slice($headers, 0, 5)));
        
        // Mostra tutte le colonne per debug
        $this->info("📋 Tutte le colonne:");
        foreach ($headers as $index => $header) {
            $this->info("   [$index] $header");
        }
        
        $count = 0;
        $batch = [];
        $batchSize = 100;
        $rowNumber = 0;
        
        while (($row = fgetcsv($handle, 0, $separator)) !== false) {
            $rowNumber++;
            
            // Salta righe vuote
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Se il numero di colonne non corrisponde, salta
            if (count($row) !== count($headers)) {
                continue;
            }
            
            try {
                // Crea array associativo
                $data = array_combine($headers, $row);
                if (!$data) continue;
                
                // Debug: mostra la prima riga di dati
                if ($count === 0 && $rowNumber === 1) {
                    $this->info("📋 Esempio di dati: " . json_encode(array_slice($data, 0, 5)));
                }
                
                // Mappa al bando
                $bando = $this->mapToBando($data, $source);
                if ($bando) {
                    $batch[] = $bando;
                    $count++;
                    
                    if (count($batch) >= $batchSize) {
                        $this->insertBatch($batch);
                        $batch = [];
                    }
                }
            } catch (\Exception $e) {
                $this->warn("⚠️ Errore riga $rowNumber: " . $e->getMessage());
            }
        }
        
        // Inserisci ultimo batch
        if (!empty($batch)) {
            $this->insertBatch($batch);
        }
        
        fclose($handle);
        
        $this->info("✅ Importati $count record da: $source");
        return $count;
    }

    private function importJson($path, $source)
    {
        $this->info("📊 Importazione JSON da: $source");
        
        if (!file_exists($path)) {
            return 0;
        }
        
        $content = file_get_contents($path);
        $data = json_decode($content, true);
        
        if (empty($data)) {
            $this->warn("⚠️ Nessun dato JSON trovato");
            return 0;
        }
        
        // Determina la struttura dei dati
        $items = [];
        
        // Se è un array di oggetti
        if (is_array($data) && isset($data[0]) && is_array($data[0])) {
            $items = $data;
        }
        // Se ha un campo 'data' che contiene l'array
        elseif (isset($data['data']) && is_array($data['data'])) {
            $items = $data['data'];
        }
        // Se è un oggetto singolo
        elseif (is_array($data) && !isset($data[0])) {
            $items = [$data];
        }
        // Se è una stringa (es. JSON malformato o con BOM)
        else {
            $this->warn("⚠️ Struttura JSON non riconosciuta, provo a decodificare come stringa");
            try {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $items = $decoded;
                } else {
                    $items = [];
                }
            } catch (\Exception $e) {
                $items = [];
            }
        }
        
        // Se items è vuoto o non è un array, prova a forzare
        if (empty($items) || !is_array($items)) {
            $this->warn("⚠️ Impossibile estrarre dati dal JSON");
            $this->warn("📋 Primi 500 caratteri: " . substr($content, 0, 500));
            return 0;
        }
        
        $this->info("📋 Trovati " . count($items) . " elementi");
        
        $count = 0;
        $batch = [];
        $batchSize = 100;
        
        foreach ($items as $item) {
            if (!is_array($item)) {
                continue;
            }
            try {
                $bando = $this->mapToBando($item, $source);
                if ($bando) {
                    $batch[] = $bando;
                    $count++;
                    
                    if (count($batch) >= $batchSize) {
                        $this->insertBatch($batch);
                        $batch = [];
                    }
                }
            } catch (\Exception $e) {
                $this->warn("⚠️ Errore importazione: " . $e->getMessage());
            }
        }
        
        if (!empty($batch)) {
            $this->insertBatch($batch);
        }
        
        $this->info("✅ Importati $count record da: $source");
        return $count;
    }

  private function mapToBando($data, $source)
{
    // Cerca il titolo
    $titolo = $this->findField($data, [
        'titolo', 'nome', 'denominazione', 'oggetto', 'descrizione', 
        'title', 'name', 'Titolo', 'Nome', 'Denominazione',
        'sovvenzione', 'contributo', 'bando',
        'BENEFICIARIO'
    ]);
    
    if (empty($titolo)) {
        return null;
    }
    
    // Cerca la scadenza
    $scadenza = $this->findField($data, [
        'scadenza', 'data_scadenza', 'termine', 'data_termine', 
        'deadline', 'Data_scadenza', 'DataTermine',
        'DATA_PUBBLICAZIONE', 'DATA'
    ]);
    if ($scadenza) {
        $scadenza = date('Y-m-d', strtotime($scadenza));
    }
    
    // Cerca l'importo
    $importo = $this->findField($data, [
        'importo', 'budget', 'stanziamento', 'finanziamento', 
        'amount', 'budget_totale', 'Importo',
        'IMPORTO_N', 'IMPORTO'
    ]);
    $importo = $this->parseNumber($importo);
    
    // Cerca il codice esterno
    $codiceEsterno = $this->findField($data, [
        'id', 'codice', 'code', 'ID',
        'NUMPROVVEDIMENTO'
    ]);
    
    // Cerca la regione
    $regione = $this->findField($data, [
        'regione', 'territorio', 'area', 'region'
    ]);
    if (empty($regione)) {
        $regione = 'Sicilia';
    }
    
    // Cerca provincia e comune
    $provincia = $this->findField($data, ['provincia', 'Provincia']);
    $comune = $this->findField($data, ['comune', 'Comune', 'citta', 'Citta']);
    
    // Cerca il tema/categoria
    $tema = $this->findField($data, [
        'tema', 'categoria', 'settore', 'area_tematica', 
        'tipo', 'category', 'Tema',
        'NORMA'
    ]);
    
    // Cerca il target (beneficiario)
    $target = $this->findField($data, [
        'target', 'beneficiario', 'destinatari', 'soggetto',
        'BENEFICIARIO'
    ]);
    
    // Cerca l'URL
    $url = $this->findField($data, [
        'url', 'link', 'sito', 'source', 'fonte', 'URL'
    ]);
    
    // Cerca la descrizione
    $descrizione = $this->findField($data, [
        'descrizione', 'note', 'dettagli', 'desc', 'description',
        'Descrizione', 'Note', 'Oggetto',
        'UFFICIO', 'RESPONSABILE'
    ]);
    
    // Determina il livello
    $livello = 'regionale';
    
    // Determina lo stato
    $stato = $this->determinaStato($scadenza);
    
    return [
        'codice_esterno' => $codiceEsterno ?: null,
        'fonte' => 'regione_sicilia_' . $source,
        'titolo' => substr($titolo, 0, 255),
        'descrizione' => $descrizione ? substr($descrizione, 0, 2000) : null,
        'url' => $url ? substr($url, 0, 255) : null,
        'categoria' => $tema ? substr($tema, 0, 255) : null,
        'tema' => null,
        'livello' => $livello,
        'regione' => substr($regione, 0, 255),
        'provincia' => $provincia ? substr($provincia, 0, 255) : null,
        'comune' => $comune ? substr($comune, 0, 255) : null,
        'target' => $target ? substr($target, 0, 255) : null,
        'budget_totale' => $importo,
        'budget_min' => $importo,
        'budget_max' => $importo,
        'scadenza' => $scadenza,
        'data_pubblicazione' => null,
        'data_inizio' => null,
        'stato' => $stato,
        'extra_data' => json_encode($data),
    ];
}

    private function findField($data, $keys)
    {
        foreach ($keys as $key) {
            if (isset($data[$key]) && !empty($data[$key]) && $data[$key] !== 'null') {
                return trim($data[$key]);
            }
            // Cerca anche in case-insensitive
            foreach ($data as $k => $v) {
                if (is_string($k) && strtolower($k) === strtolower($key) && !empty($v) && $v !== 'null') {
                    return trim($v);
                }
            }
        }
        return null;
    }

    private function parseNumber($value)
    {
        if (empty($value) || $value === 'null') {
            return null;
        }
        $value = trim($value);
        $value = str_replace('.', '', $value);
        $value = str_replace(',', '.', $value);
        $value = preg_replace('/[^0-9.]/', '', $value);
        return floatval($value);
    }

    private function determinaStato($scadenza)
    {
        if (!$scadenza) {
            return 'aperto';
        }
        try {
            $diff = now()->diffInDays($scadenza);
            if ($diff < 0) return 'chiuso';
            if ($diff < 30) return 'in_scadenza';
            return 'aperto';
        } catch (\Exception $e) {
            return 'aperto';
        }
    }

  private function insertBatch($batch)
{
    try {
        BandoImportato::insert($batch);
    } catch (\Exception $e) {
        $this->warn('⚠️ Errore batch: ' . $e->getMessage());
    }
}
}