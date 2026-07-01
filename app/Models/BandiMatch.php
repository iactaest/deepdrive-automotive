<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BandiMatch extends Model
{
    protected $table = 'bandi_match';
    
    protected $fillable = [
        'user_id',
        'bando_id',
        'punteggio_compatibilita',
        'punti_forza',
        'punti_debolezza',
        'calcolato_il',
        'notified',
        'notified_at',
        'requisiti_mancanti',
        'match_obbligatori',
    ];
    
    protected $casts = [
        'punti_forza' => 'array',
        'punti_debolezza' => 'array',
        'requisiti_mancanti' => 'array',
        'match_obbligatori' => 'boolean',
        'notified' => 'boolean',
        'calcolato_il' => 'datetime',
        'notified_at' => 'datetime',
    ];
    
    public function ente()
    {
        return $this->belongsTo(Ente::class, 'user_id');
    }
    
    public function bando()
    {
        return $this->belongsTo(BandoImportato::class, 'bando_id');
    }
}