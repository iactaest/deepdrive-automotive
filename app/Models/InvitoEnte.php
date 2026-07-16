<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitoEnte extends Model
{
    protected $table = 'inviti_ente';

    protected $fillable = [
        'invitato_da_id', 'email', 'stato', 'accettato_da_id', 'scade_il',
    ];

    protected $casts = [
        'scade_il' => 'datetime',
    ];

    public function invitatoDa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invitato_da_id');
    }

    public function accettatoDa(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accettato_da_id');
    }

    public function scopePendenti($query)
    {
        return $query->where('stato', 'pending');
    }

    public function scaduto(): bool
    {
        return $this->stato === 'pending' && $this->scade_il->isPast();
    }
}
