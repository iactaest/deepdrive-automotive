<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BandoImportato;
use App\Models\ProfiloEnte;
use App\Models\BandiMatch;

class CalculateMatches extends Command
{
    protected $signature = 'bandi:calculate-matches
                            {--ente-id= : Calcola match solo per un ente specifico (ID Ente)}
                            {--force : Ricalcola anche i match già esistenti}
                            {--debug : Mostra il dettaglio del punteggio per ogni bando}';

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
            $nomeEnte = $profilo->nome_ente ?? "ProfiloEnte #{$profilo->id}";
            $userId   = $profilo->user_id;

            $this->info("\n🏛️ Elaborazione: {$nomeEnte}");
            $matchCount = 0;
            $bar = $this->output->createProgressBar($bandi->count());
            $bar->start();

            $debug = $this->option('debug');

            foreach ($bandi as $bando) {
                if (!$this->option('force')) {
                    $esiste = BandiMatch::where('user_id', $userId)
                                        ->where('bando_id', $bando->id)
                                        ->exists();
                    if ($esiste) {
                        if (!$debug) $bar->advance();
                        continue;
                    }
                }

                $result = $this->calculateMatch($bando, $profilo);

                if ($debug) {
                    $soglia  = $result['punteggio'] >= 30 ? '✅ SALVO' : '❌ SCARTO';
                    $titolo  = mb_substr($bando->titolo, 0, 60);
                    $this->line('');
                    $this->line("  [{$soglia}] <comment>{$titolo}</comment> (ID {$bando->id})");
                    $this->line("    fonte={$bando->fonte} | target=" . ($bando->target ?? 'NULL') . " | regione=" . ($bando->regione ?? 'NULL'));
                    $breakdown = $result['breakdown'] ?? [];
                    $this->line("    TIPOLOGIA  : " . str_pad($breakdown['tipologia'] ?? '?', 4) . " pts");
                    $this->line("    SETTORI    : " . str_pad($breakdown['settori'] ?? '?', 4) . " pts");
                    $this->line("    TERRITORIO : " . str_pad($breakdown['territorio'] ?? '?', 4) . " pts");
                    $this->line("    LIVELLO    : " . str_pad($breakdown['livello'] ?? '?', 4) . " pts");
                    $this->line("    BUDGET     : " . str_pad($breakdown['budget'] ?? '?', 4) . " pts");
                    $this->line("    ESPERIENZA : " . str_pad($breakdown['esperienza'] ?? '?', 4) . " pts");
                    $this->line("    SCADENZA   : " . str_pad($breakdown['scadenza'] ?? '?', 4) . " pts");
                    $this->line("    TOTALE     : <info>{$result['punteggio']}</info> / 100");
                    if (!empty($result['punti_debolezza'])) {
                        foreach ($result['punti_debolezza'] as $d) {
                            $this->line("    ⚠️  $d");
                        }
                    }
                } else {
                    $bar->advance();
                }

                // Soglia minima 30%: match sotto soglia non vengono salvati
                if ($result['punteggio'] >= 30) {
                    BandiMatch::updateOrCreate(
                        ['bando_id' => $bando->id, 'user_id' => $userId],
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
            }

            if (!$debug) { $bar->finish(); $this->newLine(); }
            $this->info("✅ {$nomeEnte}: {$matchCount} match salvati");
        }

        $this->info("\n✅ Calcolo match completato!");
    }

