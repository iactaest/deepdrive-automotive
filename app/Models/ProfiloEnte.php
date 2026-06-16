<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfiloEnte extends Model
{
    protected $table = 'profili_ente';

    protected $fillable = [
        // DATI ANAGRAFICI E CONTATTI (già esistenti)
        'user_id',
        'nome_ente',
        'tipo_ente',
        'codice_fiscale',
        'partita_iva',
        'telefono',
        'email_pec',
        'sito_web',
        'fax',
        'regione',
        'provincia',
        'comune',
        'indirizzo',
        'cap',

        // CARATTERISTICHE ENTE (già esistenti)
        'popolazione_comune',
        'settore_prevalente',
        'esperienza_fondi_europei',
        'ruolo_bandi',
        'cofinanziamento_disponibile',
        'percentuale_cofinanziamento',
        'referente_bandi',
        'gia_beneficiario_pnrr',
        'profilo_completo',

        // PREFERENZE BANDI (già esistenti)
        'categorie_interesse',
        'livelli_interesse',
        'importi_interesse',

        // ================================================
        // 🆕 NUOVI CAMPI - CAPACITÀ PROGETTUALE
        // ================================================
        'num_progetti_europei',          // '0', '1-3', '4+'
        'staff_dedicato_bandi',          // boolean
        'consulente_esterno_bandi',      // boolean

        // ================================================
        // 🆕 NUOVI CAMPI - CAPACITÀ FINANZIARIA
        // ================================================
        'anticipo_spese_disponibile',    // boolean
        'conto_dedicato_fondi',          // boolean

        // ================================================
        // 🆕 NUOVI CAMPI - STEP BANDO FESR
        // ================================================
        'tipologia_investimento',        // json: ['digitali', 'cleantech', 'ricerca', 'innovazione']
        'dimensione_impresa',            // json: ['micro', 'piccola', 'media', 'grande']
        'intensita_aiuto',               // '25%', '35%', '45%', '65%+'
        'cup_attivo',                    // boolean

        // ================================================
        // 🆕 NUOVI CAMPI - GOL/PNRR
        // ================================================
        'target_group',                  // json: ['disoccupati', 'lavoratori_rischio', 'fragili', 'neet', 'over55']
        'attivita_erogabili',            // json: ['formazione', 'tirocini', 'orientamento', 'certificazione', 'creazione_impresa']
        'accreditamento_formativo',      // boolean
        'regione_accreditamento',        // string nullable
        'sistemi_informativi',           // json: ['silav', 'ciapigol', 'regis']

        // ================================================
        // 🆕 NUOVI CAMPI - OBIETTIVI POLICY
        // ================================================
        'obiettivi_policy',              // json: ['intelligente', 'verde', 'connessa', 'sociale', 'vicina']

        // ================================================
        // 🆕 NUOVI CAMPI - MODELLO BUDGET
        // ================================================
        'modello_budget',                // 'full_cost', 'diretti', 'lump_sum'

        // ================================================
        // 🆕 NUOVI CAMPI - ASSICURAZIONE
        // ================================================
        'assicurazione_catastrofale',    // boolean
    ];

    // Cast automatici per i campi JSON e booleani
    protected $casts = [
        'categorie_interesse' => 'array',
        'livelli_interesse' => 'array',
        'importi_interesse' => 'array',
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
        'tipologia_investimento' => 'array',
        'dimensione_impresa' => 'array',
        'target_group' => 'array',
        'attivita_erogabili' => 'array',
        'sistemi_informativi' => 'array',
        'obiettivi_policy' => 'array',
        'profilo_completo' => 'boolean',
    ];
}