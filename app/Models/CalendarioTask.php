<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarioTask extends Model
{
    protected $table = 'calendario_task';

    protected $fillable = [
        'calendario_evento_id', 'user_id', 'titolo', 'descrizione', 'assegnato_a',
        'priorita', 'stato', 'scadenza', 'ordine', 'completato_il',
    ];

    protected $casts = [
        'scadenza'      => 'date',
        'completato_il' => 'datetime',
        'ordine'        => 'integer',
    ];

    public function evento()
    {
        return $this->belongsTo(CalendarioEvento::class, 'calendario_evento_id');
    }
}
