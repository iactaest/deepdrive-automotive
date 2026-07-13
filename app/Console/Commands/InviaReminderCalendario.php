<?php

namespace App\Console\Commands;

use App\Mail\PromemoriaScadenzaMail;
use App\Models\CalendarioEvento;
use App\Models\CalendarioReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class InviaReminderCalendario extends Command
{
    protected $signature = 'calendario:invia-reminder
                            {--dry-run : Mostra cosa verrebbe inviato senza inviare}';

    protected $description = 'Invia i promemoria email per le scadenze del Calendario Scadenze (7/15/30 giorni prima)';

    private const OFFSETS_GIORNI = [30, 15, 7];

    public function handle(): void
    {
        $dryRun = (bool) $this->option('dry-run');
        $oggi   = today();
        $inviati = 0;

        $eventi = CalendarioEvento::with(['bando', 'user'])->get();

        foreach ($eventi as $evento) {
            $scadenza = $evento->scadenzaEffettiva();

            if (!$scadenza || $scadenza->isPast() || !$evento->user) {
                continue;
            }

            $giorniRimanenti = $oggi->diffInDays($scadenza, false);

            foreach (self::OFFSETS_GIORNI as $offset) {
                if ($giorniRimanenti > $offset) {
                    continue;
                }

                $giaInviato = CalendarioReminder::where('calendario_evento_id', $evento->id)
                    ->where('giorni_anticipo', $offset)
                    ->where('scadenza_riferimento', $scadenza->toDateString())
                    ->exists();

                if ($giaInviato) {
                    continue;
                }

                $titolo = $evento->tipo === 'bando' ? $evento->bando?->titolo : $evento->titolo;
                $this->line(($dryRun ? '[DRY-RUN] ' : '') . "Reminder {$offset}gg -> {$evento->user->email} : {$titolo} (scad. {$scadenza->toDateString()})");

                if (!$dryRun) {
                    Mail::to($evento->user->email)->send(
                        new PromemoriaScadenzaMail($evento, $offset, $scadenza)
                    );

                    CalendarioReminder::create([
                        'calendario_evento_id' => $evento->id,
                        'user_id'              => $evento->user_id,
                        'giorni_anticipo'      => $offset,
                        'scadenza_riferimento' => $scadenza->toDateString(),
                        'inviato_at'           => now(),
                    ]);
                }

                $inviati++;
            }
        }

        $this->info("✅ {$inviati} promemoria " . ($dryRun ? 'da inviare (dry-run)' : 'inviati') . '.');
    }
}
