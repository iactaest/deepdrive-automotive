<?php

namespace App\Mail;

use App\Models\CalendarioTask;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PromemoriaTaskMail extends Mailable implements \Illuminate\Contracts\Queue\ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public CalendarioTask $task,
        public int $giorniAnticipo,
        public Carbon $scadenza,
    ) {
        $this->task->loadMissing('evento.bando');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Task in scadenza tra {$this->giorniAnticipo} giorni: {$this->task->titolo}",
        );
    }

    public function content(): Content
    {
        $evento = $this->task->evento;
        $titoloEvento = $evento->tipo === 'bando' ? $evento->bando?->titolo : $evento->titolo;

        return new Content(
            view: 'emails.promemoria-task',
            with: [
                'titoloTask'     => $this->task->titolo,
                'titoloEvento'   => $titoloEvento,
                'scadenza'       => $this->scadenza,
                'giorniAnticipo' => $this->giorniAnticipo,
                'priorita'       => $this->task->priorita,
                'linkCalendario' => url('/ente/calendario'),
            ],
        );
    }
}
