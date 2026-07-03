<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use App\Models\ProgettoOpenCoesione;

class SyncOpenCoesione extends Command
{
    protected $signature = 'bandi:sync-opencoesione
                            {--regione= : Scarica solo il dataset di una regione (es. Sicilia) invece del dataset nazionale completo}
                            {--nazionale : Usa il dataset nazionale completo (252,6 MB) invece del default regionale}';

    protected $description = 'Scarica e importa progetti storici finanziati da OpenCoesione (dataset pubblico, per contesto statistico enti)';

    // Sigle regione usate nei nomi file OpenCoesione (https://opencoesione.gov.it/it/opendata/)
    private const SIGLE_REGIONE = [
        'valle d\'aosta'  => 'VDA', 'piemonte'        => 'PIE', 'lombardia'  => 'LOM',
        'trentino-alto adige' => 'TN_BZ', 'veneto'    => 'VEN', 'friuli-venezia giulia' => 'FVG',
        'liguria'         => 'LIG', 'emilia-romagna'  => 'EMR', 'toscana'    => 'TOS',
        'umbria'          => 'UMB', 'marche'          => 'MAR', 'lazio'      => 'LAZ',
        'abruzzo'         => 'ABR', 'campania'        => 'CAM', 'molise'     => 'MOL',
        'puglia'          => 'PUG', 'calabria'        => 'CAL', 'basilicata' => 'BAS',
        'sicilia'         => 'SIC', 'sardegna'        => 'SAR',
    ];

    public function handle()
    {
        $this->info('🔄 Avvio sincronizzazione OpenCoesione...');

        // Il dataset nazionale (252,6 MB) è sovradimensionato per un ente che opera su una sola
        // regione: di default si scarica il dataset regionale (~10-80 MB a seconda della regione).
        if ($this->option('nazionale')) {
            $url = 'https://opencoesione.gov.it/it/opendata/progetti_esteso.zip';
            $this->info('📦 Usando dataset NAZIONALE (252,6 MB)');
        } else {
            $regione = $this->option('regione') ?: 'Sicilia';
            $sigla   = self::SIGLE_REGIONE[strtolower($regione)] ?? null;
            if (!$sigla) {
                $this->error("❌ Regione non riconosciuta: $regione");
                return self::FAILURE;
            }
            $url = "https://opencoesione.gov.it/it/opendata/regioni/progetti_esteso_{$sigla}.zip";
            $this->info("📦 Usando dataset REGIONALE ($regione)");
        }

        $this->info("📥 Download dataset da: $url");
        
        try {
            // Aumenta il timeout per file grandi
            $response = Http::timeout(600)->get($url);
            
            if ($response->successful()) {
                $zipPath = storage_path('app/dataset.zip');
                file_put_contents($zipPath, $response->body());
                
                $size = round(filesize($zipPath) / 1024 / 1024, 2);
                $this->info("✅ Download completato! ({$size} MB)");
                
                // Estrai lo zip
                $zip = new ZipArchive();
                if ($zip->open($zipPath) === true) {
                    $extractPath = storage_path('app/dataset');
                    
                    // Crea la cartella se non esiste
                    if (!is_dir($extractPath)) {
                        mkdir($extractPath, 0777, true);
                    }
                    
                    $zip->extractTo($extractPath);
                    $zip->close();
                    $this->info('✅ File estratto in: ' . $extractPath);
                    
                    // Leggi il file CSV
                    $csvFiles = glob($extractPath . '/*.csv');
                    if (!empty($csvFiles)) {
                        $csvFile = $csvFiles[0];
                        $this->info('📊 CSV trovato: ' . basename($csvFile));
                        $this->info('📊 Dimensione: ' . round(filesize($csvFile) / 1024 / 1024, 2) . ' MB');
                        
                        // Importa i dati nel database
                        $this->importCsv($csvFile);
                    } else {
                        $this->error('❌ Nessun file CSV trovato');
                    }
                    
                    // Pulisci i file temporanei
                    unlink($zipPath);
                    $this->cleanupDirectory($extractPath);
                    
                } else {
                    $this->error('❌ Impossibile estrarre lo zip');
                }
            } else {
                $this->error("❌ Download fallito (status: " . $response->status() . ")");
            }
        } catch (\Exception $e) {
            $this->error("❌ Errore: " . $e->getMessage());
        }
        
        $this->info('✅ Sincronizzazione completata!');
    }

