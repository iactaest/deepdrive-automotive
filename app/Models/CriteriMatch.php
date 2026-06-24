<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriteriMatch extends Model
{
    // Specifica il nome corretto della tabella
    protected $table = 'criteri_match';
    
    protected $fillable = [
        'ente_id',
        'tipo_ente',
        'regione',
        'provincia',
        'comune',
        'settori_interesse',
        'budget_disponibile',
        'esperienza_europea',
        'popolazione',
        'peso_tipologia',
        'peso_territorio',
        'peso_settore',
        'peso_budget',
        'peso_esperienza',
        'peso_scadenza',
        'soglia_notifica_alta',
        'soglia_notifica_media',
    ];
    
    protected $casts = [
        'settori_interesse' => 'array',
        'esperienza_europea' => 'boolean',
        'budget_disponibile' => 'decimal:2',
        'popolazione' => 'integer',
        'peso_tipologia' => 'integer',
        'peso_territorio' => 'integer',
        'peso_settore' => 'integer',
        'peso_budget' => 'integer',
        'peso_esperienza' => 'integer',
        'peso_scadenza' => 'integer',
        'soglia_notifica_alta' => 'integer',
        'soglia_notifica_media' => 'integer',
    ];
    
    public function ente()
    {
        return $this->belongsTo(Ente::class, 'ente_id');
    }
}