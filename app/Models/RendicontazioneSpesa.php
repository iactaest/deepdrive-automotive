<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RendicontazioneSpesa extends Model
{
    protected $table = 'rendicontazione_spese';

    protected $fillable = [
        'rendicontazione_id', 'categoria', 'descrizione', 'importo', 'data_spesa',
        'fornitore', 'numero_fattura', 'ammissibile', 'note_conformita', 'allegato_path',
    ];

    protected $casts = [
        'data_spesa'  => 'date',
        'importo'     => 'decimal:2',
        'ammissibile' => 'boolean',
    ];

    protected $appends = ['richiede_gara'];

    private const SOGLIA_GARA_PUBBLICA = 40000;

    public function rendicontazione(): BelongsTo
    {
        return $this->belongsTo(Rendicontazione::class);
    }

    /** Alert soft, mai persistito: oltre questa soglia serve una gara pubblica. */
    public function getRichiedeGaraAttribute(): bool
    {
        return (float) $this->importo > self::SOGLIA_GARA_PUBBLICA;
    }
}
