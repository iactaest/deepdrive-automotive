<?php

namespace App\Http\Controllers;

use App\Models\ConversazioneAssistente;
use Illuminate\Http\Request;
use Inertia\Inertia;
use OpenAI\Laravel\Facades\OpenAI;

class AssistenteController extends Controller
{
    public function index()
    {
        $conversazioni = ConversazioneAssistente::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(fn($conv) => [
                'id' => $conv->id,
                'domanda' => $conv->domanda,
                'risposta' => $conv->risposta,
                'created_at' => $conv->created_at->toISOString(),
            ]);

        return Inertia::render('Assistente', [
            'conversazioni' => $conversazioni,
        ]);
    }

    public function inviaDomanda(Request $request)
    {
        $request->validate([
            'domanda' => 'required|string|min:2|max:1000',
        ]);

        // Salva la domanda
        $conversazione = ConversazioneAssistente::create([
            'domanda' => $request->domanda,
            'user_id' => auth()->id(),
            'risposta' => null,
        ]);

        // Per ora una risposta mock (poi integreremo OpenAI)
        $rispostaMock = "🤖 Grazie per la tua domanda: \"{$request->domanda}\"\n\nSto elaborando la risposta... (Integrazione OpenAI in arrivo!)";
        
        $conversazione->update(['risposta' => $rispostaMock]);

        return redirect()->route('assistente')->with('success', '✅ Domanda inviata con successo!');
    }
}