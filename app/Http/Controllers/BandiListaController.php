<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BandoImportato;
use App\Models\Ente;
use App\Models\ProfiloEnte;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandiListaController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $ente = Ente::where('user_id', $userId)->first();
        $profilo = ProfiloEnte::where('user_id', $userId)->first();

        $minMatch   = $request->has('min_match') ? (int) $request->get('min_match') : 0;
        $maxMatch   = $request->filled('max_match') ? (int) $request->get('max_match') : null;
        $statoFiltro = $request->get('stato', '');

        $oggi    = now()->startOfDay();
        $oggiStr = $oggi->toDateString();

        // Query base: solo bandi attivi (non chiusi, scadenza futura o assente)
        $query = BandoImportato::query();

        $query->where('stato', '!=', 'chiuso')
              ->where(function ($q) use ($oggiStr) {
                  $q->whereNull('scadenza')->orWhere('scadenza', '>=', $oggiStr);
              });

        if ($request->filled('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        if ($request->filled('regione')) {
            $query->where('regione', $request->regione);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn ($q) => $q->where('titolo', 'LIKE', "%{$s}%")->orWhere('descrizione', 'LIKE', "%{$s}%"));
        }

        $tuttiBandi = $query->orderBy('scadenza', 'asc')->get();

        // 1. Calcola match per tutti i bandi e costruisce l'insieme base (≥30%)
        $baselineMatch = [];
        foreach ($tuttiBandi as $bando) {
            $statoReale = $this->statoReale($bando->scadenza, $oggiStr);
            $risultato  = $this->calcolaMatch($bando, $profilo);
            $punteggio  = $risultato['punteggio'];

            if ($punteggio >= 30) {
                $baselineMatch[] = [
                    'id'              => $bando->id,
                    'titolo'          => $bando->titolo,
                    'fonte'           => $bando->fonte,
                    'categoria'       => $bando->categoria,
                    'regione'         => $bando->regione,
                    'budget_totale'   => $bando->budget_totale,
                    'scadenza'        => $bando->scadenza,
                    'stato'           => $statoReale,
                    'url'             => $bando->url,
                    'descrizione'     => $bando->descrizione,
                    'match_punteggio' => $punteggio,
                    'punti_forza'     => $risultato['punti_forza'],
                    'punti_debolezza' => $risultato['punti_debolezza'],
                ];
            }
        }

        // 2. Stats sempre calcolate sull'insieme base — non cambiano al click dei filtri
        $stats = [
            'totale'      => count($baselineMatch),
            'aperti'      => count(array_filter($baselineMatch, fn ($b) => $b['stato'] === 'aperto')),
            'in_scadenza' => count(array_filter($baselineMatch, fn ($b) => $b['stato'] === 'in_scadenza')),
            'chiusi'      => count(array_filter($baselineMatch, fn ($b) => $b['stato'] === 'chiuso')),
            'match_alti'  => count(array_filter($baselineMatch, fn ($b) => $b['match_punteggio'] >= 70)),
            'match_medi'  => count(array_filter($baselineMatch, fn ($b) => $b['match_punteggio'] >= 50 && $b['match_punteggio'] < 70)),
        ];

        // 3. Applica filtri stato e match solo alla lista visualizzata
        $bandiConMatch = array_values(array_filter($baselineMatch, function ($b) use ($statoFiltro, $minMatch, $maxMatch) {
            if ($statoFiltro && $b['stato'] !== $statoFiltro) return false;
            if ($b['match_punteggio'] < $minMatch) return false;
            if ($maxMatch !== null && $b['match_punteggio'] > $maxMatch) return false;
            return true;
        }));

        usort($bandiConMatch, fn ($a, $b) => $b['match_punteggio'] <=> $a['match_punteggio']);

        $categorie = BandoImportato::whereNotNull('categoria')->distinct()->pluck('categoria')->filter()->values();
        $regioni   = BandoImportato::whereNotNull('regione')->distinct()->pluck('regione')->filter()->values();

        return Inertia::render('Ente/ListaBandi/Index', [
            'bandi'    => $bandiConMatch,
            'stats'    => $stats,
            'categorie' => $categorie,
            'regioni'  => $regioni,
            'filtri'   => array_merge($request->all(), ['min_match' => $minMatch, 'max_match' => $maxMatch]),
            'ente'     => $ente,
        ]);
    }

    private function statoReale(?string $scadenza, string $oggi): string
    {
        if ($scadenza === null) {
            return 'aperto';
        }
        if ($scadenza < $oggi) {
            return 'chiuso';
        }
        // Scadenza oggi o entro 30 giorni → in scadenza
        $fra30 = now()->addDays(30)->toDateString();
        if ($scadenza <= $fra30) {
            return 'in_scadenza';
        }
        return 'aperto';
    }

    private function calcolaMatch($bando, ?ProfiloEnte $profilo): array
    {
        if (!$profilo) {
            return ['punteggio' => 0, 'punti_forza' => [], 'punti_debolezza' => []];
        }

        // GUARD: bandi TED sono appalti, non finanziamenti
        if ($bando->fonte === 'ted') {
            return [
                'punteggio'      => 0,
                'punti_forza'    => [],
                'punti_debolezza' => ["Gara d'appalto (non un contributo o finanziamento)"],
            ];
        }

        // GUARD: titolo con codice progetto stile CUP (es. "2014.IT.05.SFOP.014/1/8.1/7.3.2/0446")
        // sono righe di trasparenza L.190 su erogazioni già chiuse (elenco beneficiari di un
        // decreto passato), non bandi aperti a cui candidarsi.
        if (preg_match('/^\d{4}\.[A-Z]{2}\.\d/i', trim($bando->titolo ?? ''))) {
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['Codice progetto di trasparenza storica (non un bando aperto)'],
            ];
        }

        // GUARD: extra_data con schema "Amministrazione Trasparente" ex L.190 (BENEFICIARIO,
        // DATI_FISCALI, IMPORTO, NORMA...) — registro di erogazioni già effettuate, non un bando.
        // Segnale molto più affidabile di un pattern sul titolo (98% dei record regione_sicilia
        // con questa chiave sono di questo tipo, non bandi aperti).
        $extraData = is_array($bando->extra_data) ? $bando->extra_data : (json_decode($bando->extra_data ?? '', true) ?: []);
        if (isset($extraData['BENEFICIARIO'])) {
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['Registro trasparenza erogazioni (non un bando aperto)'],
            ];
        }

        $punteggio      = 0;
        $puntiForza     = [];
        $puntiDebolezza = [];

        $toArray = fn ($v) => is_array($v) ? $v : (is_string($v) ? (json_decode($v, true) ?? []) : []);

        $categorieInteresse = array_map('strtolower', $toArray($profilo->categorie_interesse));
        $settori            = array_map('strtolower', $toArray($profilo->settore_prevalente));
        $livelliInteresse   = array_map('strtolower', $toArray($profilo->livelli_interesse));
        $regioneEnte        = strtolower($profilo->regione ?? '');
        $provinciaEnte      = strtolower($profilo->provincia ?? '');
        $comuneEnte         = strtolower($profilo->comune ?? '');
        $tipoEnte           = strtolower($profilo->tipo_ente ?? '');
        $importiInteresse   = $toArray($profilo->importi_interesse);

        $categoriaBando = strtolower($bando->categoria ?? '');
        $livelloBando   = strtolower($bando->livello ?? '');
        $regioneBando   = strtolower($bando->regione ?? '');
        $provinciaBando = strtolower($bando->provincia ?? '');
        $comuneBando    = strtolower($bando->comune ?? '');
        $targetBando    = strtolower($bando->target ?? '');

        // GUARD: il target strutturato include spesso "Ente Pubblico" in modo generico, ma la
        // sezione "A chi si rivolge" della descrizione rivela che i beneficiari reali sono
        // imprese/privati (es. fondi comunali per commercianti/artigiani locali).
        if ($tipoEnte !== '' && $this->descrizioneIndicaSoloImprese($bando->descrizione)) {
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['La descrizione indica beneficiari imprese/privati, non enti pubblici'],
            ];
        }

        // GUARD: fondo amministrato da un Comune/Provincia specifico diverso dal profilo
        // (es. "Comune di Camastra" per un ente registrato a Ragusa) — non applicabile anche
        // se ricade nella stessa regione.
        if (!empty($comuneBando) && !empty($comuneEnte) && $comuneBando !== $comuneEnte) {
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['Fondo specifico del Comune di ' . $bando->comune . ', non applicabile al tuo territorio'],
            ];
        }
        if (!empty($provinciaBando) && !empty($provinciaEnte) && $provinciaBando !== $provinciaEnte) {
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['Fondo specifico della Provincia di ' . $bando->provincia . ', non applicabile al tuo territorio'],
            ];
        }

        // 1. TIPOLOGIA ENTE — guard hard: se target specificato e non include il tipo ente → score 0
        if (!empty($targetBando) && !empty($tipoEnte)) {
            $keywords = $this->tipoEnteKeywords($tipoEnte);
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
                    'punteggio'       => 0,
                    'punti_forza'     => [],
                    'punti_debolezza' => ['Bando non rivolto a ' . $profilo->tipo_ente . ' (destinatari: ' . $bando->target . ')'],
                ];
            }
            $punteggio += 25;
            $puntiForza[] = 'Tipologia ente compatibile (' . $profilo->tipo_ente . ')';
        } else {
            $punteggio += 15; // target non specificato: beneficio del dubbio
        }

        // 2. SETTORI / CATEGORIA (25 pts)
        $tuttiSettori = array_unique(array_merge($categorieInteresse, $settori));
        if (empty($categoriaBando) || empty($tuttiSettori)) {
            $punteggio += 10;
        } else {
            $matchCat = false;
            foreach ($tuttiSettori as $s) {
                if ($s && (str_contains($categoriaBando, $s) || str_contains($s, $categoriaBando))) {
                    $matchCat = true;
                    break;
                }
            }
            if ($matchCat) {
                $punteggio += 25;
                $puntiForza[] = 'Settore compatibile: ' . $bando->categoria;
            } else {
                $puntiDebolezza[] = 'Settore non in linea con i tuoi interessi (' . $bando->categoria . ')';
            }
        }

        // 3. TERRITORIO (20 pts) — 0 se regione specifica diversa dall'ente
        $isEuropeo        = in_array('europeo', $livelliInteresse);
        $regioneNazionale = in_array($regioneBando, ['nazionale', 'italia', 'national', 'italy', 'europeo', 'europe', '']);

        if (!empty($comuneBando) && $comuneBando === $comuneEnte) {
            $punteggio += 20;
            $puntiForza[] = 'Bando specifico per il tuo Comune (' . $bando->comune . ')';
        } elseif (!empty($provinciaBando) && $provinciaBando === $provinciaEnte) {
            $punteggio += 20;
            $puntiForza[] = 'Bando specifico per la tua Provincia (' . $bando->provincia . ')';
        } elseif (empty($regioneBando)) {
            $punteggio += 5;
        } elseif (in_array($livelloBando, ['europeo', 'europe']) && $isEuropeo) {
            $punteggio += 20;
            $puntiForza[] = 'Livello europeo compatibile';
        } elseif (!empty($regioneEnte) && str_contains($regioneBando, $regioneEnte)) {
            $punteggio += 20;
            $puntiForza[] = 'Bando per la tua regione: ' . $bando->regione;
        } elseif ($regioneNazionale) {
            $punteggio += 10;
            $puntiDebolezza[] = 'Bando nazionale (non specifico per la tua regione)';
        } else {
            // GUARD: bando vincolato a una regione specifica diversa dalla propria — non è
            // una semplice debolezza, è un requisito geografico che non può essere soddisfatto.
            return [
                'punteggio'       => 0,
                'punti_forza'     => [],
                'punti_debolezza' => ['Territorio non corrispondente (' . $bando->regione . ' vs ' . $profilo->regione . ')'],
            ];
        }

        // 4. LIVELLO INTERESSE (15 pts)
        if (!empty($livelloBando) && !empty($livelliInteresse)) {
            if (in_array($livelloBando, $livelliInteresse)) {
                $punteggio += 15;
                $puntiForza[] = 'Livello compatibile: ' . $bando->livello;
            } elseif ($livelloBando === 'nazionale') {
                $punteggio += 8;
            }
        } else {
            $punteggio += 8;
        }

        // 5. BUDGET (15 pts) — strict: 0 se il valore è fuori range
        if (!$bando->budget_totale) {
            $punteggio += 8;
        } else {
            [$budgetMin, $budgetMax] = $this->parseBudgetRange($importiInteresse);
            if ($budgetMin === null) {
                $punteggio += 8;
            } elseif ($bando->budget_totale >= $budgetMin && ($budgetMax === null || $bando->budget_totale <= $budgetMax)) {
                $punteggio += 15;
                $puntiForza[] = 'Budget nel range di interesse';
            } else {
                $over  = $budgetMax && $bando->budget_totale > $budgetMax;
                $label = $over
                    ? 'Budget troppo alto (' . number_format($bando->budget_totale / 1000, 0) . 'k vs max ' . number_format($budgetMax / 1000, 0) . 'k)'
                    : 'Budget troppo basso (' . number_format($bando->budget_totale / 1000, 0) . 'k)';
                $puntiDebolezza[] = $label;
            }
        }

        // 6. SCADENZA (5 pts)
        if (!$bando->scadenza) {
            $punteggio += 3;
        } else {
            $giorni = now()->diffInDays($bando->scadenza, false);
            if ($giorni > 90) {
                $punteggio += 5;
                $puntiForza[] = 'Scadenza: ampio margine di tempo';
            } elseif ($giorni > 30) {
                $punteggio += 3;
            } elseif ($giorni > 0) {
                $punteggio += 1;
                $puntiDebolezza[] = 'Scadenza imminente';
            }
        }

        return [
            'punteggio'      => min($punteggio, 100),
            'punti_forza'    => $puntiForza,
            'punti_debolezza' => $puntiDebolezza,
        ];
    }

    /**
     * Isola la sezione "A chi si rivolge" (struttura ricorrente nelle descrizioni di
     * incentivi.gov.it) e verifica se indica beneficiari esclusivamente privati, anche
     * quando il campo target strutturato include genericamente "Ente Pubblico".
     */
    private function descrizioneIndicaSoloImprese(?string $descrizione): bool
    {
        if (empty($descrizione)) return false;

        if (!preg_match('/A chi si rivolge\s*(.+?)(?:Cosa prevede|Come funziona|$)/isu', $descrizione, $m)) {
            return false;
        }
        $sezione = strtolower($m[1]);

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
    
    public function show($id)
    {
        $bando   = BandoImportato::findOrFail($id);
        $userId  = Auth::id();
        $ente    = Ente::where('user_id', $userId)->first();
        $profilo = ProfiloEnte::where('user_id', $userId)->first();

        $oggiStr    = now()->startOfDay()->toDateString();
        $statoReale = $this->statoReale($bando->scadenza, $oggiStr);
        $risultato  = $this->calcolaMatch($bando, $profilo);

        return Inertia::render('Ente/ListaBandi/Dettaglio', [
            'bando' => [
                'id'           => $bando->id,
                'titolo'       => $bando->titolo,
                'fonte'        => $bando->fonte,
                'categoria'    => $bando->categoria,
                'regione'      => $bando->regione,
                'livello'      => $bando->livello,
                'budget_totale'=> $bando->budget_totale,
                'scadenza'     => $bando->scadenza,
                'stato'        => $statoReale,
                'url'          => $bando->url,
                'descrizione'  => $bando->descrizione,
            ],
            'match' => [
                'punteggio'      => $risultato['punteggio'],
                'punti_forza'    => $risultato['punti_forza'],
                'punti_debolezza'=> $risultato['punti_debolezza'],
            ],
            'ente' => $ente,
        ]);
    }
}