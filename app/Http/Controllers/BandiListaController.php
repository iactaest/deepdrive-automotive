<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BandoImportato;
use App\Models\BandiMatch;
use App\Models\Ente;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandiListaController extends Controller
{
    /**
     * Mostra la lista dei bandi con i match per l'ente loggato
     */
    public function index(Request $request)
    {
        $ente = Ente::where('user_id', Auth::id())->first();
        
        // Query base per i bandi importati
        $query = BandoImportato::query();
        
        // Filtri
        if ($request->filled('categoria')) {
            $query->where('categoria', $request->categoria);
        }
        
        if ($request->filled('regione')) {
            $query->where('regione', $request->regione);
        }
        
        if ($request->filled('stato')) {
            $query->where('stato', $request->stato);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('titolo', 'LIKE', "%{$search}%")
                  ->orWhere('descrizione', 'LIKE', "%{$search}%");
            });
        }
        
        $query->orderBy('scadenza', 'asc');
        $bandi = $query->paginate(20);
        
        // Per ogni bando, recupera il match per l'ente
        $bandiConMatch = [];
        foreach ($bandi as $bando) {
            $match = null;
            if ($ente) {
                $match = BandiMatch::where('user_id', $ente->id)
                                   ->where('bando_id', $bando->id)
                                   ->first();
            }
            
            $bandiConMatch[] = [
                'id' => $bando->id,
                'titolo' => $bando->titolo,
                'fonte' => $bando->fonte,
                'categoria' => $bando->categoria,
                'regione' => $bando->regione,
                'budget_totale' => $bando->budget_totale,
                'scadenza' => $bando->scadenza,
                'stato' => $bando->stato,
                'url' => $bando->url,
                'descrizione' => $bando->descrizione,
                'match_punteggio' => $match ? $match->punteggio_compatibilita : 0,
                'punti_forza' => $match ? json_decode($match->punti_forza, true) : [],
                'punti_debolezza' => $match ? json_decode($match->punti_debolezza, true) : [],
            ];
        }
        
        // Statistiche
        $stats = [
            'totale' => BandoImportato::count(),
            'aperti' => BandoImportato::where('stato', 'aperto')->count(),
            'match_alti' => $ente ? BandiMatch::where('user_id', $ente->id)->where('punteggio_compatibilita', '>=', 70)->count() : 0,
            'match_medi' => $ente ? BandiMatch::where('user_id', $ente->id)->whereBetween('punteggio_compatibilita', [50, 69])->count() : 0,
        ];
        
        $categorie = BandoImportato::whereNotNull('categoria')->distinct()->pluck('categoria')->filter()->values();
        $regioni = BandoImportato::whereNotNull('regione')->distinct()->pluck('regione')->filter()->values();
        
        return Inertia::render('Ente/ListaBandi/Index', [
            'bandi' => $bandiConMatch,
            'bandiPaginate' => $bandi,
            'stats' => $stats,
            'categorie' => $categorie,
            'regioni' => $regioni,
            'filtri' => $request->all(),
            'ente' => $ente,
        ]);
    }
    
    /**
     * Mostra i dettagli di un bando specifico
     */
    public function show($id)
    {
        $bando = BandoImportato::findOrFail($id);
        
        $ente = Ente::where('user_id', Auth::id())->first();
        
        $match = null;
        if ($ente) {
            $match = BandiMatch::where('user_id', $ente->id)
                               ->where('bando_id', $id)
                               ->first();
        }
        
        return Inertia::render('Ente/ListaBandi/Dettaglio', [
            'bando' => [
                'id' => $bando->id,
                'titolo' => $bando->titolo,
                'fonte' => $bando->fonte,
                'categoria' => $bando->categoria,
                'regione' => $bando->regione,
                'budget_totale' => $bando->budget_totale,
                'scadenza' => $bando->scadenza,
                'stato' => $bando->stato,
                'url' => $bando->url,
                'descrizione' => $bando->descrizione,
            ],
            'match' => $match ? [
                'punteggio' => $match->punteggio_compatibilita,
                'punti_forza' => json_decode($match->punti_forza, true),
                'punti_debolezza' => json_decode($match->punti_debolezza, true),
            ] : null,
            'ente' => $ente,
        ]);
    }
}