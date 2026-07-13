<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BandoImportato;
use App\Models\ProfiloEnte;
use App\Models\BandiMatch;
use App\Models\CalendarioEvento;

class CalculateMatches extends Command
{
    protected $signature = 'bandi:calculate-matches
                            {--ente-id= : Calcola match solo per un ente specifico (ID Ente)}
                            {--force : Ricalcola anche i match già esistenti}
                            {--debug : Mostra il dettaglio del punteggio per ogni bando}';

    /** Soglia di punteggio oltre la quale un bando entra automaticamente nel Calendario Scadenze. */
    private const SOGLIA_MATCH_CALENDARIO = 50;

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

                // Soglia minima 30%: match sotto soglia non vengono salvati. Se un match
                // esisteva già da un calcolo precedente ed è sceso sotto soglia (es. per una
                // correzione dell'algoritmo), va rimosso: altrimenti resta un record obsoleto.
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

                    if ($result['punteggio'] >= self::SOGLIA_MATCH_CALENDARIO) {
                        CalendarioEvento::sincronizzaDaBando($userId, $bando->id, 'match');
                    }
                } else {
                    BandiMatch::where('bando_id', $bando->id)->where('user_id', $userId)->delete();
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
        $provinciaEnte      = strtolower($profilo->provincia ?? '');
        $comuneEnte         = strtolower($profilo->comune ?? '');
        $tipoEnte           = strtolower($profilo->tipo_ente ?? '');

        $categoriaBando = strtolower($bando->categoria ?? '');
        $livelloBando   = strtolower($bando->livello ?? '');
        $regioneBando   = strtolower($bando->regione ?? '');
        $provinciaBando = strtolower($bando->provincia ?? '');
        $comuneBando    = strtolower($bando->comune ?? '');
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

        // GUARD: titolo con codice progetto stile CUP (es. "2014.IT.05.SFOP.014/1/8.1/7.3.2/0446")
        // sono righe di trasparenza L.190 su erogazioni già chiuse (elenco beneficiari di un
        // decreto passato), non bandi aperti a cui candidarsi.
        if (preg_match('/^\d{4}\.[A-Z]{2}\.\d/i', trim($bando->titolo ?? ''))) {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['Codice progetto di trasparenza storica (non un bando aperto)'],
                'requisiti_mancanti' => ['Non è un bando attivo'],
                'match_obbligatori'  => false,
                'breakdown'          => $breakdown,
            ];
        }

        // GUARD: extra_data con chiavi tipiche di registri di trasparenza/monitoraggio progetti
        // già finanziati (schema L.190 "Amministrazione Trasparente" con BENEFICIARIO/NORMA, o
        // schema monitoraggio unitario con Cup/CodiceLocaleIntervento/DenominazioneBeneficiario)
        // — non sono bandi aperti. Un CUP esiste solo per un progetto già assegnato, mai per un
        // bando ancora da candidare. Segnale sullo schema dati, non su un pattern di testo.
        $extraData = is_array($bando->extra_data) ? $bando->extra_data : (json_decode($bando->extra_data ?? '', true) ?: []);
        $chiaviTrasparenza = ['beneficiario', 'denominazionebeneficiario', 'cup', 'codicelocaleintervento'];
        $chiaviPresenti = array_map('strtolower', array_keys($extraData));
        if (array_intersect($chiaviTrasparenza, $chiaviPresenti)) {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['Registro trasparenza/monitoraggio progetti già finanziati (non un bando aperto)'],
                'requisiti_mancanti' => ['Non è un bando attivo'],
                'match_obbligatori'  => false,
                'breakdown'          => $breakdown,
            ];
        }

        // GUARD: il campo target strutturato include spesso "Ente Pubblico" in modo generico
        // (tassonomia incentivi.gov.it troppo ampia), ma la sezione "A chi si rivolge" della
        // descrizione rivela che i beneficiari reali sono imprese/privati. Il target da solo
        // (guard successivo) non basta a intercettare questi casi.
        if ($tipoEnte !== '' && $this->descrizioneIndicaSoloImprese($bando->descrizione)) {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['La descrizione indica beneficiari imprese/privati, non enti pubblici'],
                'requisiti_mancanti' => ['Tipologia beneficiario (da descrizione)'],
                'match_obbligatori'  => false,
                'breakdown'          => ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0],
            ];
        }

        // 1. TIPOLOGIA ENTE — guard hard: se target specificato e non include il tipo ente → score 0
        if (!empty($targetBando) && !empty($tipoEnte)) {
            $keywords  = $this->tipoEnteKeywords($tipoEnte);
            // Stem intenzionalmente parziali (associazione/associazioni/associativo, cooperativa/e):
            // solo confine di parola iniziale, non finale.
            $stemParziali = ['associaz', 'cooperativ'];
            $matchTipo = false;
            foreach ($keywords as $kw) {
                $pattern = in_array($kw, $stemParziali, true)
                    ? '/\b' . preg_quote($kw, '/') . '/ui'
                    : '/\b' . preg_quote($kw, '/') . '\b/ui';
                // \b evita falsi positivi tipo "comuni" dentro "comunicazione"
                if (preg_match($pattern, $targetBando)) { $matchTipo = true; break; }
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

        // GUARD: fondo amministrato da un Comune/Provincia specifico (es. "Comune di Camastra").
        // I beneficiari sono per legge limitati a quel territorio: un ente di un altro comune/
        // provincia non è idoneo, anche se ricade nella stessa regione.
        if (!empty($comuneBando) && !empty($comuneEnte) && $comuneBando !== $comuneEnte) {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['Fondo specifico del Comune di ' . $bando->comune . ', non applicabile al tuo territorio'],
                'requisiti_mancanti' => ['Territorio (comune)'],
                'match_obbligatori'  => false,
                'breakdown'          => ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0],
            ];
        }
        if (!empty($provinciaBando) && !empty($provinciaEnte) && $provinciaBando !== $provinciaEnte) {
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['Fondo specifico della Provincia di ' . $bando->provincia . ', non applicabile al tuo territorio'],
                'requisiti_mancanti' => ['Territorio (provincia)'],
                'match_obbligatori'  => false,
                'breakdown'          => ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0],
            ];
        }

        // 2. TERRITORIO (20 pts)
        $isEuropeo         = in_array('europeo', $livelliInteresse);
        $regioneNazionale  = in_array($regioneBando, ['nazionale', 'italia', 'national', 'italy', 'europeo', 'europe', '']);

        if (!empty($comuneBando) && $comuneBando === $comuneEnte) {
            $punteggio += 20; $breakdown['territorio'] = 20;
            $puntiForza[] = 'Bando specifico per il tuo Comune (' . $bando->comune . ')';
        } elseif (!empty($provinciaBando) && $provinciaBando === $provinciaEnte) {
            $punteggio += 20; $breakdown['territorio'] = 20;
            $puntiForza[] = 'Bando specifico per la tua Provincia (' . $bando->provincia . ')';
        } elseif (empty($regioneBando)) {
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
            // GUARD: bando vincolato a una regione specifica diversa dalla propria — non è
            // una semplice debolezza, è un requisito geografico che non può essere soddisfatto.
            return [
                'punteggio'          => 0,
                'punti_forza'        => [],
                'punti_debolezza'    => ['Territorio non corrispondente (' . $bando->regione . ' vs ' . $profilo->regione . ')'],
                'requisiti_mancanti' => ['Territorio'],
                'match_obbligatori'  => false,
                'breakdown'          => ['tipologia' => 0, 'settori' => 0, 'territorio' => 0, 'livello' => 0, 'budget' => 0, 'esperienza' => 0, 'scadenza' => 0],
            ];
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

    /**
     * Isola la sezione "A chi si rivolge" (struttura ricorrente nelle descrizioni di
     * incentivi.gov.it) e verifica se indica beneficiari esclusivamente privati, anche
     * quando il campo target strutturato include genericamente "Ente Pubblico".
     * Se la sezione non è individuabile, non applica l'euristica (evita falsi positivi
     * su testi non strutturati provenienti da altre fonti).
     */
    private function descrizioneIndicaSoloImprese(?string $descrizione): bool
    {
        if (empty($descrizione)) return false;

        if (!preg_match('/A chi si rivolge\s*(.+?)(?:Cosa prevede|Come funziona|$)/isu', $descrizione, $m)) {
            return false;
        }
        $sezione = strtolower($m[1]);

        // "enti pubblici diversi dagli enti territoriali" esclude esplicitamente Comuni/
        // Province/Regioni (gli "enti territoriali"), anche se la frase contiene le parole
        // "ente pubblico"/"enti territoriali" che il controllo generico sotto leggerebbe
        // come segnale positivo. Va controllato PRIMA, altrimenti la negazione si perde.
        if (preg_match('/enti?\s+pubblic[ei]\s+divers[eio]\s+(?:da|dagli?|dall[e\']?)/ui', $sezione)
            || preg_match('/(?:esclus[eio]|ad esclusione)\s+(?:degli|dell[e\']?)\s*enti?\s+territorial[ei]/ui', $sezione)) {
            return true;
        }

        // Frasi (non lo stem "pubblic-" da solo: "avviso pubblico"/"bando pubblico" sono
        // termini generici di procedura, non indicano che il beneficiario sia un ente pubblico)
        $keywordEnte = [
            'comuni', 'enti locali', 'ente pubblico', 'enti pubblici', 'enti territoriali',
            'pubblica amministrazione', 'amministrazioni pubbliche', 'soggetti pubblici',
            'unione dei comuni', 'unioni di comuni',
        ];
        foreach ($keywordEnte as $kw) {
            if (str_contains($sezione, $kw)) return false;
        }

        $keywordImprese = [
            'operatori economici', 'le imprese', 'imprese private', 'imprese di qualsiasi dimensione',
            'pmi', 'liberi professionisti', 'datori di lavoro privati', 'startup',
            'lavoratori autonomi', 'micro, piccole e medie imprese',
        ];
        foreach ($keywordImprese as $kw) {
            if (str_contains($sezione, $kw)) return true;
        }

        return false;
    }

    private function tipoEnteKeywords(string $tipoEnte): array
    {
        return match ($tipoEnte) {
            'comune'         => ['comune', 'comuni', 'ente locale', 'enti locali', 'pubblica amministrazione', 'ente pubblico', 'enti pubblici', 'pa'],
            'provincia'      => ['provincia', 'province', 'ente locale', 'enti locali', 'pubblica amministrazione', 'ente pubblico', 'enti pubblici'],
            'regione'        => ['regione', 'regioni', 'pubblica amministrazione', 'ente pubblico', 'enti pubblici'],
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
