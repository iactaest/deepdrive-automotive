<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BandoMatch extends Model
{
    use HasFactory;

    protected $table = 'bandi_match';

    protected $fillable = [
        'user_id', 'bando_id', 'punteggio', 'match_dettaglio', 'letto', 'notificato'
    ];

    protected $casts = [
        'match_dettaglio' => 'array',
        'letto' => 'boolean',
        'notificato' => 'boolean',
        'punteggio' => 'integer',
    ];

    // Relazione con l'utente
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relazione con il bando
    public function bando()
    {
        return $this->belongsTo(Bando::class);
    }

    // Scope per match non letti
    public function scopeNonLetti($query)
    {
        return $query->where('letto', false);
    }

    // Scope per match ad alta compatibilità
    public function scopeAltaCompatibilita($query, $soglia = 80)
    {
        return $query->where('punteggio', '>=', $soglia);
    }
}