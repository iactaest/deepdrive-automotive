<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ProfiloEnte;

class EnteController extends Controller
{
   public function index()
{
    $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
    
    // Se il profilo non esiste o non è completo, reindirizza al wizard
    if (!$profilo || !$profilo->profilo_completo) {
        return redirect()->route('ente.profilo.create');
    }
    
    return Inertia::render('Ente/Dashboard', [
        'profilo' => $profilo,
    ]);
}

    public function profilo()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        
        return Inertia::render('Bandi/Ente/Profilo', [
            'profilo' => $profilo,
        ]);
    }

    public function storeProfilo(Request $request)
    {
        $validated = $request->validate([
            'nome_ente' => 'required|string|max:255',
            'tipo_ente' => 'required|string',
            'regione' => 'required|string',
            'provincia' => 'required|string',
            'comune' => 'required|string',
            'partita_iva' => 'nullable|string',
            'codice_fiscale' => 'nullable|string',
            'categorie_preferite' => 'nullable|array',
            'settori_interesse' => 'nullable|array',
            'livello_preferito' => 'required|string',
            'importo_preferito' => 'nullable|string',
        ]);

        ProfiloEnte::updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return redirect()->route('ente.dashboard')->with('success', 'Profilo salvato con successo!');
    }

    public function ricerca(Request $request)
    {
        $filtri = $request->all();
        
        return Inertia::render('Bandi/Ente/Ricerca', [
            'filtri' => $filtri,
        ]);
    }
}