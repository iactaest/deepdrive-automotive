<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CalendarioReminder extends Model
{
    protected $table = 'calendario_reminder';

    protected $fillable = [
        'calendario_evento_id', 'user_id', 'giorni_anticipo', 'scadenza_riferimento', 'inviato_at',
    ];

    protected $casts = [
        'scadenza_riferimento' => 'date',
        'inviato_at'           => 'datetime',
        'giorni_anticipo'      => 'integer',
    ];

    public function evento()
    {
        return $this->belongsTo(CalendarioEvento::class, 'calendario_evento_id');
    }
}
