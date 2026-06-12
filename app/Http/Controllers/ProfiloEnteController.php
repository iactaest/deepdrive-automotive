<?php

namespace App\Http\Controllers;

use App\Models\ProfiloEnte;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfiloEnteController extends Controller
{
    // Mostra il wizard per completare il profilo (prima volta)
    public function create()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        
        return Inertia::render('Ente/ProfiloWizard', [
            'profilo' => $profilo,
        ]);
    }

    // Salva il profilo dal wizard
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome_ente' => 'required|string|max:255',
            'tipo_ente' => 'required|string',
            'codice_fiscale' => 'nullable|string|max:16',
            'partita_iva' => 'nullable|string|max:11',
            'regione' => 'required|string',
            'provincia' => 'required|string',
            'comune' => 'required|string',
            'indirizzo' => 'nullable|string',
            'cap' => 'nullable|string|max:5',
            'categorie_interesse' => 'nullable|array',
            'livelli_interesse' => 'nullable|array',
            'importi_interesse' => 'nullable|array',
        ]);

        ProfiloEnte::updateOrCreate(
            ['user_id' => auth()->id()],
            array_merge($validated, ['profilo_completo' => true])
        );

        return redirect()->route('ente.dashboard')->with('success', 'Profilo completato con successo!');
    }

    // NUOVO: Mostra il profilo (visualizzazione)
    public function show()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        
        if (!$profilo) {
            return redirect()->route('ente.profilo.create');
        }
        
        return Inertia::render('Ente/ProfiloShow', [
            'profilo' => $profilo,
        ]);
    }

    // NUOVO: Mostra il form di modifica
    public function edit()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
        
        if (!$profilo) {
            return redirect()->route('ente.profilo.create');
        }
        
        return Inertia::render('Ente/ProfiloEdit', [
            'profilo' => $profilo,
        ]);
    }

    // NUOVO: Aggiorna il profilo
    public function update(Request $request)
    {
        $validated = $request->validate([
            'nome_ente' => 'required|string|max:255',
            'tipo_ente' => 'required|string',
            'codice_fiscale' => 'nullable|string|max:16',
            'partita_iva' => 'nullable|string|max:11',
            'regione' => 'required|string',
            'provincia' => 'required|string',
            'comune' => 'required|string',
            'indirizzo' => 'nullable|string',
            'cap' => 'nullable|string|max:5',
            'categorie_interesse' => 'nullable|array',
            'livelli_interesse' => 'nullable|array',
            'importi_interesse' => 'nullable|array',
        ]);

        ProfiloEnte::updateOrCreate(
            ['user_id' => auth()->id()],
            $validated
        );

        return redirect()->route('ente.profilo.show')->with('success', 'Profilo aggiornato con successo!');
    }

    // Cancella il profilo
public function destroy()
{
    $profilo = ProfiloEnte::where('user_id', auth()->id())->first();
    
    if ($profilo) {
        $profilo->delete();
    }
    
    return redirect()->route('ente.profilo.create')->with('success', 'Profilo cancellato. Puoi ricrearlo!');
}
}