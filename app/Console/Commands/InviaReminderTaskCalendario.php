<?php

namespace App\Console\Commands;

use App\Mail\PromemoriaTaskMail;
use App\Models\CalendarioTask;
use App\Models\CalendarioTaskReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class InviaReminderTaskCalendario extends Command
{
    protected $signature = 'calendario:invia-reminder-task
                            {--dry-run : Mostra cosa verrebbe inviato senza inviare}';

    protected $description = 'Invia i promemoria email agli assegnatari dei task del Calendario Scadenze (7/15/30 giorni prima)';

    private const OFFSETS_GIORNI = [30, 15, 7];

    public function handle(): void
    {
        $dryRun = (bool) $this->option('dry-run');
        $oggi   = today();
        $inviati = 0;

        $task = CalendarioTask::whereNotNull('scadenza')
            ->whereNotNull('assegnato_user_id')
            ->where('stato', '!=', 'completato')
            ->with(['assegnatoUtente', 'evento'])
            ->get();

        foreach ($task as $t) {
            if ($t->scadenza->isPast() || !$t->assegnatoUtente) {
                continue;
            }

            $giorniRimanenti = $oggi->diffInDays($t->scadenza, false);

            foreach (self::OFFSETS_GIORNI as $offset) {
                if ($giorniRimanenti > $offset) {
                    continue;
                }

                $giaInviato = CalendarioTaskReminder::where('calendario_task_id', $t->id)
                    ->where('giorni_anticipo', $offset)
                    ->where('scadenza_riferimento', $t->scadenza->toDateString())
                    ->exists();

                if ($giaInviato) {
                    continue;
                }

                $this->line(($dryRun ? '[DRY-RUN] ' : '') . "Reminder task {$offset}gg -> {$t->assegnatoUtente->email} : {$t->titolo} (scad. {$t->scadenza->toDateString()})");

                if (!$dryRun) {
                    Mail::to($t->assegnatoUtente->email)->send(
                        new PromemoriaTaskMail($t, $offset, $t->scadenza)
                    );

                    CalendarioTaskReminder::create([
                        'calendario_task_id'   => $t->id,
                        'user_id'              => $t->assegnato_user_id,
                        'giorni_anticipo'      => $offset,
                        'scadenza_riferimento' => $t->scadenza->toDateString(),
                        'inviato_at'           => now(),
                    ]);
                }

                $inviati++;
            }
        }

        $this->info("✅ {$inviati} promemoria task " . ($dryRun ? 'da inviare (dry-run)' : 'inviati') . '.');
    }
}
