<?php

namespace App\Mail;

use App\Models\CalendarioEvento;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PromemoriaScadenzaMail extends Mailable implements \Illuminate\Contracts\Queue\ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public CalendarioEvento $evento,
        public int $giorniAnticipo,
        public Carbon $scadenza,
    ) {
        $this->evento->loadMissing(['bando', 'tasks']);
    }

    public function envelope(): Envelope
    {
        $titolo = $this->evento->tipo === 'bando' ? $this->evento->bando?->titolo : $this->evento->titolo;

        return new Envelope(
            subject: "⏰ Scadenza bando tra {$this->giorniAnticipo} giorni: {$titolo}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.promemoria-scadenza',
            with: [
                'titolo'        => $this->evento->tipo === 'bando' ? $this->evento->bando?->titolo : $this->evento->titolo,
                'scadenza'      => $this->scadenza,
                'giorniAnticipo' => $this->giorniAnticipo,
                'taskAperti'    => $this->evento->tasks->where('stato', '!=', 'completato'),
                'linkCalendario' => url('/ente/calendario'),
            ],
        );
    }
}
