<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="utf-8">
    <title>Invito DeepBandi</title>
</head>
<body style="font-family: sans-serif; background:#f4f4f5; padding:24px; color:#1f2937;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; padding:32px; border:1px solid #e5e7eb;">
        <h1 style="font-size:18px; margin:0 0 16px;">🤝 Sei stato invitato su DeepBandi</h1>

        <p style="margin:0 0 24px;">
            <strong>{{ $nomeInvitante }}</strong> ti ha invitato a collaborare sul Calendario Scadenze del suo ente.
            Clicca sul link qui sotto per creare il tuo account e iniziare.
        </p>

        <a href="{{ $urlAccettazione }}" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; padding:10px 20px; border-radius:8px; font-weight:600;">
            Accetta l'invito
        </a>

        <p style="margin:24px 0 0; font-size:12px; color:#6b7280;">
            Il link è valido per 7 giorni. Se non ti aspettavi questo invito, puoi ignorare questa email.
        </p>
    </div>
</body>
</html>
