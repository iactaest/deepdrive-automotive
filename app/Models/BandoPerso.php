<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BandoPerso extends Model
{
    protected $table = 'bandi_persi';

    protected $fillable = [
        'user_id', 'bando_id', 'note',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bando(): BelongsTo
    {
        return $this->belongsTo(BandoImportato::class, 'bando_id');
    }
}
