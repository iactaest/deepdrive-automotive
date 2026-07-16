<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarioTask extends Model
{
    protected $table = 'calendario_task';

    protected $fillable = [
        // 'assegnato_a' (string libero) è deprecato: sostituito da assegnato_user_id
        // (utente reale del gruppo ente). Resta in tabella/fillable per compatibilità
        // con dati storici, ma il codice nuovo non la legge/scrive più.
        'calendario_evento_id', 'user_id', 'titolo', 'descrizione', 'assegnato_a',
        'assegnato_user_id', 'priorita', 'stato', 'scadenza', 'ordine', 'completato_il',
    ];

    protected $casts = [
        'scadenza'      => 'date',
        'completato_il' => 'datetime',
        'ordine'        => 'integer',
    ];

    public function evento(): BelongsTo
    {
        return $this->belongsTo(CalendarioEvento::class, 'calendario_evento_id');
    }

    public function assegnatoUtente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assegnato_user_id');
    }
}
