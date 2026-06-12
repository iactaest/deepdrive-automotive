<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bando extends Model
{
    use HasFactory;

    protected $table = 'bandi';

    protected $fillable = [
        'titolo', 'descrizione', 'ente_erogatore', 'scadenza', 'budget_totale',
        'livello', 'categoria', 'tipologia', 'stato'
    ];

    protected $casts = [
        'scadenza' => 'date',
    ];
}