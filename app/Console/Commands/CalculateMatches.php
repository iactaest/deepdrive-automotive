<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BandoImportato;
use App\Models\Ente;
use App\Models\ProfiloEnte;
use App\Models\BandiMatch;

class CalculateMatches extends Command
{
    protected $signature = 'bandi:calculate-matches
                            {--ente-id= : Calcola match solo per un ente specifico (ID Ente)}
                            {--force : Ricalcola anche i match già esistenti}';

    protected $description = 'Calcola il match tra BandoImportato e ProfiloEnte, salva in bandi_match';

    public function handle(): void
    {
        $this->info('🔄 Avvio calcolo match...');

        $profili = $this->getProfiliToProcess();

        if ($profili->isEmpty()) {
            $this->warn('⚠️ Nessun profilo ente completo trovato.');
            return;
        }

        $this->info("📊 {$profili->count()} profili da elaborare");

        // Solo bandi attivi: non chiusi e con scadenza futura (o assente)
        $oggi  = now()->toDateString();
        $bandi = BandoImportato::where('stato', '!=', 'chiuso')
            ->where(function ($q) use ($oggi) {
                $q->whereNull('scadenza')->orWhere('scadenza', '>=', $oggi);
            })->get();

        if ($bandi->isEmpty()) {
            $this->warn('⚠️ Nessun bando attivo trovato nel database.');
            return;
        }

        $this->info("📋 {$bandi->count()} bandi da analizzare");

        foreach ($profili as $profilo) {
            $ente = Ente::where('user_id', $profilo->user_id)->first();

            if (!$ente) {
                $this->warn("⚠️ Nessun Ente trovato per ProfiloEnte ID {$profilo->id}, salto.");
                continue;
            }

            $this->info("\n🏛️ Elaborazione: {$ente->nome}");
            $matchCount = 0;
            $bar = $this->output->createProgressBar($bandi->count());
            $bar->start();

            foreach ($bandi as $bando) {
                if (!$this->option('force')) {
                    $esiste = BandiMatch::where('user_id', $ente->id)
                                        ->where('bando_id', $bando->id)
                                        ->exists();
                    if ($esiste) {
                        $bar->advance();
                        continue;
                    }
                }

                $result = $this->calculateMatch($bando, $profilo);

                // Soglia minima 30%: match sotto soglia non vengono salvati
                if ($result['punteggio'] >= 30) {
                    BandiMatch::updateOrCreate(
                        ['bando_id' => $bando->id, 'user_id' => $ente->id],
                        [
                            'punteggio_compatibilita' => $result['punteggio'],
                            'punti_forza'             => json_encode($result['punti_forza']),
                            'punti_debolezza'         => json_encode($result['punti_debolezza']),
                            'requisiti_mancanti'      => json_encode($result['requisiti_mancanti']),
                            'match_obbligatori'       => $result['match_obbligatori'],
                            'calcolato_il'            => now(),
                        ]
                    );
                    $matchCount++;
                }

                $bar->advance();
            }

            $bar->finish();
            $this->newLine();
            $this->info("✅ {$ente->nome}: {$matchCount} match salvati");
        }

        $this->info("\n✅ Calcolo match completato!");
    }

    private function getProfiliToProcess()
    {
        $query = ProfiloEnte::where('profilo_completo', true);

        if ($this->option('ente-id')) {
            $ente = Ente::find($this->option('ente-id'));
            if ($ente) {
                $query->where('user_id', $ente->user_id);
            }
        }

        return $query->get();
    }

    private function calculateMatch(BandoImportato $bando, ProfiloEnte $profilo): array
    {
        $punteggio        = 0;
        $puntiForza       = [];
        $puntiDebolezza   = [];
        $requisitiMancanti = [];

        $toArray = fn ($v) => is_array($v) ? $v : (is_string($v) ? (json_decode($v, true) ?? []) : []);

        $categorieInteresse = array_map('strtolower', $toArray($profilo->categorie_interesse));
        $settori            = array_map('strtolower', $toArray($profilo->settore_prevalente));
        $livelliInteresse   = array_map('strtolower', $toArray($profilo->livelli_interesse));
        $regioneEnte        = strtolower($profilo->regione ?? '');
        $tipoEnte           = strtolower($profilo->tipo_ente ?? '');

        $categoriaBando = strtolower($bando->categoria ?? '');
        $livelloBando   = strtolower($bando->livello ?? '');
        $regioneBando   = strtolower($bando->regione ?? '');
        $targetBando    = strtolower($bando->target ?? '');

        // GUARD: bandi TED sono gare d'appalto, non finanziamenti/contributi.
        // Gli enti nel sistema cercano funding, non partecipano a procurement come fornitori.
        if ($bando->fonte === 'ted') {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ["Gara d'appalto (non un contributo o finanziamento)"],
                'requisiti_mancanti' => ['Tipo procedura: appalto'],
                'match_obbligatori'  => false,
            ];
        }

