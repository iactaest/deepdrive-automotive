<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\ProgettoOpenCoesione;
use App\Models\Ente;
use App\Models\Bando;

class SyncOpenCoesioneApi extends Command
{
    protected $signature = 'bandi:sync-opencoesione-api
                            {--regione= : Filtra per regione (es. Sicilia, Lombardia)}
                            {--tema= : Filtra per tema (es. Ambiente, Digitale)}
                            {--limit=100 : Numero di progetti per richiesta (max 500)}
                            {--max=1000 : Numero massimo totale di progetti da importare}
                            {--reset : Resetta i dati esistenti prima di importare}';
    
    protected $description = 'Importa bandi da OpenCoesione via API REST';

    public function handle()
    {
        $this->info('🔄 Avvio sincronizzazione OpenCoesione via API...');
        
        // Reset opzionale
        if ($this->option('reset')) {
            $this->info('🧹 Resettando dati esistenti...');
            ProgettoOpenCoesione::truncate();
            $this->info('✅ Dati resettati!');
        }
        
        $regione = $this->option('regione');
        $tema = $this->option('tema');
        $limit = min((int)$this->option('limit'), 500); // Max 500 per richiesta
        $max = (int)$this->option('max');
        
        $this->info("📊 Parametri:");
        $this->info("   - Limit per richiesta: $limit");
        $this->info("   - Max totale: $max");
        if ($regione) $this->info("   - Regione: $regione");
        if ($tema) $this->info("   - Tema: $tema");
        
        $importati = 0;
        $offset = 0;
        $totale = 0;
        
        do {
            // Costruisci l'URL
            $url = "https://opencoesione.gov.it/it/api/progetti/?format=json&limit=$limit&offset=$offset";
            if ($regione) {
                $url .= "&regione=" . urlencode($regione);
            }
            if ($tema) {
                $url .= "&tema=" . urlencode($tema);
            }
            
            $this->info("📥 Chiamata API: $url");
            
            try {
                $response = Http::timeout(60)->get($url);
                
                if (!$response->successful()) {
                    $this->error("❌ Errore API (status: " . $response->status() . ")");
                    $this->warn("💡 Riprova tra qualche secondo...");
                    sleep(10);
                    continue;
                }
                
                $data = $response->json();
                $progetti = $data['progetti'] ?? [];
                $totale = $data['total'] ?? 0;
                
                $this->info("📊 Trovati " . count($progetti) . " progetti (offset $offset, totale $totale)");
                
                if (empty($progetti)) {
                    break;
                }
                
                // Importa i progetti
                $count = $this->importProgetti($progetti);
                $importati += $count;
                
                $offset += $limit;
                
                // Rispetta il limite di rate (12/minuto = 1 ogni 5 secondi)
                $this->info("⏳ Attesa 5 secondi per rispettare il limite API...");
                sleep(5);
                
            } catch (\Exception $e) {
                $this->error("❌ Errore: " . $e->getMessage());
                $this->warn("💡 Riprovo tra 10 secondi...");
                sleep(10);
            }
            
        } while ($offset < $max && $offset < $totale);
        
        $this->info("✅ Sincronizzazione completata!");
        $this->info("📊 $importati progetti importati.");
        
        // Calcola i match dopo l'importazione
        if ($importati > 0) {
            $this->info('🔄 Avvio calcolo match...');
            $this->call('bandi:calculate-matches', ['--force' => true]);
        }
    }
    
