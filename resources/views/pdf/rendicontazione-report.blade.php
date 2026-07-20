<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; }
    h1 { font-size: 18px; margin-bottom: 2px; }
    h2 { font-size: 13px; margin-top: 22px; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .subtitolo { color: #64748b; margin-top: 0; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { text-align: left; padding: 5px 6px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; color: #475569; }
    .num { text-align: right; }
    .badge { padding: 2px 6px; border-radius: 3px; font-size: 10px; }
    .badge-si { background: #d1fae5; color: #047857; }
    .badge-no { background: #fee2e2; color: #b91c1c; }
    .badge-verifica { background: #fef9c3; color: #a16207; }
    .riepilogo { width: 100%; margin-bottom: 4px; }
    .riepilogo td { border: none; padding: 3px 6px; }
    .riepilogo .etichetta { color: #64748b; }
    .footer { margin-top: 40px; font-size: 10px; color: #94a3b8; }
    .firma { margin-top: 60px; }
    .firma-linea { border-top: 1px solid #94a3b8; width: 220px; margin-top: 40px; padding-top: 4px; }
</style>
</head>
<body>

    <h1>Report di Rendicontazione — {{ $tipo === 'finale' ? 'Finale' : 'Intermedio' }}</h1>
    <p class="subtitolo">
        {{ $profilo?->nome_ente ?? 'Ente non specificato' }}
        @if($profilo?->comune) — {{ $profilo->comune }} ({{ $profilo->provincia }}) @endif
        &nbsp;·&nbsp; Generato il {{ $generatoAt->format('d/m/Y H:i') }}
    </p>

    <h2>Progetto</h2>
    <table class="riepilogo">
        <tr><td class="etichetta">Titolo progetto</td><td>{{ $rendicontazione->titolo_progetto }}</td></tr>
        <tr><td class="etichetta">Bando</td><td>{{ $rendicontazione->bando?->titolo ?? '—' }}</td></tr>
        <tr><td class="etichetta">Importo finanziato</td><td>€{{ number_format($rendicontazione->importo_finanziato, 2, ',', '.') }}</td></tr>
        <tr><td class="etichetta">Cofinanziamento</td><td>€{{ number_format($rendicontazione->importo_cofinanziamento ?? 0, 2, ',', '.') }}</td></tr>
        <tr><td class="etichetta">Periodo progetto</td><td>{{ \Carbon\Carbon::parse($rendicontazione->data_inizio)->format('d/m/Y') }} — {{ \Carbon\Carbon::parse($rendicontazione->data_fine)->format('d/m/Y') }}</td></tr>
        <tr><td class="etichetta">Periodo rendicontato</td><td>{{ \Carbon\Carbon::parse($periodoDa)->format('d/m/Y') }} — {{ \Carbon\Carbon::parse($periodoA)->format('d/m/Y') }}</td></tr>
        <tr><td class="etichetta">Avanzamento finanziario complessivo</td><td>{{ $percentualeAvanzamento }}%</td></tr>
    </table>

    <h2>Riepilogo spese nel periodo</h2>
    <table class="riepilogo">
        <tr><td class="etichetta">Totale spese</td><td>€{{ number_format($totaleSpese, 2, ',', '.') }}</td></tr>
        <tr><td class="etichetta">Spese ammissibili</td><td>€{{ number_format($speseAmmissibili, 2, ',', '.') }}</td></tr>
        <tr><td class="etichetta">Spese non ammissibili</td><td>€{{ number_format($speseNonAmmissibili, 2, ',', '.') }}</td></tr>
        <tr><td class="etichetta">Spese da verificare</td><td>{{ $speseDaVerificare->count() }} ({{ '€' . number_format($speseDaVerificare->sum('importo'), 2, ',', '.') }})</td></tr>
    </table>

    <h2>Dettaglio spese</h2>
    @if($spesePeriodo->isEmpty())
        <p>Nessuna spesa registrata nel periodo selezionato.</p>
    @else
        <table>
            <thead>
                <tr>
                    <th>Data</th><th>Categoria</th><th>Descrizione</th><th>Fornitore</th>
                    <th class="num">Importo</th><th>Stato</th>
                </tr>
            </thead>
            <tbody>
                @foreach($spesePeriodo as $spesa)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($spesa->data_spesa)->format('d/m/Y') }}</td>
                    <td>{{ str_replace('_', ' ', ucfirst($spesa->categoria)) }}</td>
                    <td>{{ $spesa->descrizione }}</td>
                    <td>{{ $spesa->fornitore ?? '—' }}</td>
                    <td class="num">€{{ number_format($spesa->importo, 2, ',', '.') }}</td>
                    <td>
                        @if($spesa->ammissibile === true)
                            <span class="badge badge-si">Ammissibile</span>
                        @elseif($spesa->ammissibile === false)
                            <span class="badge badge-no">Non ammissibile</span>
                        @else
                            <span class="badge badge-verifica">Da verificare</span>
                        @endif
                    </td>
                </tr>
                @if($spesa->ammissibile === false && $spesa->note_conformita)
                <tr><td colspan="6" style="color:#b91c1c; font-size:10px; border-bottom: none;">Motivo: {{ $spesa->note_conformita }}</td></tr>
                @endif
                @endforeach
            </tbody>
        </table>
    @endif

    <h2>Milestone completate nel periodo</h2>
    @if($milestonePeriodo->isEmpty())
        <p>Nessuna milestone completata nel periodo selezionato.</p>
    @else
        <table>
            <thead><tr><th>Titolo</th><th>Data completamento</th><th class="num">Avanzamento</th></tr></thead>
            <tbody>
                @foreach($milestonePeriodo as $m)
                <tr>
                    <td>{{ $m->titolo }}</td>
                    <td>{{ \Carbon\Carbon::parse($m->data_completamento)->format('d/m/Y') }}</td>
                    <td class="num">{{ $m->percentuale_avanzamento }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="firma">
        <div class="firma-linea">Firma del Responsabile Unico del Procedimento (RUP)</div>
    </div>

    <p class="footer">Report generato automaticamente da DeepBandi il {{ $generatoAt->format('d/m/Y H:i') }}.</p>

</body>
</html>
