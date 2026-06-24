<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Bando;
use App\Models\Ente;
use App\Models\CriteriMatch;
use App\Models\BandiMatch;

class CalculateMatches extends Command
{
    protected $signature = 'bandi:calculate-matches
                            {--ente-id= : Calcola match solo per un ente specifico}
                            {--force : Ricalcola anche i match esistenti}';
    
    protected $description = 'Calcola il match tra bandi e enti basato sui criteri di ricerca';

    public function handle()
    {
        $this->info('🔄 Avvio calcolo match...');
        
        // Determina quali enti processare
        $enti = $this->getEntiToProcess();
        
        if ($enti->isEmpty()) {
            $this->warn('⚠️ Nessun ente trovato.');
            return;
        }
        
        $this->info("📊 Trovati {$enti->count()} enti da analizzare");
        
        foreach ($enti as $ente) {
            $this->info("\n🏛️ Elaborazione ente: {$ente->nome}");
            
            // Prendi i bandi da matchare
            $bandi = Bando::all();
            
            if ($bandi->isEmpty()) {
                $this->warn("⚠️ Nessun bando trovato nel database.");
                continue;
            }
            
            $matchCount = 0;
            
            foreach ($bandi as $bando) {
                // Controlla se esiste già un match
                $existingMatch = BandiMatch::where('bando_id', $bando->id)
                                          ->where('user_id', $ente->id)
                                          ->first();
                
                if ($existingMatch && !$this->option('force')) {
                    continue; // Salta se già esiste e non è forzato
                }
                
                // Calcola il match
                $result = $this->calculateMatch($bando, $ente);
                
                if ($result['punteggio'] > 0) {
                    // Salva o aggiorna il match
                    BandiMatch::updateOrCreate(
                        ['bando_id' => $bando->id, 'user_id' => $ente->id],
                        [
                            'punteggio_compatibilita' => $result['punteggio'],
                            'punti_forza' => json_encode($result['punti_forza']),
                            'punti_debolezza' => json_encode($result['punti_debolezza']),
                            'requisiti_mancanti' => json_encode($result['requisiti_mancanti']),
                            'match_obbligatori' => $result['match_obbligatori'],
                            'calcolato_il' => now(),
                        ]
                    );
                    
                    $matchCount++;
                }
            }
            
            $this->info("✅ Match calcolati per {$ente->nome}: {$matchCount} bandi matchati");
        }
        
        $this->info("\n✅ Calcolo match completato!");
    }
    
    private function getEntiToProcess()
    {
        if ($this->option('ente-id')) {
            return Ente::where('id', $this->option('ente-id'))->get();
        }
        
        return Ente::all();
    }
    
    private function calculateMatch($bando, $ente)
    {
        // Prendi i criteri dell'ente
        $criteri = CriteriMatch::where('ente_id', $ente->id)->first();
        
        if (!$criteri) {
            return [
                'punteggio' => 0,
                'punti_forza' => [],
                'punti_debolezza' => [],
                'requisiti_mancanti' => [],
                'match_obbligatori' => false,
            ];
        }
        
        $punteggio = 0;
        $puntiForza = [];
        $puntiDebolezza = [];
        $requisitiMancanti = [];
        $matchObbligatori = true;
        
        // 1. Tipologia Ente (25%)
        $tipologiaMatch = $this->matchTipologia($bando, $ente, $criteri);
        if ($tipologiaMatch) {
            $punteggio += 25;
            $puntiForza[] = 'Tipologia ente: ' . $criteri->tipo_ente;
        } else {
            $puntiDebolezza[] = 'Tipologia ente: il bando è per ' . $bando->target . ', non per ' . $criteri->tipo_ente;
            $requisitiMancanti[] = 'Tipologia ente non corrispondente';
            $matchObbligatori = false;
        }
        
        // 2. Territorio (20%)
        $territorioPunteggio = $this->matchTerritorio($bando, $ente, $criteri);
        if ($territorioPunteggio > 0) {
            $punteggio += $territorioPunteggio;
            if ($territorioPunteggio >= 20) {
                $puntiForza[] = 'Territorio: ' . ($criteri->regione ?? '') . ' - match perfetto';
            } else {
                $puntiDebolezza[] = 'Territorio: match parziale (' . $territorioPunteggio . '/20)';
            }
        } else {
            $puntiDebolezza[] = 'Territorio: nessuna corrispondenza territoriale';
            $requisitiMancanti[] = 'Territorio non corrispondente';
            $matchObbligatori = false;
        }
        
        // 3. Settori (25%)
        $settoriPunteggio = $this->matchSettori($bando, $ente, $criteri);
        if ($settoriPunteggio > 0) {
            $punteggio += $settoriPunteggio;
            if ($settoriPunteggio >= 25) {
                $puntiForza[] = 'Settori: ' . implode(', ', $criteri->settori_interesse ?? []) . ' - match perfetto';
            } else {
                $puntiDebolezza[] = 'Settori: match parziale (' . $settoriPunteggio . '/25)';
            }
        } else {
            $puntiDebolezza[] = 'Settori: nessuna corrispondenza con i settori di interesse';
            $requisitiMancanti[] = 'Settori di interesse non corrispondenti';
        }
        
        // 4. Budget (15%)
        $budgetPunteggio = $this->matchBudget($bando, $ente, $criteri);
        if ($budgetPunteggio > 0) {
            $punteggio += $budgetPunteggio;
            if ($budgetPunteggio >= 15) {
                $puntiForza[] = 'Budget: ' . number_format($criteri->budget_disponibile ?? 0, 2) . '€ - sufficiente';
            } else {
                $puntiDebolezza[] = 'Budget: potrebbe essere insufficiente (' . $budgetPunteggio . '/15)';
                $requisitiMancanti[] = 'Budget disponibile insufficiente';
            }
        } else {
            $puntiDebolezza[] = 'Budget: insufficiente per il bando';
            $requisitiMancanti[] = 'Budget disponibile insufficiente';
        }
        
        // 5. Esperienza UE (10%)
        $esperienzaMatch = $this->matchEsperienza($bando, $ente, $criteri);
        if ($esperienzaMatch) {
            $punteggio += 10;
            $puntiForza[] = 'Esperienza UE: esperienza pregressa';
        } else {
            $puntiDebolezza[] = 'Esperienza UE: manca esperienza in progetti europei';
            $requisitiMancanti[] = 'Mancanza di esperienza in progetti europei';
        }
        
        // 6. Scadenza (5%)
        $scadenzaPunteggio = $this->matchScadenza($bando, $ente, $criteri);
        if ($scadenzaPunteggio > 0) {
            $punteggio += $scadenzaPunteggio;
            if ($scadenzaPunteggio >= 5) {
                $puntiForza[] = 'Scadenza: tempo sufficiente';
            } else {
                $puntiDebolezza[] = 'Scadenza: tempo limitato (' . $scadenzaPunteggio . '/5)';
            }
        }
        
        return [
            'punteggio' => round($punteggio, 2),
            'punti_forza' => $puntiForza,
            'punti_debolezza' => $puntiDebolezza,
            'requisiti_mancanti' => $requisitiMancanti,
            'match_obbligatori' => $matchObbligatori,
        ];
    }
    