    private function importProgetti($progetti)
    {
        $count = 0;
        $bar = $this->output->createProgressBar(count($progetti));
        $bar->start();
        
        foreach ($progetti as $dati) {
            try {
                // Verifica se il progetto esiste già
                $codice = $dati['codice_progetto'] ?? null;
                if ($codice) {
                    $esistente = ProgettoOpenCoesione::where('oc_codice_progetto', $codice)->first();
                    if ($esistente) {
                        $bar->advance();
                        continue;
                    }
                }
                
                // Salva in progetti_opencoesione
                $progetto = ProgettoOpenCoesione::create([
                    'oc_titolo_progetto' => $this->cleanString($dati['titolo_progetto'] ?? null),
                    'oc_codice_progetto' => $this->cleanString($dati['codice_progetto'] ?? null),
                    'oc_regione' => $this->cleanString($dati['regione'] ?? null),
                    'oc_provincia' => $this->cleanString($dati['provincia'] ?? null),
                    'oc_comune' => $this->cleanString($dati['comune'] ?? null),
                    'oc_importo' => $this->parseNumber($dati['importo'] ?? null),
                    'oc_importo_fesr' => $this->parseNumber($dati['importo_fesr'] ?? null),
                    'oc_importo_fse' => $this->parseNumber($dati['importo_fse'] ?? null),
                    'oc_importo_fsc' => $this->parseNumber($dati['importo_fsc'] ?? null),
                    'oc_tema' => $this->cleanString($dati['tema'] ?? null),
                    'oc_sottotema' => $this->cleanString($dati['sottotema'] ?? null),
                    'oc_data_inizio' => $this->parseDate($dati['data_inizio'] ?? null),
                    'oc_data_fine' => $this->parseDate($dati['data_fine'] ?? null),
                    'oc_soggetto' => $this->cleanString($dati['soggetto_responsabile'] ?? null),
                    'oc_cup' => $this->cleanString($dati['cup'] ?? null),
                    'oc_categoria' => $this->cleanString($dati['categoria'] ?? null),
                    'oc_stato' => $this->cleanString($dati['stato'] ?? null),
                    'anno_inizio' => $this->extractYear($dati['data_inizio'] ?? null),
                    'anno_fine' => $this->extractYear($dati['data_fine'] ?? null),
                ]);
                
                // Crea anche il bando associato
                $this->creaBandoDaProgetto($progetto);
                
                $count++;
                
            } catch (\Exception $e) {
                // Salta gli errori e continua
                if ($count < 5) {
                    $this->warn("⚠️ Errore importazione: " . $e->getMessage());
                }
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        
        return $count;
    }
    
    private function creaBandoDaProgetto($progetto)
    {
        if (empty($progetto->oc_titolo_progetto)) {
            return;
        }
        
        // Cerca l'ente corrispondente
        $ente = null;
        if ($progetto->oc_soggetto) {
            $ente = Ente::where('nome', 'LIKE', '%' . $progetto->oc_soggetto . '%')->first();
            
            if (!$ente) {
                $ente = Ente::create([
                    'nome' => $progetto->oc_soggetto,
                    'tipo' => 'Altro',
                    'regione' => $progetto->oc_regione,
                    'provincia' => $progetto->oc_provincia,
                    'comune' => $progetto->oc_comune,
                ]);
            }
        }
        
        // Crea il bando
        Bando::updateOrCreate(
            [
                'titolo' => $progetto->oc_titolo_progetto,
                'fonte' => 'OpenCoesione'
            ],
            [
                'ente_id' => $ente->id ?? null,
                'descrizione' => $progetto->oc_titolo_progetto,
                'categoria' => $progetto->oc_tema,
                'regione' => $progetto->oc_regione,
                'provincia' => $progetto->oc_provincia,
                'budget_totale' => $progetto->oc_importo,
                'scadenza' => $progetto->oc_data_fine,
                'fonte' => 'OpenCoesione',
                'stato' => $this->determinaStato($progetto->oc_stato, $progetto->oc_data_fine),
            ]
        );
    }
    
    private function determinaStato($stato, $scadenza)
    {
        if ($stato === 'completato' || $stato === 'chiuso') {
            return 'chiuso';
        }
        
        if ($scadenza) {
            $diff = now()->diffInDays($scadenza);
            if ($diff < 0) return 'chiuso';
            if ($diff < 30) return 'in_scadenza';
        }
        
        return 'aperto';
    }
    
    private function cleanString($value)
    {
        if (empty($value)) {
            return null;
        }
        return trim($value);
    }
    
    private function parseNumber($value)
    {
        if (empty($value)) {
            return null;
        }
        $value = trim($value);
        $value = str_replace('.', '', $value);
        $value = str_replace(',', '.', $value);
        $value = preg_replace('/[^0-9.]/', '', $value);
        return floatval($value);
    }
    
    private function parseDate($value)
    {
        if (empty($value)) {
            return null;
        }
        try {
            return date('Y-m-d', strtotime($value));
        } catch (\Exception $e) {
            return null;
        }
    }
    
    private function extractYear($date)
    {
        if (empty($date)) {
            return null;
        }
        try {
            return intval(date('Y', strtotime($date)));
        } catch (\Exception $e) {
            return null;
        }
    }
}