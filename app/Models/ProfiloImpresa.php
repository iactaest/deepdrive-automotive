<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfiloImpresa extends Model
{
    use HasFactory;

    // FORZA IL NOME CORRETTO DELLA TABELLA
    protected $table = 'profili_impresa';

    protected $fillable = [
        'user_id', 'forma_giuridica', 'anno_costituzione', 'settore_ateco_primario',
        'settore_ateco_secondario', 'codice_cpv', 'regione', 'provincia', 'comune',
        'sedi_operative', 'certificazioni', 'range_dipendenti', 'range_fatturato',
        'patrimonio_netto', 'classificazione'
    ];

    protected $casts = [
        'sedi_operative' => 'array',
        'certificazioni' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function caratteristiche()
    {
        return $this->hasOne(ProfiloCaratteristica::class, 'profilo_impresa_id');
    }

    public function capacita()
    {
        return $this->hasOne(ProfiloCapacita::class, 'profilo_impresa_id');
    }
}