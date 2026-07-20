<?php

namespace App\Http\Controllers;

use App\Models\Rendicontazione;
use App\Models\RendicontazioneSpesa;
use App\Services\ConformitaSpesaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RendicontazioneSpesaController extends Controller
{
    private const CATEGORIE = [
        'personale_interno', 'consulenze_esterne', 'attrezzature', 'materiali_forniture',
        'servizi_informatici', 'comunicazione', 'spese_generali', 'missioni_trasferte', 'formazione',
    ];

    private function rendicontazione(int $rendicontazioneId): Rendicontazione
    {
        return Rendicontazione::whereIn('user_id', Auth::user()->gruppoEnteIds())->findOrFail($rendicontazioneId);
    }

    public function store(Request $request, int $rendicontazioneId, ConformitaSpesaService $conformita)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);

        $data = $request->validate([
            'categoria'      => 'required|in:' . implode(',', self::CATEGORIE),
            'descrizione'    => 'required|string|max:255',
            'importo'        => 'required|numeric|min:0',
            'data_spesa'     => 'required|date',
            'fornitore'      => 'nullable|string|max:255',
            'numero_fattura' => 'nullable|string|max:255',
        ]);

        $data = array_merge($data, $conformita->valutaAutomatico($rendicontazione, $data));

        $rendicontazione->spese()->create($data);

        return redirect()->back();
    }

    public function update(Request $request, int $rendicontazioneId, int $spesaId, ConformitaSpesaService $conformita)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $spesa = $rendicontazione->spese()->findOrFail($spesaId);

        $data = $request->validate([
            'categoria'      => 'sometimes|required|in:' . implode(',', self::CATEGORIE),
            'descrizione'    => 'sometimes|required|string|max:255',
            'importo'        => 'sometimes|required|numeric|min:0',
            'data_spesa'     => 'sometimes|required|date',
            'fornitore'      => 'nullable|string|max:255',
            'numero_fattura' => 'nullable|string|max:255',
            'ammissibile'    => 'nullable|boolean',
            'note_conformita'=> 'nullable|string|max:1000',
        ]);

        // La data cambia e l'utente non ha corretto manualmente il badge: riapplica la regola oggettiva sul periodo.
        if (array_key_exists('data_spesa', $data) && !array_key_exists('ammissibile', $data)) {
            $data = array_merge($data, $conformita->valutaAutomatico($rendicontazione, array_merge($spesa->toArray(), $data)));
        }

        $spesa->update($data);

        return redirect()->back();
    }

    public function destroy(int $rendicontazioneId, int $spesaId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $spesa = $rendicontazione->spese()->findOrFail($spesaId);

        if ($spesa->allegato_path) {
            Storage::disk('local')->delete($spesa->allegato_path);
        }

        $spesa->delete();

        return redirect()->back();
    }

    public function upload(Request $request, int $rendicontazioneId, int $spesaId, ConformitaSpesaService $conformita)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $spesa = $rendicontazione->spese()->findOrFail($spesaId);

        $request->validate(['file' => 'required|file|max:10240']);

        if ($spesa->allegato_path) {
            Storage::disk('local')->delete($spesa->allegato_path);
        }

        $path = $request->file('file')->store("rendicontazioni/{$rendicontazione->id}/spese/{$spesa->id}", 'local');

        $update = ['allegato_path' => $path];

        // Se era "da verificare" (nessun giudizio manuale ancora), l'allegato appena caricato può sbloccare l'ammissibilità.
        if ($spesa->ammissibile === null) {
            $update = array_merge($update, $conformita->valutaAutomatico($rendicontazione, array_merge($spesa->toArray(), $update)));
        }

        $spesa->update($update);

        return redirect()->back();
    }

    public function download(int $rendicontazioneId, int $spesaId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $spesa = $rendicontazione->spese()->findOrFail($spesaId);

        if (!$spesa->allegato_path || !Storage::disk('local')->exists($spesa->allegato_path)) {
            abort(404);
        }

        return Storage::disk('local')->download($spesa->allegato_path);
    }
}
