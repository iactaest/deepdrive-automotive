<?php

namespace App\Services;

use App\Models\ProfiloEnte;
use App\Models\Rendicontazione;
use App\Models\RendicontazioneReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class RendicontazioneReportService
{
    public function genera(Rendicontazione $rendicontazione, string $tipo, string $periodoDa, string $periodoA): RendicontazioneReport
    {
        $spesePeriodo = $rendicontazione->spese()
            ->whereBetween('data_spesa', [$periodoDa, $periodoA])
            ->orderBy('data_spesa')
            ->get();

        $totaleSpese          = (float) $spesePeriodo->sum('importo');
        $speseAmmissibili     = (float) $spesePeriodo->where('ammissibile', '===', true)->sum('importo');
        $speseNonAmmissibili  = (float) $spesePeriodo->where('ammissibile', '===', false)->sum('importo');
        $speseDaVerificare    = $spesePeriodo->whereNull('ammissibile');

        $milestonePeriodo = $rendicontazione->milestone()
            ->where('stato', 'completata')
            ->whereBetween('data_completamento', [$periodoDa, $periodoA])
            ->get();

        $percentualeAvanzamento = (int) round($rendicontazione->percentualeAvanzamentoFinanziario());

        $profilo = ProfiloEnte::where('user_id', $rendicontazione->user_id)->first();

        $pdf = Pdf::loadView('pdf.rendicontazione-report', [
            'rendicontazione'       => $rendicontazione,
            'profilo'               => $profilo,
            'tipo'                  => $tipo,
            'periodoDa'             => $periodoDa,
            'periodoA'              => $periodoA,
            'spesePeriodo'          => $spesePeriodo,
            'totaleSpese'           => $totaleSpese,
            'speseAmmissibili'      => $speseAmmissibili,
            'speseNonAmmissibili'   => $speseNonAmmissibili,
            'speseDaVerificare'     => $speseDaVerificare,
            'milestonePeriodo'      => $milestonePeriodo,
            'percentualeAvanzamento' => $percentualeAvanzamento,
            'generatoAt'            => now(),
        ]);

        $nomeFile = "report-{$tipo}-" . now()->timestamp . '.pdf';
        $path = "rendicontazioni/{$rendicontazione->id}/report/{$nomeFile}";
        Storage::disk('local')->put($path, $pdf->output());

        return $rendicontazione->report()->create([
            'tipo'                    => $tipo,
            'periodo_da'              => $periodoDa,
            'periodo_a'               => $periodoA,
            'totale_spese'            => $totaleSpese,
            'spese_ammissibili'       => $speseAmmissibili,
            'spese_non_ammissibili'   => $speseNonAmmissibili,
            'percentuale_avanzamento' => $percentualeAvanzamento,
            'generato_at'             => now(),
            'path_pdf'                => $path,
        ]);
    }
}
