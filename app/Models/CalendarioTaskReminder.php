<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CalendarioTaskReminder extends Model
{
    protected $table = 'calendario_task_reminder';

    protected $fillable = [
        'calendario_task_id', 'user_id', 'giorni_anticipo', 'scadenza_riferimento', 'inviato_at',
    ];

    protected $casts = [
        'scadenza_riferimento' => 'date',
        'inviato_at'           => 'datetime',
        'giorni_anticipo'      => 'integer',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(CalendarioTask::class, 'calendario_task_id');
    }
}
