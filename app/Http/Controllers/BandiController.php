<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Models\ProfiloImpresa;


class BandiController extends Controller
{
    // Landing page con bivio iniziale
    public function landing()
    {
        // Verifica se l'utente ha già un profilo
        $profilo = ProfiloImpresa::where('user_id', auth()->id())->first();
        
        if ($profilo) {
            // Se ha già il profilo, vai direttamente ai bandi
            return Inertia::render('Bandi/Index', [
                'bandi' => [],
                'stats' => [
                    'totali' => 0,
                    'in_scadenza' => 0,
                    'totali_chiusi' => 0,
                ]
            ]);
        }
        
        // Altrimenti mostra la landing page con bivio
        return Inertia::render('Bandi/Landing');
    }
    
    // Dashboard bandi (dopo il profilo)
    public function index()
    {
        $profilo = ProfiloImpresa::with(['caratteristiche', 'capacita'])
            ->where('user_id', auth()->id())
            ->first();
        
        return Inertia::render('Bandi/Index', [
            'bandi' => [],
            'stats' => [
                'totali' => 0,
                'in_scadenza' => 0,
                'totali_chiusi' => 0,
            ],
            'profilo' => $profilo,
        ]);
    }
    
    // Ricerca bandi con DeepSeek AI
    public function cerca(Request $request)
    {
        $request->validate([
            'settore' => 'required|string',
            'regione' => 'nullable|string',
            'keywords' => 'nullable|string',
        ]);

        $settore = $request->settore;
        $regione = $request->regione ?: 'Tutte';
        $keywords = $request->keywords ?: 'Nessuna';

        $prompt = "Sei un esperto di bandi e finanziamenti per imprese in Italia. 
Cerca i seguenti bandi reali:
- Settore: {$settore}
- Regione: {$regione}
- Parole chiave: {$keywords}

Rispondi SOLO in formato JSON valido con questa struttura esatta:
{
    \"bandi\": [
        {
            \"titolo\": \"...\",
            \"ente\": \"...\",
            \"budget\": \"...\",
            \"scadenza\": \"YYYY-MM-DD\",
            \"descrizione\": \"...\",
            \"categoria\": \"digitalizzazione|ambiente|formazione|startup|altro\",
            \"link\": \"https://...\"
        }
    ]
}";

        try {
            $client = new Client();
            $response = $client->post('https://api.deepseek.com/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => 'deepseek-chat',
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Sei un assistente specializzato in bandi pubblici italiani ed europei. Rispondi solo in formato JSON valido.'
                        ],
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                    'max_tokens' => 2000,
                    'temperature' => 0.3,
                ],
            ]);

            $body = json_decode($response->getBody(), true);
            $risposta = $body['choices'][0]['message']['content'];

            // Estrai JSON dalla risposta
            preg_match('/\{.*\}/s', $risposta, $matches);
            $data = json_decode($matches[0] ?? '{}', true);

            return response()->json([
                'success' => true,
                'bandi' => $data['bandi'] ?? [],
                'message' => 'Trovati ' . count($data['bandi'] ?? []) . ' bandi',
            ]);

        } catch (\Exception $e) {
            // Dati di esempio in caso di errore API
            return response()->json([
                'success' => true,
                'bandi' => [
                    [
                        'titolo' => 'Bando Transizione 5.0',
                        'ente' => 'Ministero Imprese',
                        'budget' => '€10.000.000',
                        'scadenza' => '2026-12-31',
                        'descrizione' => 'Agevolazioni per digitalizzazione PMI',
                        'categoria' => 'digitalizzazione',
                        'link' => '#'
                    ],
                    [
                        'titolo' => 'PNRR Transizione Energetica',
                        'ente' => 'Ministero Ambiente',
                        'budget' => '€25.000.000',
                        'scadenza' => '2026-10-15',
                        'descrizione' => 'Finanziamenti per energie rinnovabili',
                        'categoria' => 'ambiente',
                        'link' => '#'
                    ],
                    [
                        'titolo' => 'Bando Startup Innovative',
                        'ente' => 'Invitalia',
                        'budget' => '€5.000.000',
                        'scadenza' => '2026-09-30',
                        'descrizione' => 'Contributi per nuove imprese innovative',
                        'categoria' => 'startup',
                        'link' => '#'
                    ]
                ],
                'message' => 'Trovati 3 bandi (demo)',
            ]);
        }
    }
    
    // Dettaglio bando
    public function show($id)
    {
        return Inertia::render('Bandi/Show', ['bando' => null]);
    }
    
    // Aggiungi ai preferiti
    public function preferisci($id)
    {
        return redirect()->back()->with('success', 'Bando aggiunto ai preferiti!');
    }
    
    // Rimuovi dai preferiti
    public function rimuoviPreferito($id)
    {
        return redirect()->back()->with('success', 'Bando rimosso dai preferiti!');
    }
}