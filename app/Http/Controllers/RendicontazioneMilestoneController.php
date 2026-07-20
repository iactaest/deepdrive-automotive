<?php

namespace App\Http\Controllers;

use App\Models\Rendicontazione;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RendicontazioneMilestoneController extends Controller
{
    private function rendicontazione(int $rendicontazioneId): Rendicontazione
    {
        return Rendicontazione::whereIn('user_id', Auth::user()->gruppoEnteIds())->findOrFail($rendicontazioneId);
    }

    public function store(Request $request, int $rendicontazioneId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);

        $data = $request->validate([
            'titolo'        => 'required|string|max:255',
            'descrizione'   => 'nullable|string',
            'data_prevista' => 'nullable|date',
            'note'          => 'nullable|string',
        ]);

        $ordineMassimo = $rendicontazione->milestone()->max('ordine');
        $data['ordine'] = $ordineMassimo === null ? 0 : $ordineMassimo + 1;

        $rendicontazione->milestone()->create($data);

        return redirect()->back();
    }

    public function update(Request $request, int $rendicontazioneId, int $milestoneId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $milestone = $rendicontazione->milestone()->findOrFail($milestoneId);

        $data = $request->validate([
            'titolo'                  => 'sometimes|required|string|max:255',
            'descrizione'             => 'nullable|string',
            'data_prevista'           => 'nullable|date',
            'data_completamento'      => 'nullable|date',
            'stato'                   => 'sometimes|required|in:da_fare,in_corso,completata',
            'percentuale_avanzamento' => 'sometimes|required|integer|min:0|max:100',
            'note'                    => 'nullable|string',
        ]);

        $milestone->update($data);

        return redirect()->back();
    }

    public function riordina(Request $request, int $rendicontazioneId, int $milestoneId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $milestone = $rendicontazione->milestone()->findOrFail($milestoneId);

        $data = $request->validate(['ordine' => 'required|integer']);

        $milestone->update(['ordine' => $data['ordine']]);

        return response()->json(['milestone' => $milestone]);
    }

    public function destroy(int $rendicontazioneId, int $milestoneId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $rendicontazione->milestone()->where('id', $milestoneId)->delete();

        return redirect()->back();
    }
}
