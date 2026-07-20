<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RendicontazioneReport extends Model
{
    protected $table = 'rendicontazione_report';

    protected $fillable = [
        'rendicontazione_id', 'tipo', 'periodo_da', 'periodo_a', 'totale_spese',
        'spese_ammissibili', 'spese_non_ammissibili', 'percentuale_avanzamento',
        'generato_at', 'path_pdf',
    ];

    protected $casts = [
        'periodo_da'    => 'date',
        'periodo_a'     => 'date',
        'totale_spese'  => 'decimal:2',
        'spese_ammissibili'     => 'decimal:2',
        'spese_non_ammissibili' => 'decimal:2',
        'percentuale_avanzamento' => 'integer',
        'generato_at'   => 'datetime',
    ];

    public function rendicontazione(): BelongsTo
    {
        return $this->belongsTo(Rendicontazione::class);
    }
}
