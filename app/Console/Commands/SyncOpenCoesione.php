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
                            {--aggregato : Usa il dataset aggregato (42 MB invece di 252 MB)}';
    
    protected $description = 'Scarica e importa bandi da OpenCoesione (dataset pubblico)';

    public function handle()
    {
        $this->info('🔄 Avvio sincronizzazione OpenCoesione...');
        
        // Scegli il dataset in base all'opzione
        if ($this->option('aggregato')) {
            $url = 'https://opencoesione.gov.it/media/datasets/Progetti_esteso_aggregati_csv.zip';
            $this->info('📦 Usando dataset AGGREGATO (42 MB)');
        } else {
            $url = 'https://opencoesione.gov.it/media/datasets/Progetti_esteso_csv.zip';
            $this->info('📦 Usando dataset COMPLETO (252 MB)');
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
                $this->info('💡 Suggerimento: usa l\'opzione --aggregato per il dataset più leggero');
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
     * Mappa i dati dal CSV ai campi del database
     */
    private function mapCsvToDatabase($data)
    {
        return [
            'oc_titolo_progetto' => $this->cleanString($data['OC_TITOLO_PROGETTO'] ?? null),
            'oc_codice_progetto' => $this->cleanString($data['OC_CODICE_PROGETTO'] ?? null),
            'oc_regione' => $this->cleanString($data['OC_REGIONE'] ?? null),
            'oc_provincia' => $this->cleanString($data['OC_PROVINCIA'] ?? null),
            'oc_comune' => $this->cleanString($data['OC_COMUNE'] ?? null),
            'oc_importo' => $this->parseNumber($data['OC_IMPORTO'] ?? null),
            'oc_importo_fesr' => $this->parseNumber($data['OC_IMPORTO_FESR'] ?? null),
            'oc_importo_fse' => $this->parseNumber($data['OC_IMPORTO_FSE'] ?? null),
            'oc_importo_fsc' => $this->parseNumber($data['OC_IMPORTO_FSC'] ?? null),
            'oc_tema' => $this->cleanString($data['OC_TEMA'] ?? null),
            'oc_sottotema' => $this->cleanString($data['OC_SOTTOTEMA'] ?? null),
            'oc_data_inizio' => $this->parseDate($data['OC_DATA_INIZIO'] ?? null),
            'oc_data_fine' => $this->parseDate($data['OC_DATA_FINE'] ?? null),
            'oc_soggetto' => $this->cleanString($data['OC_SOGGETTO'] ?? null),
            'oc_cup' => $this->cleanString($data['OC_CUP'] ?? null),
            'oc_categoria' => $this->cleanString($data['OC_CATEGORIA'] ?? null),
            'oc_stato' => $this->cleanString($data['OC_STATO'] ?? null),
            'anno_inizio' => $this->extractYear($data['OC_DATA_INIZIO'] ?? null),
            'anno_fine' => $this->extractYear($data['OC_DATA_FINE'] ?? null),
            'ciclo_programmazione' => $this->cleanString($data['OC_CICLO'] ?? null),
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
            // Prova diversi formati
            $formats = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'Y/m/d', 'd-m-Y', 'm-d-Y'];
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