    /**
     * Importa i dati dal CSV nel database
     */
    private function importCsv($csvPath)
    {
        $this->info('📊 Inizio importazione dati nel database...');
        
        // Verifica che il file esista
        if (!file_exists($csvPath)) {
            $this->error('❌ File CSV non trovato: ' . $csvPath);
            return;
        }
        
        // Apri il file CSV
        if (($handle = fopen($csvPath, 'r')) === false) {
            $this->error('❌ Impossibile aprire il file CSV');
            return;
        }
        
        // Leggi l'intestazione (prima riga)
        $headers = fgetcsv($handle, 0, ';');
        if ($headers === false) {
            $this->error('❌ Impossibile leggere l\'intestazione del CSV');
            fclose($handle);
            return;
        }
        
        $this->info('📋 Colonne trovate: ' . count($headers));
        $this->info('📋 Prime 5 colonne: ' . implode(', ', array_slice($headers, 0, 5)));
        
        $count = 0;
        $errorCount = 0;
        $batchSize = 500;
        $batch = [];
        $startTime = microtime(true);
        
        $this->info('⏳ Inizio importazione...');
        
        // Mostra progresso ogni 1000 record
        $progressStep = 1000;
        $nextProgress = $progressStep;
        
        while (($row = fgetcsv($handle, 0, ';')) !== false) {
            // Salta righe vuote
            if (empty(array_filter($row))) {
                continue;
            }
            
            // Se il numero di colonne non corrisponde, salta la riga
            if (count($row) !== count($headers)) {
                $errorCount++;
                continue;
            }
            
            try {
                // Crea un array associativo [nome_colonna => valore]
                $data = array_combine($headers, $row);
                if ($data === false) {
                    $errorCount++;
                    continue;
                }
                
                // Mappa i campi del CSV ai campi del database
                $progetto = $this->mapCsvToDatabase($data);
                
                if ($progetto && !empty($progetto['oc_codice_progetto'])) {
                    $batch[] = $progetto;
                    $count++;
                    
                    // Inserisci il batch quando raggiunge la dimensione
                    if (count($batch) >= $batchSize) {
                        $this->insertBatch($batch);
                        $batch = [];
                        
                        // Mostra progresso
                        if ($count >= $nextProgress) {
                            $elapsed = round(microtime(true) - $startTime, 2);
                            $this->info("📝 Inseriti $count progetti... (tempo: {$elapsed}s)");
                            $nextProgress += $progressStep;
                        }
                    }
                } else {
                    $errorCount++;
                }
            } catch (\Exception $e) {
                $errorCount++;
                if ($errorCount < 10) {
                    $this->warn("⚠️ Errore riga " . ($count + $errorCount) . ": " . $e->getMessage());
                }
            }
        }
        
        // Inserisci l'ultimo batch
        if (!empty($batch)) {
            $this->insertBatch($batch);
        }
        
        fclose($handle);
        
        $elapsed = round(microtime(true) - $startTime, 2);
        $this->info("✅ Importazione completata!");
        $this->info("📊 $count progetti inseriti correttamente");
        if ($errorCount > 0) {
            $this->warn("⚠️ $errorCount righe saltate per errori");
        }
        $this->info("⏱️ Tempo totale: {$elapsed} secondi");
    }

    /**
     * Inserisci un batch di record nel database
     */
    private function insertBatch($batch)
    {
        try {
            ProgettoOpenCoesione::insert($batch);
        } catch (\Exception $e) {
            // Se il batch fallisce, prova uno per uno
            $this->warn('⚠️ Batch fallito, inserimento uno per uno...');
            foreach ($batch as $record) {
                try {
                    ProgettoOpenCoesione::create($record);
                } catch (\Exception $e) {
                    // Ignora errori di duplicati
                }
            }
        }
    }

