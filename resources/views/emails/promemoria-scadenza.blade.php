<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <title>Promemoria scadenza</title>
</head>
<body style="font-family: sans-serif; background:#f4f4f5; padding:24px; color:#1f2937;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; border:1px solid #e5e7eb;">
        <h1 style="font-size:18px; margin:0 0 16px;">⏰ Scadenza tra {{ $giorniAnticipo }} giorni</h1>

        <p style="margin:0 0 8px; font-size:16px; font-weight:600;">{{ $titolo }}</p>
        <p style="margin:0 0 24px; color:#6b7280;">Scadenza: {{ $scadenza->format('d/m/Y') }}</p>

        @if ($taskAperti->isNotEmpty())
            <p style="font-weight:600; margin:0 0 8px;">Task ancora aperti:</p>
            <ul style="margin:0 0 24px; padding-left:20px;">
                @foreach ($taskAperti as $task)
                    <li style="margin-bottom:4px;">
                        {{ $task->titolo }}
                        @if ($task->assegnato_a)
                            <span style="color:#6b7280;">— {{ $task->assegnato_a }}</span>
                        @endif
                    </li>
                @endforeach
            </ul>
        @endif

        <a href="{{ $linkCalendario }}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; padding:10px 20px; border-radius:8px; font-weight:600;">
            Apri il Calendario Scadenze
        </a>
    </div>
</body>
</html>