        // 1. TIPOLOGIA ENTE — guard hard: se target specificato e non include il tipo ente → score 0
        if (!empty($targetBando) && !empty($tipoEnte)) {
            $keywords  = $this->tipoEnteKeywords($tipoEnte);
            $matchTipo = false;
            foreach ($keywords as $kw) {
                if (str_contains($targetBando, $kw)) { $matchTipo = true; break; }
            }
            if (!$matchTipo) {
                return [
                    'punteggio'          => 0,
                    'punti_forza'        => [],
                    'punti_debolezza'    => ['Bando non rivolto a ' . $profilo->tipo_ente . ' (destinatari: ' . $bando->target . ')'],
                    'requisiti_mancanti' => ['Tipologia ente'],
                    'match_obbligatori'  => false,
                ];
            }
            $punteggio += 25;
            $puntiForza[] = 'Tipologia ente compatibile (' . $profilo->tipo_ente . ')';
        } else {
            $punteggio += 15; // target non specificato: beneficio del dubbio
        }

        // 2. TERRITORIO (20 pts)
        // Regola: se il bando ha un territorio specifico diverso dall'ente → 0 pts.
        // Solo bandi nazionali/europei/senza territorio danno punti parziali.
        $isEuropeo         = in_array('europeo', $livelliInteresse);
        $regioneNazionale  = in_array($regioneBando, ['nazionale', 'italia', 'national', 'italy', 'europeo', 'europe', '']);

        if (empty($regioneBando)) {
            // Territorio non specificato: beneficio del dubbio minimo
            $punteggio += 5;
        } elseif (in_array($livelloBando, ['europeo', 'europe']) && $isEuropeo) {
            $punteggio += 20;
            $puntiForza[] = 'Livello europeo compatibile';
        } elseif (!empty($regioneEnte) && str_contains($regioneBando, $regioneEnte)) {
            // Regione bando contiene la regione dell'ente (es. bando sicilia → ente sicilia)
            $punteggio += ($livelloBando === 'regionale') ? 20 : 18;
            $puntiForza[] = 'Bando regionale per ' . $bando->regione;
        } elseif ($regioneNazionale) {
            // Bando aperto a tutta Italia: credito parziale
            $punteggio += 10;
            $puntiDebolezza[] = 'Bando nazionale (non specifico per la tua regione)';
        } else {
            // Territorio specifico diverso dalla regione dell'ente → 0 pts
            $puntiDebolezza[] = 'Territorio non corrispondente (' . $bando->regione . ')';
            $requisitiMancanti[] = 'Territorio';
        }

        // 3. SETTORI / CATEGORIA (25 pts)
        $tuttiSettori = array_unique(array_merge($categorieInteresse, $settori));
        if (empty($categoriaBando) || empty($tuttiSettori)) {
            $punteggio += 10;
        } else {
            $matchCat = false;
            foreach ($tuttiSettori as $s) {
                if (str_contains($categoriaBando, $s) || str_contains($s, $categoriaBando)) {
                    $matchCat = true;
                    break;
                }
            }
            if ($matchCat) {
                $punteggio += 25;
                $puntiForza[] = 'Settore compatibile: ' . $bando->categoria;
            } else {
                $puntiDebolezza[] = 'Settore non in linea (' . $bando->categoria . ')';
                $requisitiMancanti[] = 'Settore';
            }
        }

        // 4. BUDGET (15 pts) — strict: 0 se il valore è fuori dal range dell'ente
        if (!$bando->budget_totale) {
            $punteggio += 8; // budget non dichiarato → beneficio del dubbio
        } else {
            [$budgetMin, $budgetMax] = $this->parseBudgetRange($toArray($profilo->importi_interesse));
            if ($budgetMin === null) {
                $punteggio += 8;
            } elseif ($bando->budget_totale >= $budgetMin && ($budgetMax === null || $bando->budget_totale <= $budgetMax)) {
                $punteggio += 15;
                $puntiForza[] = 'Budget nel range di interesse';
            } else {
                // Budget fuori range → 0 pts, nessun credito parziale
                $over = $budgetMax && $bando->budget_totale > $budgetMax;
                $label = $over
                    ? 'Budget troppo alto (' . number_format($bando->budget_totale / 1000, 0) . 'k vs max ' . number_format($budgetMax / 1000, 0) . 'k)'
                    : 'Budget troppo basso (' . number_format($bando->budget_totale / 1000, 0) . 'k vs min ' . number_format($budgetMin / 1000, 0) . 'k)';
                $puntiDebolezza[]    = $label;
                $requisitiMancanti[] = 'Budget';
            }
        }

