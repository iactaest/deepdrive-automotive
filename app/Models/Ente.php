<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ente extends Model
{
    // Specifica il nome corretto della tabella
    protected $table = 'enti';
    
    protected $fillable = [
        'nome',
        'codice_identificativo',
        'tipo',
        'descrizione',
        'sito_web',
        'email',
        'telefono',
        'indirizzo',
        'regione',
        'provincia',
        'comune',
        'cap',
        'partita_iva',
    ];
    
    // ... resto del codice
}