    /**
     * Mappa i dati dal CSV ai campi del database. Nomi colonna aggiornati al tracciato
     * record corrente di OpenCoesione (verificato scaricando il dataset reale) — i nomi
     * originali (OC_CODICE_PROGETTO, OC_REGIONE, OC_IMPORTO, ecc.) non esistono più.
     */
    private function mapCsvToDatabase($data)
    {
        $dataFine = $data['OC_DATA_FINE_PROGETTO_EFFETTIVA'] ?? null;
        if (empty($dataFine)) {
            $dataFine = $data['OC_DATA_FINE_PROGETTO_PREVISTA'] ?? null;
        }

        return [
            'oc_titolo_progetto' => $this->cleanString($data['OC_TITOLO_PROGETTO'] ?? null),
            'oc_codice_progetto' => $this->cleanString($data['COD_LOCALE_PROGETTO'] ?? null),
            'oc_regione' => $this->cleanString($data['DEN_REGIONE'] ?? null),
            'oc_provincia' => $this->cleanString($data['DEN_PROVINCIA'] ?? null),
            'oc_comune' => $this->cleanString($data['DEN_COMUNE'] ?? null),
            'oc_importo' => $this->parseNumber($data['FINANZ_TOTALE_PUBBLICO'] ?? null),
            'oc_importo_fesr' => $this->parseNumber($data['FINANZ_UE_FESR'] ?? null),
            'oc_importo_fse' => $this->parseNumber($data['FINANZ_UE_FSE'] ?? null),
            'oc_importo_fsc' => $this->parseNumber($data['FINANZ_STATO_FSC'] ?? null),
            'oc_tema' => $this->cleanString($data['OC_TEMA_SINTETICO'] ?? null),
            'oc_sottotema' => $this->cleanString($data['DESCR_OB_TEMATICO'] ?? null),
            'oc_data_inizio' => $this->parseDate($data['OC_DATA_INIZIO_PROGETTO'] ?? null),
            'oc_data_fine' => $this->parseDate($dataFine),
            'oc_soggetto' => $this->cleanString($data['OC_DENOM_BENEFICIARIO'] ?? null),
            'oc_cup' => $this->cleanString($data['CUP'] ?? null),
            'oc_categoria' => $this->cleanString($data['OC_DESCR_CATEGORIA_SPESA'] ?? null),
            'oc_stato' => $this->cleanString($data['OC_STATO_PROGETTO'] ?? null),
            'anno_inizio' => $this->extractYear($data['OC_DATA_INIZIO_PROGETTO'] ?? null),
            'anno_fine' => $this->extractYear($dataFine),
            'ciclo_programmazione' => $this->cleanString($data['OC_DESCR_CICLO'] ?? null),
        ];
    }

    /**
     * Pulisce una stringa
     */
    private function cleanString($value)
    {
        if ($value === null || $value === '') {
            return null;
        }
        
        // Rimuovi caratteri di controllo
        $value = preg_replace('/[\x00-\x1F\x7F]/', '', $value);

        // Trim
        $value = trim($value);

        // Tutte le colonne stringa della tabella sono varchar(255): senza troncare qui,
        // MySQL in strict mode rifiuta l'intera riga (causava ~36k righe perse su 121k,
        // soprattutto su oc_categoria che può contenere descrizioni molto lunghe)
        $value = mb_substr($value, 0, 255);

        return $value !== '' ? $value : null;
    }

    /**
     * Parsa un numero dal CSV (formato italiano: 1.234,56)
     */
    private function parseNumber($value)
    {
        if (empty($value)) {
            return null;
        }
        
        // Pulisci la stringa
        $value = trim($value);
        
        // Rimuovi punti (separatori delle migliaia)
        $value = str_replace('.', '', $value);
        
        // Sostituisci virgola con punto (separatore decimale)
        $value = str_replace(',', '.', $value);
        
        // Rimuovi tutto ciò che non è numero o punto
        $value = preg_replace('/[^0-9.]/', '', $value);
        
        return floatval($value);
    }

    /**
     * Parsa una data dal CSV
     */
    private function parseDate($value)
    {
        if (empty($value)) {
            return null;
        }
        
        $value = trim($value);
        
        try {
            // Prova diversi formati — 'Ymd' (es. 20111027) è il formato usato dal
            // tracciato record OpenCoesione corrente per OC_DATA_INIZIO/FINE_PROGETTO
            $formats = ['Ymd', 'Y-m-d', 'd/m/Y', 'm/d/Y', 'Y/m/d', 'd-m-Y', 'm-d-Y'];
            foreach ($formats as $format) {
                $date = \DateTime::createFromFormat($format, $value);
                if ($date !== false) {
                    return $date->format('Y-m-d');
                }
            }
            
            // Prova con strtotime per formati comuni
            $timestamp = strtotime($value);
            if ($timestamp !== false) {
                return date('Y-m-d', $timestamp);
            }
            
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Estrae l'anno da una data
     */
    private function extractYear($date)
    {
        if (empty($date)) {
            return null;
        }
        
        $parsed = $this->parseDate($date);
        if ($parsed) {
            return intval(date('Y', strtotime($parsed)));
        }
        return null;
    }

    /**
     * Pulizia della directory di estrazione
     */
    private function cleanupDirectory($path)
    {
        if (!is_dir($path)) {
            return;
        }
        
        $files = glob($path . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        rmdir($path);
        $this->info('🧹 Directory temporanea pulita');
    }
}