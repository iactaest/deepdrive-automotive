<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bando extends Model
{
    use HasFactory;

    // FORZA IL NOME CORRETTO DELLA TABELLA
    protected $table = 'bandi';

    protected $fillable = [
        'titolo', 'descrizione', 'ente', 'budget', 'scadenza',
        'categoria', 'target', 'regione', 'stato', 'testo_integrale'
    ];

    protected $casts = [
        'scadenza' => 'date',
    ];
}