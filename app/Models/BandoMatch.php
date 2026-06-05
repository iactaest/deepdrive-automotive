<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BandoMatch extends Model
{
    use HasFactory;

    protected $table = 'bandi_match';

    protected $fillable = [
        'user_id', 'bando_id', 'punteggio_compatibilita',
        'punti_forza', 'punti_debolezza', 'requisiti_mancanti', 'match_obbligatori'
    ];

    protected $casts = [
        'punti_forza' => 'array',
        'punti_debolezza' => 'array',
        'requisiti_mancanti' => 'array',
        'match_obbligatori' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function bando()
    {
        return $this->belongsTo(Bando::class);
    }
}