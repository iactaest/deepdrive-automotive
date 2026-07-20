<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rendicontazione extends Model
{
    protected $table = 'rendicontazioni';

    protected $fillable = [
        'user_id', 'bando_id', 'titolo_progetto', 'importo_finanziato', 'importo_cofinanziamento',
        'data_inizio', 'data_fine', 'stato', 'note',
    ];

    protected $casts = [
        'data_inizio'              => 'date',
        'data_fine'                => 'date',
        'importo_finanziato'       => 'decimal:2',
        'importo_cofinanziamento'  => 'decimal:2',
    ];

    public function bando(): BelongsTo
    {
        return $this->belongsTo(BandoImportato::class, 'bando_id');
    }

    public function spese(): HasMany
    {
        return $this->hasMany(RendicontazioneSpesa::class);
    }

    public function milestone(): HasMany
    {
        return $this->hasMany(RendicontazioneMilestone::class)->orderBy('ordine');
    }

    public function report(): HasMany
    {
        return $this->hasMany(RendicontazioneReport::class);
    }

    /** Spese ammissibili sul totale finanziato, 0-100. */
    public function percentualeAvanzamentoFinanziario(): float
    {
        if ((float) $this->importo_finanziato <= 0) {
            return 0;
        }

        $ammissibili = $this->spese()->where('ammissibile', true)->sum('importo');

        return round(min(100, ($ammissibili / (float) $this->importo_finanziato) * 100), 1);
    }

    /** Quanto tempo del periodo progetto è trascorso, 0-100. */
    public function percentualeAvanzamentoTemporale(): float
    {
        $inizio = $this->data_inizio;
        $fine = $this->data_fine;
        $oggi = now();

        if ($oggi->lte($inizio)) {
            return 0;
        }
        if ($oggi->gte($fine)) {
            return 100;
        }

        $totaleGiorni = $inizio->diffInDays($fine) ?: 1;
        $trascorsi = $inizio->diffInDays($oggi);

        return round(min(100, ($trascorsi / $totaleGiorni) * 100), 1);
    }
}
