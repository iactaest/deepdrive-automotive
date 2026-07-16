<?php

namespace App\Http\Controllers;

use App\Models\ConversazioneAssistente;
use App\Models\ProfiloEnte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class AssistenteController extends Controller
{
    private const GEMINI_MODEL = 'gemini-2.5-flash';

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

        $conversazione = ConversazioneAssistente::create([
            'domanda' => $request->domanda,
            'user_id' => auth()->id(),
            'risposta' => null,
        ]);

        $risposta = $this->chiedaGemini($request->domanda) ?? 'Il servizio AI non è al momento disponibile, riprova tra poco.';

        $conversazione->update(['risposta' => $risposta]);

        return redirect()->route('assistente')->with('success', '✅ Domanda inviata con successo!');
    }

    private function chiedaGemini(string $domanda): ?string
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return null;
        }

        $profilo = ProfiloEnte::where('user_id', Auth::user()->enteEffettivoUserId())->first();
        $contestoProfilo = $this->costruisciContestoProfilo($profilo);

        $prompt = <<<PROMPT
Sei l'assistente virtuale di DeepBandi, una piattaforma che aiuta gli enti pubblici italiani a trovare bandi e finanziamenti pubblici. Rispondi in italiano, in modo chiaro e concreto, a domande su bandi, finanziamenti, requisiti per partecipare, scadenze e documentazione necessaria per la Pubblica Amministrazione.

{$contestoProfilo}

Domanda dell'utente: {$domanda}

Se la domanda non riguarda bandi/finanziamenti/PA, rispondi comunque in modo utile ma riporta gentilmente il discorso sull'ambito della piattaforma. Non inventare bandi specifici con nomi/scadenze precise se non sei sicuro: in quel caso invita l'utente a consultare la sezione "Lista Bandi" della piattaforma.
PROMPT;

        $url = "https://generativelanguage.googleapis.com/v1beta/models/" . self::GEMINI_MODEL . ":generateContent?key={$apiKey}";

        try {
            $response = Http::timeout(60)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                ],
            ]);
        } catch (\Throwable $e) {
            return null;
        }

        if (!$response->successful()) {
            return null;
        }

        $testo = $response->json('candidates.0.content.parts.0.text');

        return $testo ? trim($testo) : null;
    }

    private function costruisciContestoProfilo(?ProfiloEnte $profilo): string
    {
        if (!$profilo) {
            return '';
        }

        $categorie = json_decode($profilo->categorie_interesse ?? '[]', true) ?: [];
        $livelli   = json_decode($profilo->livelli_interesse ?? '[]', true) ?: [];

        $righe = array_filter([
            $profilo->nome_ente ? "Ente: {$profilo->nome_ente} ({$profilo->tipo_ente})" : null,
            $profilo->regione ? "Territorio: {$profilo->comune}, {$profilo->provincia}, {$profilo->regione}" : null,
            $categorie ? 'Categorie di interesse: ' . implode(', ', $categorie) : null,
            $livelli ? 'Livelli di interesse: ' . implode(', ', $livelli) : null,
        ]);

        return $righe ? "Profilo di chi sta chiedendo:\n" . implode("\n", $righe) . "\n" : '';
    }
}