    private function matchTipologia($bando, $ente, $criteri)
    {
        $target = $bando->target ?? $bando->livello ?? '';
        $tipo = $criteri->tipo_ente ?? '';
        
        if (empty($target) || empty($tipo)) {
            return true;
        }
        
        return str_contains(strtolower($target), strtolower($tipo));
    }
    
    private function matchTerritorio($bando, $ente, $criteri)
    {
        $punteggio = 0;
        $regioneBando = $bando->regione ?? '';
        $regioneEnte = $criteri->regione ?? '';
        
        if (!empty($regioneBando) && !empty($regioneEnte) && 
            str_contains(strtolower($regioneBando), strtolower($regioneEnte))) {
            $punteggio = 20;
        } else if (!empty($regioneBando) && !empty($regioneEnte)) {
            $similar = similar_text(strtolower($regioneBando), strtolower($regioneEnte));
            $percent = $similar / max(strlen($regioneBando), strlen($regioneEnte));
            if ($percent > 0.5) {
                $punteggio = 10;
            }
        }
        
        return $punteggio;
    }
    
    private function matchSettori($bando, $ente, $criteri)
    {
        $settoriEnte = $criteri->settori_interesse ?? [];
        $categoriaBando = $bando->categoria ?? $bando->tema ?? '';
        
        if (empty($settoriEnte) || empty($categoriaBando)) {
            return 0;
        }
        
        $punteggio = 0;
        $settoriBando = explode(',', $categoriaBando);
        
        foreach ($settoriBando as $settore) {
            foreach ($settoriEnte as $settoreEnte) {
                if (str_contains(strtolower($settore), strtolower($settoreEnte)) ||
                    str_contains(strtolower($settoreEnte), strtolower($settore))) {
                    $punteggio += 25 / count($settoriBando);
                    break;
                }
            }
        }
        
        return round($punteggio, 2);
    }
    
    private function matchBudget($bando, $ente, $criteri)
    {
        $budgetBando = $bando->budget_totale ?? $bando->budget ?? 0;
        $budgetEnte = $criteri->budget_disponibile ?? 0;
        
        if ($budgetBando == 0 || $budgetEnte == 0) {
            return 0;
        }
        
        if ($budgetBando <= $budgetEnte) {
            return 15;
        } else {
            $percentuale = ($budgetEnte / $budgetBando) * 100;
            if ($percentuale >= 50) {
                return round(15 * ($percentuale / 100), 2);
            }
        }
        
        return 0;
    }
    
    private function matchEsperienza($bando, $ente, $criteri)
    {
        if ($criteri->esperienza_europea) {
            $fonte = $bando->fonte ?? '';
            if (str_contains(strtolower($fonte), 'euro') || 
                str_contains(strtolower($fonte), 'ue')) {
                return true;
            }
        }
        return false;
    }
    
    private function matchScadenza($bando, $ente, $criteri)
    {
        $scadenza = $bando->scadenza ?? null;
        
        if (!$scadenza) {
            return 0;
        }
        
        $oggi = now();
        $giorniRimasti = $oggi->diffInDays($scadenza);
        
        if ($giorniRimasti > 30) {
            return 5;
        } elseif ($giorniRimasti > 15) {
            return 3;
        } elseif ($giorniRimasti > 0) {
            return 1;
        } else {
            return 0;
        }
    }
}