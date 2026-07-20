<?php

namespace App\Services;

use App\Models\Rendicontazione;
use Carbon\Carbon;

class ConformitaSpesaService
{
    private const SOGLIA_SPESE_GENERALI_PERCENTO = 15;

    /** Valuta automaticamente l'ammissibilità di una spesa in base a periodo progetto e presenza allegato. */
    public function valutaAutomatico(Rendicontazione $rendicontazione, array $datiSpesa): array
    {
        $dataSpesa = Carbon::parse($datiSpesa['data_spesa']);

        if ($dataSpesa->lt($rendicontazione->data_inizio) || $dataSpesa->gt($rendicontazione->data_fine)) {
            return ['ammissibile' => false, 'note_conformita' => 'Spesa fuori dal periodo di progetto'];
        }

        if (empty($datiSpesa['allegato_path'])) {
            return ['ammissibile' => null, 'note_conformita' => 'Nessun documento giustificativo allegato — da verificare'];
        }

        return ['ammissibile' => true, 'note_conformita' => null];
    }

    /** Alert soft, mai persistito: percentuale di spese_generali sul totale ammissibile, se oltre soglia. */
    public function alertSpeseGenerali(Rendicontazione $rendicontazione): ?array
    {
        $ammissibili = $rendicontazione->spese()->where('ammissibile', true)->get();
        $totaleAmmissibile = (float) $ammissibili->sum('importo');

        if ($totaleAmmissibile <= 0) {
            return null;
        }

        $totaleSpeseGenerali = (float) $ammissibili->where('categoria', 'spese_generali')->sum('importo');
        $percentuale = round($totaleSpeseGenerali / $totaleAmmissibile * 100, 1);

        if ($percentuale <= self::SOGLIA_SPESE_GENERALI_PERCENTO) {
            return null;
        }

        return [
            'percentuale'           => $percentuale,
            'soglia'                => self::SOGLIA_SPESE_GENERALI_PERCENTO,
            'totale_spese_generali' => $totaleSpeseGenerali,
            'totale_ammissibile'    => $totaleAmmissibile,
        ];
    }
}
