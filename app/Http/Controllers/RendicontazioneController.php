<?php

namespace App\Http\Controllers;

use App\Models\Rendicontazione;
use App\Services\ConformitaSpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RendicontazioneController extends Controller
{
    public function index(Request $request)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();

        $progetti = Rendicontazione::whereIn('user_id', $gruppoIds)
            ->with('bando:id,titolo')
            ->withCount(['spese', 'milestone'])
            ->latest()
            ->get()
            ->map(fn (Rendicontazione $r) => [
                'id'                    => $r->id,
                'titolo_progetto'       => $r->titolo_progetto,
                'bando_titolo'          => $r->bando?->titolo,
                'importo_finanziato'    => (float) $r->importo_finanziato,
                'stato'                 => $r->stato,
                'data_fine'             => $r->data_fine->toDateString(),
                'avanzamento_finanziario' => $r->percentualeAvanzamentoFinanziario(),
                'spese_count'           => $r->spese_count,
                'milestone_count'       => $r->milestone_count,
            ]);

        if ($request->boolean('embed')) {
            return response()->json(['progetti' => $progetti]);
        }

        return Inertia::render('Ente/Rendicontazione/Index', [
            'progetti' => $progetti,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'bando_id'                => 'required|exists:bandi_importati,id',
            'titolo_progetto'         => 'required|string|max:255',
            'importo_finanziato'      => 'required|numeric|min:0',
            'importo_cofinanziamento' => 'nullable|numeric|min:0',
            'data_inizio'             => 'required|date',
            'data_fine'               => 'required|date|after:data_inizio',
            'note'                    => 'nullable|string',
        ]);

        $rendicontazione = Rendicontazione::create(array_merge($data, [
            'user_id' => Auth::id(),
            'stato'   => 'in_corso',
        ]));

        return redirect()->route('rendicontazione.show', $rendicontazione->id);
    }

    public function show(int $id, ConformitaSpesaService $conformita)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();

        $rendicontazione = Rendicontazione::whereIn('user_id', $gruppoIds)
            ->with([
                'bando:id,titolo,categoria,regione,livello',
                'spese' => fn ($q) => $q->orderByDesc('data_spesa'),
                'milestone',
                'report' => fn ($q) => $q->orderByDesc('generato_at'),
            ])
            ->findOrFail($id);

        return Inertia::render('Ente/Rendicontazione/Show', [
            'rendicontazione' => array_merge($rendicontazione->toArray(), [
                'avanzamento_finanziario' => $rendicontazione->percentualeAvanzamentoFinanziario(),
                'avanzamento_temporale'   => $rendicontazione->percentualeAvanzamentoTemporale(),
                'alert_spese_generali'    => $conformita->alertSpeseGenerali($rendicontazione),
            ]),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $rendicontazione = Rendicontazione::whereIn('user_id', $gruppoIds)->findOrFail($id);

        $data = $request->validate([
            'titolo_progetto'         => 'sometimes|required|string|max:255',
            'importo_finanziato'      => 'sometimes|required|numeric|min:0',
            'importo_cofinanziamento' => 'nullable|numeric|min:0',
            'data_inizio'             => 'sometimes|required|date',
            'data_fine'               => 'sometimes|required|date|after:data_inizio',
            'stato'                   => 'sometimes|required|in:in_corso,completata,chiusa',
            'note'                    => 'nullable|string',
        ]);

        $rendicontazione->update($data);

        return response()->json(['rendicontazione' => $rendicontazione]);
    }

    public function destroy(int $id)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $rendicontazione = Rendicontazione::whereIn('user_id', $gruppoIds)->where('id', $id)->first();

        if ($rendicontazione) {
            Storage::disk('local')->deleteDirectory("rendicontazioni/{$rendicontazione->id}");
            $rendicontazione->delete();
        }

        return redirect()->route('rendicontazione.index');
    }
}
