<?php

namespace App\Http\Controllers;

use App\Models\BandoDocumento;
use App\Models\BandoImportato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BandoDocumentiController extends Controller
{
    private const GEMINI_MODEL = 'gemini-2.5-flash';

    /**
     * Vista globale "Cassetto Documenti": tutti i bandi per cui l'utente ha una lista
     * documenti (avviata dall'Assistente AI nel dettaglio), con lo stesso elenco/layout
     * del dettaglio bando, per completare da qui eventuali documenti mancanti.
     */
    public function cassettoGlobale()
    {
        $documenti = BandoDocumento::where('user_id', Auth::id())
            ->with('bando:id,titolo')
            ->orderByDesc('obbligatorio')
            ->orderBy('categoria')
            ->get()
            ->filter(fn ($d) => $d->bando !== null);

        $perBando = $documenti->groupBy('bando_id')->map(function ($docs) {
            $totale   = $docs->count();
            $caricati = $docs->where('stato', 'caricato')->count();

            return [
                'bando_id'      => $docs->first()->bando_id,
                'bando_titolo'  => $docs->first()->bando->titolo,
                'documenti'     => $docs->values(),
                'totale'        => $totale,
                'caricati'      => $caricati,
                'completamento' => $totale > 0 ? round($caricati / $totale * 100) : 0,
            ];
        })->sortBy('bando_titolo')->values();

        return Inertia::render('Ente/CassettoDocumenti/Index', [
            'bandi' => $perBando,
        ]);
    }

    /**
     * Vista "Cassetto Bando": elenco completo documenti con stato e download.
     */
    public function pagina(int $bandoId)
    {
        $bando = BandoImportato::findOrFail($bandoId);

        $documenti = BandoDocumento::where('user_id', Auth::id())
            ->where('bando_id', $bandoId)
            ->orderByDesc('obbligatorio')
            ->orderBy('categoria')
            ->get();

        $totale   = $documenti->count();
        $caricati = $documenti->where('stato', 'caricato')->count();

        return Inertia::render('Ente/CassettoBando', [
            'bando' => [
                'id'     => $bando->id,
                'titolo' => $bando->titolo,
            ],
            'documenti'     => $documenti,
            'totale'        => $totale,
            'caricati'      => $caricati,
            'completamento' => $totale > 0 ? round($caricati / $totale * 100) : 0,
        ]);
    }

    /**
     * Download del file caricato per un documento.
     */
    public function download(int $bandoId, int $docId)
    {
        $documento = BandoDocumento::where('id', $docId)
            ->where('user_id', Auth::id())
            ->where('bando_id', $bandoId)
            ->firstOrFail();

        if (!$documento->path_file || !Storage::disk('local')->exists($documento->path_file)) {
            abort(404);
        }

        return Storage::disk('local')->download($documento->path_file, $documento->nome_documento);
    }

    /**
     * Elenco documenti (proposti dall'AI + stato caricamento) per un bando, per l'utente corrente.
     */
    public function index(int $bandoId)
    {
        $documenti = BandoDocumento::where('user_id', Auth::id())
            ->where('bando_id', $bandoId)
            ->orderByDesc('obbligatorio')
            ->orderBy('categoria')
            ->get();

        $totale   = $documenti->count();
        $caricati = $documenti->where('stato', 'caricato')->count();

        return response()->json([
            'documenti'     => $documenti,
            'totale'        => $totale,
            'caricati'      => $caricati,
            'completamento' => $totale > 0 ? round($caricati / $totale * 100) : 0,
        ]);
    }

    /**
     * Chiama Gemini per analizzare il bando e proporre l'elenco documenti.
     * Se l'utente ha già una lista per questo bando, non la sovrascrive (idempotente):
     * i documenti già proposti (e quelli eventualmente già caricati) restano.
     */
    public function analizza(int $bandoId)
    {
        $bando  = BandoImportato::findOrFail($bandoId);
        $userId = Auth::id();

        $esistenti = BandoDocumento::where('user_id', $userId)->where('bando_id', $bandoId)->count();
        if ($esistenti > 0) {
            return $this->index($bandoId);
        }

        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return response()->json(['error' => 'GEMINI_API_KEY non configurata'], 500);
        }

        $documenti = $this->chiamaGemini($apiKey, $bando);
        if ($documenti === null) {
            return response()->json(['error' => 'Analisi AI fallita, riprova'], 502);
        }

        foreach ($documenti as $doc) {
            BandoDocumento::firstOrCreate(
                ['user_id' => $userId, 'bando_id' => $bandoId, 'nome_documento' => mb_substr($doc['titolo'] ?? 'Documento', 0, 255)],
                [
                    'descrizione'    => $doc['descrizione'] ?? null,
                    'link_ufficiale' => $doc['link_ufficiale'] ?? null,
                    'obbligatorio'   => (bool) ($doc['obbligatorio'] ?? false),
                    'categoria'      => in_array($doc['categoria'] ?? '', ['basilare', 'specifico']) ? $doc['categoria'] : 'basilare',
                    'stato'          => 'da_caricare',
                ]
            );
        }

        return $this->index($bandoId);
    }

    /**
     * Carica il file per un documento già presente nell'elenco (creato da analizza()).
     */
    public function store(Request $request, int $bandoId)
    {
        $request->validate([
            'documento_id' => 'required|exists:bando_documenti,id',
            'file'         => 'required|file|max:10240', // 10MB
        ]);

        $documento = BandoDocumento::where('id', $request->documento_id)
            ->where('user_id', Auth::id())
            ->where('bando_id', $bandoId)
            ->firstOrFail();

        // Rimuove un eventuale file precedente prima di salvare il nuovo
        if ($documento->path_file) {
            Storage::disk('local')->delete($documento->path_file);
        }

        $path = $request->file('file')->store("bandi/" . Auth::id() . "/{$bandoId}", 'local');

        $documento->update(['path_file' => $path, 'stato' => 'caricato']);

        return response()->json(['documento' => $documento]);
    }

    /**
     * Rimuove il file caricato per un documento, riportandolo a "da_caricare"
     * (il documento resta nell'elenco, non viene ricancellato il requisito proposto dall'AI).
     */
    public function destroy(int $bandoId, int $docId)
    {
        $documento = BandoDocumento::where('id', $docId)
            ->where('user_id', Auth::id())
            ->where('bando_id', $bandoId)
            ->firstOrFail();

        if ($documento->path_file) {
            Storage::disk('local')->delete($documento->path_file);
        }

        $documento->update(['path_file' => null, 'stato' => 'da_caricare']);

        return response()->json(['documento' => $documento]);
    }

    private function chiamaGemini(string $apiKey, BandoImportato $bando): ?array
    {
        $prompt = <<<PROMPT
Sei un esperto di bandi pubblici italiani. Analizza questo bando e proponi l'elenco COMPLETO dei documenti necessari per partecipare: sia quelli standard richiesti a qualunque ente pubblico, sia quelli specifici in base al tipo di bando.

Bando:
Titolo: {$bando->titolo}
Categoria: {$bando->categoria}
Target: {$bando->target}
Livello: {$bando->livello}
Fonte: {$bando->fonte}
Budget: {$bando->budget_totale}
Descrizione: {$bando->descrizione}

Documenti BASILARI da includere sempre (categoria "basilare"):
- Delibera di Giunta/Consiglio che autorizza la partecipazione
- DURC (Documento Unico di Regolarità Contributiva) - link: https://sportellounicoprevidenziale.inps.it
- Dichiarazione antimafia
- Dichiarazione assenza conflitti di interesse
- Bilancio consuntivo ultimi 2 anni
- Statuto dell'ente / Atto costitutivo
- CUP (Codice Unico di Progetto) - link: https://opencup.gov.it
- Piano finanziario del progetto
- DSAN (Dichiarazione Sostitutiva Atto Notorio)
- Documento identità Responsabile del Procedimento

Documenti SPECIFICI (categoria "specifico") da aggiungere se pertinenti a QUESTO bando, ad esempio:
- Se PNRR: cronoprogramma interventi, piano di monitoraggio, indicatori di risultato
- Se fondi europei (FESR/FSE): formulario specifico del programma, partenariato
- Se bando ambientale: valutazione impatto ambientale, autorizzazioni
- Se formazione: accreditamento formativo, piano didattico, CV docenti
- Se infrastrutture: progetto esecutivo, computo metrico, relazione tecnica
Valuta tu quali si applicano davvero, in base a titolo/categoria/descrizione del bando. Non includere categorie specifiche non pertinenti.

Rispondi ESCLUSIVAMENTE con un array JSON (nessun markdown, nessun testo extra), ogni elemento con questa struttura esatta:
{
  "titolo": "Nome documento",
  "descrizione": "Perché serve e cosa contiene, in 1-2 frasi",
  "link_ufficiale": "URL dove scaricarlo o richiederlo, null se non applicabile",
  "obbligatorio": true o false,
  "categoria": "basilare" oppure "specifico"
}
PROMPT;

        $url = "https://generativelanguage.googleapis.com/v1beta/models/" . self::GEMINI_MODEL . ":generateContent?key={$apiKey}";

        try {
            $response = Http::timeout(60)->post($url, [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0,
                    'responseMimeType' => 'application/json',
                ],
            ]);
        } catch (\Throwable $e) {
            return null;
        }

        if (!$response->successful()) {
            return null;
        }

        $testoRisposta = $response->json('candidates.0.content.parts.0.text');
        if (!$testoRisposta) return null;

        $testoRisposta = trim(preg_replace('/^```json|```$/m', '', $testoRisposta));
        $documenti = json_decode($testoRisposta, true);

        return is_array($documenti) ? $documenti : null;
    }
}
