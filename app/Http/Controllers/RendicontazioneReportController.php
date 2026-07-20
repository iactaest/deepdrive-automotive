<?php

namespace App\Http\Controllers;

use App\Models\Rendicontazione;
use App\Services\RendicontazioneReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class RendicontazioneReportController extends Controller
{
    private function rendicontazione(int $rendicontazioneId): Rendicontazione
    {
        return Rendicontazione::whereIn('user_id', Auth::user()->gruppoEnteIds())->findOrFail($rendicontazioneId);
    }

    public function genera(Request $request, int $rendicontazioneId, RendicontazioneReportService $service)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);

        $data = $request->validate([
            'tipo'       => 'required|in:intermedio,finale',
            'periodo_da' => 'required|date',
            'periodo_a'  => 'required|date|after_or_equal:periodo_da',
        ]);

        $service->genera($rendicontazione, $data['tipo'], $data['periodo_da'], $data['periodo_a']);

        return redirect()->back();
    }

    public function download(int $rendicontazioneId, int $reportId)
    {
        $rendicontazione = $this->rendicontazione($rendicontazioneId);
        $report = $rendicontazione->report()->findOrFail($reportId);

        if (!Storage::disk('local')->exists($report->path_pdf)) {
            abort(404);
        }

        $nomeFile = "rendicontazione-{$report->tipo}-{$rendicontazione->id}-{$report->id}.pdf";

        return Storage::disk('local')->download($report->path_pdf, $nomeFile);
    }
}