        // 5. ESPERIENZA UE (10 pts)
        // Bando non EU → esperienza non richiesta → punti pieni
        // Bando EU + ente con esperienza → punti pieni
        // Bando EU + ente senza esperienza → 0 punti
        $isBandoEU = in_array($livelloBando, ['europeo', 'europe'])
            || in_array($regioneBando, ['europa', 'europe'])
            || str_contains(strtolower($bando->fonte ?? ''), 'eu_funding');

        if (!$isBandoEU) {
            $punteggio += 10;
            $puntiForza[] = 'Esperienza UE non richiesta';
        } elseif ($profilo->esperienza_fondi_europei) {
            $punteggio += 10;
            $puntiForza[] = 'Esperienza pregressa con fondi europei';
        } else {
            $puntiDebolezza[] = 'Bando europeo, nessuna esperienza UE dichiarata';
            $requisitiMancanti[] = 'Esperienza fondi europei';
        }

        // 6. SCADENZA (5 pts)
        if (!$bando->scadenza) {
            $punteggio += 3;
        } else {
            $giorniRimasti = now()->diffInDays($bando->scadenza, false);
            if ($giorniRimasti > 90) {
                $punteggio += 5;
                $puntiForza[] = 'Scadenza: tempo abbondante';
            } elseif ($giorniRimasti > 30) {
                $punteggio += 3;
            } elseif ($giorniRimasti > 0) {
                $punteggio += 1;
                $puntiDebolezza[] = 'Scadenza imminente';
            }
            // scaduto → 0 punti aggiuntivi
        }

        return [
            'punteggio'        => min(round($punteggio, 2), 100),
            'punti_forza'      => $puntiForza,
            'punti_debolezza'  => $puntiDebolezza,
            'requisiti_mancanti' => $requisitiMancanti,
            'match_obbligatori'  => empty($requisitiMancanti),
        ];
    }

    private function tipoEnteKeywords(string $tipoEnte): array
    {
        return match ($tipoEnte) {
            'comune'         => ['comune', 'ente locale', 'enti locali', 'pubblica amministrazione', 'ente pubblico', 'pa '],
            'provincia'      => ['provincia', 'ente locale', 'enti locali', 'pubblica amministrazione', 'ente pubblico'],
            'regione'        => ['regione', 'pubblica amministrazione', 'ente pubblico'],
            'associazione'   => ['associaz', 'no profit', 'non profit', 'terzo settore', 'cooperativ', 'ente del terzo'],
            'professionista' => ['professionista', 'libero professionista'],
            default          => [$tipoEnte],
        };
    }

    private function parseBudgetRange(array $importi): array
    {
        if (empty($importi)) return [null, null];

        $str = strtolower(trim(implode(' ', $importi)));
        if ($str === '') return [null, null];

        $parseNum = function (string $raw): float {
            $raw = trim($raw);
            if (preg_match('/^([\d.,]+)\s*(k|m)?$/i', $raw, $m)) {
                $n = (float) str_replace(',', '.', $m[1]);
                $s = strtolower($m[2] ?? '');
                if ($s === 'k') $n *= 1_000;
                if ($s === 'm') $n *= 1_000_000;
                return $n;
            }
            return 0.0;
        };

        // < prefix: "<40k" → [0, 40000]
        if (preg_match('/^<\s*([\d.,]+\s*(?:k|m)?)/i', $str, $m)) {
            return [0, $parseNum($m[1])];
        }

        // > prefix: ">1M" → [1000000, null]
        if (preg_match('/^>\s*([\d.,]+\s*(?:k|m)?)/i', $str, $m)) {
            return [$parseNum($m[1]), null];
        }

        // Range: "40k-150k" o "150k-1m"
        if (preg_match('/([\d.,]+\s*(?:k|m)?)\s*[-–]\s*([\d.,]+\s*(?:k|m)?)/i', $str, $m)) {
            return [$parseNum($m[1]), $parseNum($m[2])];
        }

        // Singolo valore
        if (preg_match('/([\d.,]+\s*(?:k|m)?)/i', $str, $m)) {
            $n = $parseNum($m[1]);
            return [$n, $n];
        }

        return [null, null];
    }
}
