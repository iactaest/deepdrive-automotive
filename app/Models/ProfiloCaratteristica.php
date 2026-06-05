<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfiloCaratteristica extends Model
{
    use HasFactory;

    protected $table = 'profili_caratteristiche';

    protected $fillable = [
        'profilo_impresa_id', 'impresa_giovanile', 'percentuale_under35',
        'impresa_femminile', 'percentuale_donne', 'startup_innovativa',
        'impresa_sociale', 'benefit_corporation', 'area_svantaggiata',
        'tipo_area_svantaggiata', 'consorzio_rete', 'nome_consorzio'
    ];

    protected $casts = [
        'impresa_giovanile' => 'boolean',
        'impresa_femminile' => 'boolean',
        'startup_innovativa' => 'boolean',
        'impresa_sociale' => 'boolean',
        'benefit_corporation' => 'boolean',
        'area_svantaggiata' => 'boolean',
        'consorzio_rete' => 'boolean',
    ];

    public function profiloImpresa()
    {
        return $this->belongsTo(ProfiloImpresa::class);
    }
}