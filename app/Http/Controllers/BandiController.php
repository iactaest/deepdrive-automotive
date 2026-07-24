<?php

namespace App\Http\Controllers;

use App\Models\Bando;
use App\Models\ProfiloEnte;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BandiController extends Controller
{
    // Landing page bivio
    public function landing()
    {
        return Inertia::render('Bandi/Landing');
    }

    // Pagina ricerca ente
    public function ricercaEnte(Request $request)
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();

        if ($request->boolean('embed')) {
            return response()->json(['profilo' => $profilo]);
        }

        return Inertia::render('Bandi/RicercaEnte', [
            'profilo' => $profilo
        ]);
    }

    // API ricerca bandi con filtri avanzati
    public function cerca(Request $request)
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();
        
        if (!$profilo) {
            return response()->json([
                'success' => false,
                'message' => 'Profilo non trovato. Completa il wizard.'
            ]);
        }
        
        // Recupera i filtri dalla request
        $filters = $request->all();
        
        // 1. CERCA NEL DATABASE CON FILTRI
        $bandi = Bando::where('stato', 'aperto')
            ->where('scadenza', '>=', now())
            // Filtro per livello
            ->when(!empty($filters['livello']), function($q) use ($filters) {
                $q->whereIn('livello', $filters['livello']);
            })
            // Filtro per categoria
            ->when(!empty($filters['categoria']), function($q) use ($filters) {
                $q->whereIn('categoria', $filters['categoria']);
            })
            // Filtro importo minimo
            ->when(!empty($filters['importoMin']), function($q) use ($filters) {
                $q->where('budget_totale', '>=', $filters['importoMin']);
            })
            // Filtro importo massimo
            ->when(!empty($filters['importoMax']), function($q) use ($filters) {
                $q->where('budget_totale', '<=', $filters['importoMax']);
            })
            // Filtro scadenza
            ->when(!empty($filters['scadenza']) && $filters['scadenza'] != 'tutti', function($q) use ($filters) {
                $q->where('scadenza', '<=', now()->addDays((int)$filters['scadenza']));
            })
            // Fallback ai profili se nessun filtro è selezionato
            ->when(empty($filters['livello']) && empty($filters['categoria']), function($q) use ($profilo) {
                $categorie = json_decode($profilo->categorie_interesse, true) ?? [];
                $livelli = json_decode($profilo->livelli_interesse, true) ?? [];
                if (!empty($categorie)) {
                    $q->whereIn('categoria', $categorie);
                }
                if (!empty($livelli)) {
                    $q->whereIn('livello', $livelli);
                }
            })
            ->orderBy('scadenza', 'asc')
            ->get();
        
        // 2. FALLBACK: RICERCA WEB CON DEEPSEEK (solo se database vuoto)
        if ($bandi->isEmpty()) {
            try {
                $client = new Client();
                $prompt = $this->buildDeepSeekPrompt($profilo, $filters);
                
                $response = $client->post(env('DEEPSEEK_API_URL'), [
                    'headers' => [
                        'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                        'Content-Type' => 'application/json',
                    ],
                    'json' => [
                        'model' => 'deepseek-chat',
                        'messages' => [
                            [
                                'role' => 'system',
                                'content' => 'Sei un esperto di bandi e finanziamenti per enti pubblici in Italia.'
                            ],
                            [
                                'role' => 'user',
                                'content' => $prompt
                            ],
                        ],
                        'max_tokens' => 2000,
                        'temperature' => 0.3,
                    ],
                ]);
                
                $body = json_decode($response->getBody(), true);
                $risposta = $body['choices'][0]['message']['content'];
                
                preg_match('/\{.*\}/s', $risposta, $matches);
                $bandiWeb = json_decode($matches[0] ?? '{}', true);
                
                // Salva i bandi trovati nel database
                foreach ($bandiWeb['bandi'] ?? [] as $bandoData) {
                    // Verifica se esiste già
                    $esistente = Bando::where('titolo', $bandoData['titolo'])->first();
                    if (!$esistente) {
                        Bando::create([
                            'titolo' => $bandoData['titolo'],
                            'descrizione' => $bandoData['descrizione'],
                            'ente_erogatore' => $bandoData['ente'],
                            'scadenza' => $bandoData['scadenza'],
                            'budget_totale' => $bandoData['budget'] ?? null,
                            'livello' => $bandoData['livello'],
                            'categoria' => $bandoData['categoria'],
                            'stato' => 'aperto',
                            'fonte' => 'web_search'
                        ]);
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'bandi' => $bandiWeb['bandi'] ?? [],
                    'fallback' => true,
                    'message' => 'Trovati ' . count($bandiWeb['bandi'] ?? []) . ' bandi tramite ricerca web'
                ]);
                
            } catch (\Exception $e) {
                return response()->json([
                    'success' => false,
                    'bandi' => [],
                    'error' => $e->getMessage(),
                    'message' => 'Errore durante la ricerca web: ' . $e->getMessage()
                ]);
            }
        }
        
        // 3. CALCOLA PUNTEGGIO DI MATCH
        $bandiConPunteggio = $bandi->map(function($bando) use ($profilo) {
            $punteggio = $this->calcolaPunteggioMatch($bando, $profilo);
            $giorniScadenza = now()->diffInDays($bando->scadenza);
            
            return [
                'id' => $bando->id,
                'titolo' => $bando->titolo,
                'descrizione' => $bando->descrizione,
                'ente_erogatore' => $bando->ente_erogatore,
                'scadenza' => $bando->scadenza->format('d/m/Y'),
                'giorni_scadenza' => $giorniScadenza,
                'budget_totale' => $bando->budget_totale ? number_format($bando->budget_totale / 1000000, 1) . 'M €' : 'N/D',
                'livello' => $bando->livello,
                'categoria' => $bando->categoria,
                'punteggio' => $punteggio,
                'stato' => $bando->stato
            ];
        })->sortByDesc('punteggio')->values();
        
        return response()->json([
            'success' => true,
            'bandi' => $bandiConPunteggio,
            'fallback' => false,
            'message' => 'Trovati ' . $bandiConPunteggio->count() . ' bandi nel database'
        ]);
    }

    private function buildDeepSeekPrompt($profilo, $filters = [])
    {
        $categorie = !empty($filters['categoria']) ? $filters['categoria'] : (json_decode($profilo->categorie_interesse, true) ?? []);
        $livelli = !empty($filters['livello']) ? $filters['livello'] : (json_decode($profilo->livelli_interesse, true) ?? []);
        
        $importoTesto = '';
        if (!empty($filters['importoMin']) || !empty($filters['importoMax'])) {
            $importoTesto = "- Importo: ";
            if (!empty($filters['importoMin'])) $importoTesto .= "minimo €" . number_format($filters['importoMin'], 0, ',', '.');
            if (!empty($filters['importoMax'])) $importoTesto .= " massimo €" . number_format($filters['importoMax'], 0, ',', '.');
            $importoTesto .= "\n";
        }
        
        $scadenzaTesto = '';
        if (!empty($filters['scadenza']) && $filters['scadenza'] != 'tutti') {
            $scadenzaTesto = "- Scadenza entro {$filters['scadenza']} giorni\n";
        }
        
        return "Cerca bandi reali attualmente aperti in Italia per un ente pubblico con queste caratteristiche:
- Tipo ente: {$profilo->tipo_ente}
- Regione: {$profilo->regione}
- Provincia: {$profilo->provincia}
- Comune: {$profilo->comune}
- Categorie interesse: " . implode(', ', $categorie) . "
- Livelli interesse: " . implode(', ', $livelli) . "
{$importoTesto}{$scadenzaTesto}
Rispondi SOLO in formato JSON:
{
    \"bandi\": [
        {
            \"titolo\": \"...\",
            \"ente\": \"...\",
            \"scadenza\": \"YYYY-MM-DD\",
            \"budget\": 0,
            \"livello\": \"regionale/nazionale/europeo\",
            \"categoria\": \"...\",
            \"descrizione\": \"...\"
        }
    ]
}";
    }

    private function calcolaPunteggioMatch($bando, $profilo)
    {
        $punteggio = 70; // Punteggio base
        
        // Match categoria (+10 punti)
        $categorie = json_decode($profilo->categorie_interesse, true) ?? [];
        if (in_array($bando->categoria, $categorie)) {
            $punteggio += 10;
        }
        
        // Match livello (+10 punti)
        $livelli = json_decode($profilo->livelli_interesse, true) ?? [];
        if (in_array($bando->livello, $livelli)) {
            $punteggio += 10;
        }
        
        // Budget adeguato (+5 punti)
        if ($bando->budget_totale && $bando->budget_totale <= 10000000) {
            $punteggio += 5;
        }
        
        // Scadenza lontana (+5 punti)
        $giorniScadenza = now()->diffInDays($bando->scadenza);
        if ($giorniScadenza > 60) {
            $punteggio += 5;
        }
        
        // Bonus se nella stessa regione (+5 punti) - da implementare con geoposizionamento
        if ($bando->regione && $bando->regione == $profilo->regione) {
            $punteggio += 5;
        }
        
        return min($punteggio, 100);
    }

    // Dettaglio singolo bando
    public function show($id)
    {
        $bando = Bando::findOrFail($id);
        
        return Inertia::render('Bandi/Show', [
            'bando' => $bando
        ]);
    }
}