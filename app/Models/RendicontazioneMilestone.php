<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RendicontazioneMilestone extends Model
{
    protected $table = 'rendicontazione_milestone';

    protected $fillable = [
        'rendicontazione_id', 'titolo', 'descrizione', 'data_prevista', 'data_completamento',
        'stato', 'percentuale_avanzamento', 'note', 'ordine',
    ];

    protected $casts = [
        'data_prevista'      => 'date',
        'data_completamento' => 'date',
        'percentuale_avanzamento' => 'integer',
        'ordine'             => 'integer',
    ];

    public function rendicontazione(): BelongsTo
    {
        return $this->belongsTo(Rendicontazione::class);
    }
}
