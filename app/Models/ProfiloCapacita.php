<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfiloCapacita extends Model
{
    use HasFactory;

    protected $table = 'profili_capacita';

    protected $fillable = [
        'profilo_impresa_id', 'esperienza_bandi', 'numero_bandi_vinti',
        'categorie_soa', 'max_commessa', 'personale_qualificato', 'settori_competenza'
    ];

    protected $casts = [
        'esperienza_bandi' => 'boolean',
        'categorie_soa' => 'array',
        'personale_qualificato' => 'array',
    ];

    public function profiloImpresa()
    {
        return $this->belongsTo(ProfiloImpresa::class);
    }
}