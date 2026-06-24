<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgettoOpenCoesione extends Model
{
    protected $table = 'progetti_opencoesione';
    
    protected $fillable = [
        'oc_titolo_progetto',
        'oc_codice_progetto',
        'oc_regione',
        'oc_provincia',
        'oc_comune',
        'oc_importo',
        'oc_importo_fesr',
        'oc_importo_fse',
        'oc_importo_fsc',
        'oc_tema',
        'oc_sottotema',
        'oc_data_inizio',
        'oc_data_fine',
        'oc_soggetto',
        'oc_cup',
        'oc_categoria',
        'oc_stato',
        'anno_inizio',
        'anno_fine',
        'ciclo_programmazione',
    ];
}