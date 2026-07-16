<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notifica extends Model
{
    protected $table = 'notifiche';

    protected $fillable = [
        'user_id', 'tipo', 'titolo', 'testo', 'url', 'calendario_task_id', 'letta_at',
    ];

    protected $casts = [
        'letta_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(CalendarioTask::class, 'calendario_task_id');
    }

    public function scopeNonLette($query)
    {
        return $query->whereNull('letta_at');
    }

    /**
     * Unico punto che crea la notifica "task assegnato" — usato sia da taskStore che da
     * taskUpdate in CalendarioController, per non duplicare la logica del messaggio.
     */
    public static function taskAssegnato(CalendarioTask $task, int $destinatarioId): self
    {
        $task->loadMissing('evento.bando');
        $titoloEvento = $task->evento->tipo === 'bando'
            ? $task->evento->bando?->titolo
            : $task->evento->titolo;

        return self::create([
            'user_id'            => $destinatarioId,
            'tipo'                => 'task_assegnato',
            'titolo'              => "Ti è stato assegnato un task: {$task->titolo}",
            'testo'               => $titoloEvento,
            'url'                 => '/ente/calendario',
            'calendario_task_id'  => $task->id,
        ]);
    }
}
