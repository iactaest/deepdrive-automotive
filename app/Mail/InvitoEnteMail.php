<?php

namespace App\Mail;

use App\Models\InvitoEnte;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitoEnteMail extends Mailable implements \Illuminate\Contracts\Queue\ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public InvitoEnte $invito,
        public string $urlAccettazione,
    ) {
        $this->invito->loadMissing('invitatoDa');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Sei stato invitato su DeepBandi da {$this->invito->invitatoDa->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invito-ente',
            with: [
                'nomeInvitante'    => $this->invito->invitatoDa->name,
                'urlAccettazione'  => $this->urlAccettazione,
            ],
        );
    }
}
