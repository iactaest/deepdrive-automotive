<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BandoImportato extends Model
{
    protected $table = 'bandi_importati';

    protected $fillable = [
        'codice_esterno',
        'fonte',
        'titolo',
        'descrizione',
        'url',
        'categoria',
        'tema',
        'livello',
        'regione',
        'provincia',
        'comune',
        'target',
        'budget_totale',
        'budget_min',
        'budget_max',
        'scadenza',
        'data_pubblicazione',
        'data_inizio',
        'stato',
        'extra_data',
    ];

    protected $casts = [
        'extra_data' => 'array',
        'budget_totale' => 'decimal:2',
        'budget_min' => 'decimal:2',
        'budget_max' => 'decimal:2',
        'scadenza' => 'date',
        'data_pubblicazione' => 'date',
        'data_inizio' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // =============================================
    // SCOPES
    // =============================================

    public function scopeAperti($query)
    {
        return $query->where('stato', 'aperto');
    }

    public function scopeInScadenza($query, $giorni = 30)
    {
        return $query->where('scadenza', '<=', now()->addDays($giorni))
                    ->where('stato', 'aperto');
    }

    public function scopePerRegione($query, $regione)
    {
        return $query->where('regione', $regione);
    }

    public function scopePerCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopePerFonte($query, $fonte)
    {
        return $query->where('fonte', $fonte);
    }

    // =============================================
    // METODI UTILI
    // =============================================

    public function isAperto(): bool
    {
        return $this->stato === 'aperto';
    }

    public function isInScadenza(): bool
    {
        return $this->scadenza && $this->scadenza <= now()->addDays(30) && $this->stato === 'aperto';
    }

    public function getStatoFormattatoAttribute()
    {
        return match($this->stato) {
            'aperto' => '🟢 Aperto',
            'in_scadenza' => '🟡 In scadenza',
            'chiuso' => '🔴 Chiuso',
            default => $this->stato,
        };
    }

    public function getGiorniMancantiAttribute()
    {
        if (!$this->scadenza) {
            return null;
        }
        $diff = now()->diffInDays($this->scadenza, false);
        return $diff < 0 ? 0 : $diff;
    }
}