    private function getProfiliToProcess()
    {
        $query = ProfiloEnte::where('profilo_completo', true);

        if ($this->option('ente-id')) {
            $query->where('user_id', $this->option('ente-id'));
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

        $breakdown = ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0];

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
                    'breakdown'          => ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0],
                ];
            }
            $punteggio += 25; $breakdown['tipologia'] = 25;
            $puntiForza[] = 'Tipologia ente compatibile (' . $profilo->tipo_ente . ')';
        } else {
            $punteggio += 15; $breakdown['tipologia'] = 15; // target non specificato: beneficio del dubbio
        }

        // 2. TERRITORIO (20 pts)
        $isEuropeo         = in_array('europeo', $livelliInteresse);
        $regioneNazionale  = in_array($regioneBando, ['nazionale', 'italia', 'national', 'italy', 'europeo', 'europe', '']);

        if (empty($regioneBando)) {
            $punteggio += 5; $breakdown['territorio'] = 5;
        } elseif (in_array($livelloBando, ['europeo', 'europe']) && $isEuropeo) {
            $punteggio += 20; $breakdown['territorio'] = 20;
            $puntiForza[] = 'Livello europeo compatibile';
        } elseif (!empty($regioneEnte) && str_contains($regioneBando, $regioneEnte)) {
            $pts = ($livelloBando === 'regionale') ? 20 : 18;
            $punteggio += $pts; $breakdown['territorio'] = $pts;
            $puntiForza[] = 'Bando regionale per ' . $bando->regione;
        } elseif ($regioneNazionale) {
            $punteggio += 10; $breakdown['territorio'] = 10;
            $puntiDebolezza[] = 'Bando nazionale (non specifico per la tua regione)';
        } else {
            $breakdown['territorio'] = 0;
            $puntiDebolezza[] = 'Territorio non corrispondente (' . $bando->regione . ')';
            $requisitiMancanti[] = 'Territorio';
        }

        // 3. SETTORI / CATEGORIA (25 pts)
        $tuttiSettori = array_unique(array_merge($categorieInteresse, $settori));
        if (empty($categoriaBando) || empty($tuttiSettori)) {
            $punteggio += 10; $breakdown['settori'] = 10;
        } else {
            $matchCat = false;
            foreach ($tuttiSettori as $s) {
                if (str_contains($categoriaBando, $s) || str_contains($s, $categoriaBando)) {
                    $matchCat = true; break;
                }
            }
            if ($matchCat) {
                $punteggio += 25; $breakdown['settori'] = 25;
                $puntiForza[] = 'Settore compatibile: ' . $bando->categoria;
            } else {
                $breakdown['settori'] = 0;
                $puntiDebolezza[] = 'Settore non in linea (' . $bando->categoria . ')';
                $requisitiMancanti[] = 'Settore';
            }
        }

        // 4. BUDGET (15 pts)
        if (!$bando->budget_totale) {
            $punteggio += 8; $breakdown['budget'] = 8;
        } else {
            [$budgetMin, $budgetMax] = $this->parseBudgetRange($toArray($profilo->importi_interesse));
            if ($budgetMin === null) {
                $punteggio += 8; $breakdown['budget'] = 8;
            } elseif ($bando->budget_totale >= $budgetMin && ($budgetMax === null || $bando->budget_totale <= $budgetMax)) {
                $punteggio += 15; $breakdown['budget'] = 15;
                $puntiForza[] = 'Budget nel range di interesse';
            } else {
                $breakdown['budget'] = 0;
                $over = $budgetMax && $bando->budget_totale > $budgetMax;
                $label = $over
                    ? 'Budget troppo alto (' . number_format($bando->budget_totale / 1000, 0) . 'k vs max ' . number_format($budgetMax / 1000, 0) . 'k)'
                    : 'Budget troppo basso (' . number_format($bando->budget_totale / 1000, 0) . 'k vs min ' . number_format($budgetMin / 1000, 0) . 'k)';
                $puntiDebolezza[]    = $label;
                $requisitiMancanti[] = 'Budget';
            }
        }

        // 5. ESPERIENZA UE (10 pts)
        $isBandoEU = in_array($livelloBando, ['europeo', 'europe'])
            || in_array($regioneBando, ['europa', 'europe'])
            || str_contains(strtolower($bando->fonte ?? ''), 'eu_funding');

        if (!$isBandoEU) {
            $punteggio += 10; $breakdown['esperienza'] = 10;
            $puntiForza[] = 'Esperienza UE non richiesta';
        } elseif ($profilo->esperienza_fondi_europei) {
            $punteggio += 10; $breakdown['esperienza'] = 10;
            $puntiForza[] = 'Esperienza pregressa con fondi europei';
        } else {
            $breakdown['esperienza'] = 0;
            $puntiDebolezza[] = 'Bando europeo, nessuna esperienza UE dichiarata';
            $requisitiMancanti[] = 'Esperienza fondi europei';
        }

        // 6. SCADENZA (5 pts)
        if (!$bando->scadenza) {
            $punteggio += 3; $breakdown['scadenza'] = 3;
        } else {
            $giorniRimasti = now()->diffInDays($bando->scadenza, false);
            if ($giorniRimasti > 90) {
                $punteggio += 5; $breakdown['scadenza'] = 5;
                $puntiForza[] = 'Scadenza: tempo abbondante';
            } elseif ($giorniRimasti > 30) {
                $punteggio += 3; $breakdown['scadenza'] = 3;
            } elseif ($giorniRimasti > 0) {
                $punteggio += 1; $breakdown['scadenza'] = 1;
                $puntiDebolezza[] = 'Scadenza imminente';
            } else {
                $breakdown['scadenza'] = 0;
            }
        }

        return [
            'punteggio'          => min(round($punteggio, 2), 100),
            'punti_forza'        => $puntiForza,
            'punti_debolezza'    => $puntiDebolezza,
            'requisiti_mancanti' => $requisitiMancanti,
            'match_obbligatori'  => empty($requisitiMancanti),
            'breakdown'          => $breakdown,
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
