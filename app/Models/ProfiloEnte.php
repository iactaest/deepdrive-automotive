<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfiloEnte extends Model
{
    protected $table = 'profili_ente';

    protected $fillable = [
        // STEP 1 - Dati Anagrafici
        'user_id',
        'nome_ente',
        'tipo_ente',
        'codice_fiscale',
        'partita_iva',
        
        // STEP 2 - Contatti
        'telefono',
        'email_pec',
        'sito_web',
        'fax',
        
        // STEP 3 - Localizzazione
        'regione',
        'provincia',
        'comune',
        'indirizzo',
        'cap',
        
        // STEP 4 - Caratteristiche
        'popolazione_comune',
        'settore_prevalente' => 'array',
        'esperienza_fondi_europei',
        'ruolo_bandi',
        'cofinanziamento_disponibile',
        'percentuale_cofinanziamento',
        'referente_bandi',
        'gia_beneficiario_pnrr',
        
        // STEP 5 - Preferenze Bandi
        'categorie_interesse',
        'livelli_interesse',
        'importi_interesse',
        
        // STEP 6 - NUOVI CRITERI
        'num_progetti_europei',
        'staff_dedicato_bandi',
        'consulente_esterno_bandi',
        'anticipo_spese_disponibile',
        'conto_dedicato_fondi',
        'tipologia_investimento',
        'dimensione_impresa',
        'intensita_aiuto',
        'cup_attivo',
        'target_group',
        'attivita_erogabili',
        'accreditamento_formativo',
        'regione_accreditamento',
        'sistemi_informativi',
        'obiettivi_policy',
        'modello_budget',
        'assicurazione_catastrofale',
        'profilo_completo',
    ];

    protected $casts = [
        'categorie_interesse' => 'array',
        'livelli_interesse' => 'array',
        'importi_interesse' => 'array',
        'tipologia_investimento' => 'array',
        'dimensione_impresa' => 'array',
        'target_group' => 'array',
        'attivita_erogabili' => 'array',
        'sistemi_informativi' => 'array',
        'obiettivi_policy' => 'array',
        'esperienza_fondi_europei' => 'boolean',
        'cofinanziamento_disponibile' => 'boolean',
        'referente_bandi' => 'boolean',
        'gia_beneficiario_pnrr' => 'boolean',
        'staff_dedicato_bandi' => 'boolean',
        'consulente_esterno_bandi' => 'boolean',
        'anticipo_spese_disponibile' => 'boolean',
        'conto_dedicato_fondi' => 'boolean',
        'cup_attivo' => 'boolean',
        'accreditamento_formativo' => 'boolean',
        'assicurazione_catastrofale' => 'boolean',
        'profilo_completo' => 'boolean',
    ];
}