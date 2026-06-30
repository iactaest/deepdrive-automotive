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

        $minMatch   = (int) $request->get('min_match', 50);
        $maxMatch   = $request->filled('max_match') ? (int) $request->get('max_match') : null;
        $statoFiltro = $request->get('stato', '');

        $oggi       = now()->startOfDay();
        $treMessiFa = $oggi->copy()->subMonths(3)->toDateString();
        $oggiStr    = $oggi->toDateString();

        // Query base: solo filtri su campi testuali + finestra temporale
        // Stato e match vengono applicati in PHP per mantenere le stats sempre stabili
        $query = BandoImportato::query();

        $query->where(function ($q) use ($treMessiFa) {
            $q->whereNull('scadenza')->orWhere('scadenza', '>=', $treMessiFa);
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

        // 1. Calcola match per tutti i bandi e costruisce l'insieme base (≥50%)
        $baselineMatch = [];
        foreach ($tuttiBandi as $bando) {
            $statoReale = $this->statoReale($bando->scadenza, $oggiStr);
            $risultato  = $this->calcolaMatch($bando, $profilo);
            $punteggio  = $risultato['punteggio'];

            if ($punteggio >= 50) {
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

        $punteggio     = 0;
        $puntiForza    = [];
        $puntiDebolezza = [];

        $toArray = fn ($v) => is_array($v) ? $v : (is_string($v) ? (json_decode($v, true) ?? []) : []);

        $categorieInteresse = array_map('strtolower', $toArray($profilo->categorie_interesse));
        $settori            = array_map('strtolower', $toArray($profilo->settore_prevalente));
        $livelliInteresse   = array_map('strtolower', $toArray($profilo->livelli_interesse));
        $regioneEnte        = strtolower($profilo->regione ?? '');

        $categoriaBando = strtolower($bando->categoria ?? '');
        $livelloBando   = strtolower($bando->livello ?? '');
        $regioneBando   = strtolower($bando->regione ?? '');

        // 1. Categoria / Settore (45 pts)
        $tuttiSettori = array_unique(array_merge($categorieInteresse, $settori));
        if (!empty($categoriaBando)) {
            $matchCat = false;
            foreach ($tuttiSettori as $s) {
                if (str_contains($categoriaBando, $s) || str_contains($s, $categoriaBando)) {
                    $matchCat = true;
                    break;
                }
            }
            if ($matchCat) {
                $punteggio += 45;
                $puntiForza[] = 'Categoria compatibile: ' . $bando->categoria;
            } else {
                $puntiDebolezza[] = 'Categoria non in linea con i tuoi interessi (' . $bando->categoria . ')';
            }
        } else {
            $punteggio += 15;
        }

        // 2. Livello (35 pts)
        if (!empty($livelloBando)) {
            if (in_array($livelloBando, $livelliInteresse)) {
                $punteggio += 35;
                $puntiForza[] = 'Livello compatibile: ' . $bando->livello;
            } elseif ($livelloBando === 'regionale' && !empty($regioneEnte) && str_contains($regioneBando, $regioneEnte)) {
                $punteggio += 25;
                $puntiForza[] = 'Bando regionale per ' . $bando->regione;
            } elseif ($livelloBando === 'nazionale') {
                $punteggio += 15;
                $puntiDebolezza[] = 'Livello nazionale (aperto a tutti, ma non preferito)';
            } else {
                $puntiDebolezza[] = 'Livello ' . $bando->livello . ' non tra i tuoi livelli di interesse';
            }
        } else {
            $punteggio += 15;
        }

        // 3. Regione (20 pts)
        if (!empty($regioneBando)) {
            $isEuropeo = in_array('europeo', $livelliInteresse);
            if (in_array($regioneBando, ['europa', 'europe']) && $isEuropeo) {
                $punteggio += 20;
                $puntiForza[] = 'Bando europeo compatibile con il tuo profilo';
            } elseif (!empty($regioneEnte) && str_contains($regioneBando, $regioneEnte)) {
                $punteggio += 20;
                $puntiForza[] = 'Regione compatibile: ' . $bando->regione;
            } elseif (in_array($regioneBando, ['nazionale', 'italia', 'national', 'italy'])) {
                $punteggio += 10;
            } else {
                $puntiDebolezza[] = 'Regione ' . $bando->regione . ' diversa dalla tua (' . $profilo->regione . ')';
            }
        } else {
            $punteggio += 10;
        }

        return [
            'punteggio'      => min($punteggio, 100),
            'punti_forza'    => $puntiForza,
            'punti_debolezza' => $puntiDebolezza,
        ];
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