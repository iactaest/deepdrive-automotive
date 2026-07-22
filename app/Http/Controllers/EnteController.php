<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ProfiloEnte;
use App\Models\BandiMatch;
use App\Models\ProgettoOpenCoesione;
use App\Models\Rendicontazione;

class EnteController extends Controller
{
   public function index()
{
    // enteEffettivoUserId(): un dipendente invitato non ha un proprio ProfiloEnte, condivide
    // quello del titolare — altrimenti finirebbe sempre reindirizzato al wizard.
    $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();

    // Se il profilo non esiste o non è completo, reindirizza al wizard
    if (!$profilo || !$profilo->profilo_completo) {
        return redirect()->route('ente.profilo.create');
    }

    return Inertia::render('Ente/Dashboard', [
        'profilo' => $profilo,
        'dashboard' => $this->buildDashboardData($profilo),
    ]);
}

    public function menu()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();

        if (!$profilo || !$profilo->profilo_completo) {
            return redirect()->route('ente.profilo.create');
        }

        return Inertia::render('Ente/MenuBolle');
    }

    /**
     * Costruisce i dati reali per la dashboard a partire da bandi_match (calcolati dal
     * comando batch bandi:calculate-matches) e dallo storico OpenCoesione per il
     * territorio dell'ente. La dashboard era prima interamente popolata con dati finti.
     */
    private function buildDashboardData(ProfiloEnte $profilo): array
    {
        $matches = BandiMatch::where('user_id', $profilo->user_id)
            ->with('bando')
            ->get()
            ->filter(fn ($m) => $m->bando !== null);

        $aperti      = $matches->filter(fn ($m) => $m->bando->stato === 'aperto');
        $inScadenza  = $matches->filter(fn ($m) => $m->bando->stato === 'in_scadenza');
        $attivi      = $matches->filter(fn ($m) => in_array($m->bando->stato, ['aperto', 'in_scadenza']));

        $perCategoria = $attivi->groupBy(fn ($m) => $m->bando->categoria ?: 'Non specificato')
            ->map->count()
            ->sortDesc()
            ->take(6);

        $perLivello = $attivi->groupBy(fn ($m) => ucfirst($m->bando->livello ?: 'non specificato'))
            ->map(fn ($group) => (float) $group->sum(fn ($m) => $m->bando->budget_totale ?? 0))
            ->filter(fn ($somma) => $somma > 0);

        $prossimeScadenze = $attivi
            ->filter(fn ($m) => $m->bando->scadenza !== null)
            ->sortBy(fn ($m) => $m->bando->scadenza)
            ->take(3)
            ->map(fn ($m) => [
                'titolo'   => $m->bando->titolo,
                'scadenza' => $m->bando->scadenza->toDateString(),
                'giorni'   => max(0, (int) round(now()->diffInDays($m->bando->scadenza, false))),
                'budget'   => $m->bando->budget_totale ? (float) $m->bando->budget_totale : null,
            ])->values();

        $gareConsigliate = $attivi
            ->sortByDesc('punteggio_compatibilita')
            ->take(3)
            ->map(fn ($m) => [
                'id'        => $m->bando->id,
                'titolo'    => $m->bando->titolo,
                'match'     => $m->punteggio_compatibilita,
                'budget'    => $m->bando->budget_totale ? (float) $m->bando->budget_totale : null,
            ])->values();

        // Storico OpenCoesione: territorio dell'ente (provincia, fallback regione)
        $storicoQuery = ProgettoOpenCoesione::query();
        if ($profilo->provincia) {
            $storicoQuery->whereRaw('UPPER(oc_provincia) = ?', [mb_strtoupper($profilo->provincia)]);
        } elseif ($profilo->regione) {
            $storicoQuery->whereRaw('UPPER(oc_regione) = ?', [mb_strtoupper($profilo->regione)]);
        }

        $storicoCount   = (clone $storicoQuery)->count();
        $storicoImporto = (float) (clone $storicoQuery)->sum('oc_importo');

        $gruppoIds = auth()->user()->gruppoEnteIds();
        $progettiRendicontazione = Rendicontazione::whereIn('user_id', $gruppoIds)->count();
        $speseRegistrateTotali   = (float) \App\Models\RendicontazioneSpesa::whereHas(
            'rendicontazione', fn ($q) => $q->whereIn('user_id', $gruppoIds)
        )->sum('importo');

        $trendAnnuale = (clone $storicoQuery)
            ->whereNotNull('anno_fine')
            ->where('anno_fine', '>=', now()->year - 9)
            ->selectRaw('anno_fine as anno, COUNT(*) as totale')
            ->groupBy('anno_fine')
            ->orderBy('anno_fine')
            ->get()
            ->map(fn ($r) => ['anno' => (string) $r->anno, 'totale' => (int) $r->totale]);

        return [
            'stats' => [
                'bandi_attivi'    => $attivi->count(),
                'budget_mediano'  => $this->mediana($aperti->map(fn ($m) => (float) ($m->bando->budget_totale ?? 0))->filter()->values()->all()),
                'in_scadenza'     => $inScadenza->count(),
                'storico_progetti' => $storicoCount,
                'storico_importo' => $storicoImporto,
                'progetti_rendicontazione' => $progettiRendicontazione,
                'spese_registrate_totali'  => $speseRegistrateTotali,
            ],
            'per_categoria'      => ['labels' => $perCategoria->keys()->values(), 'valori' => $perCategoria->values()],
            'per_livello'        => ['labels' => $perLivello->keys()->values(), 'valori' => $perLivello->values()],
            'trend_storico'      => ['labels' => $trendAnnuale->pluck('anno'), 'valori' => $trendAnnuale->pluck('totale')],
            'prossime_scadenze'  => $prossimeScadenze,
            'gare_consigliate'   => $gareConsigliate,
        ];
    }

    /**
     * Mediana invece di somma: un singolo bando nazionale enorme (es. DM FER2, 36+ miliardi)
     * altrimenti domina la somma dei budget rendendola poco rappresentativa dei bandi
     * effettivamente rilevanti per un ente locale.
     */
    private function mediana(array $valori): ?float
    {
        if (empty($valori)) return null;

        sort($valori);
        $n   = count($valori);
        $mid = intdiv($n, 2);

        return $n % 2 === 0 ? ($valori[$mid - 1] + $valori[$mid]) / 2 : $valori[$mid];
    }

    public function profilo()
    {
        $profilo = ProfiloEnte::where('user_id', auth()->user()->enteEffettivoUserId())->first();
        
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