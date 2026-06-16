<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            
            // ============================================
            // CAPACITÀ PROGETTUALE
            // ============================================
            $table->enum('num_progetti_europei', ['0', '1-3', '4+'])->nullable()->after('importi_interesse');
            $table->boolean('staff_dedicato_bandi')->default(false)->after('num_progetti_europei');
            $table->boolean('consulente_esterno_bandi')->default(false)->after('staff_dedicato_bandi');

            // ============================================
            // CAPACITÀ FINANZIARIA
            // ============================================
            $table->boolean('anticipo_spese_disponibile')->default(false)->after('consulente_esterno_bandi');
            $table->boolean('conto_dedicato_fondi')->default(false)->after('anticipo_spese_disponibile');

            // ============================================
            // STEP BANDO FESR
            // ============================================
            $table->json('tipologia_investimento')->nullable()->after('conto_dedicato_fondi');
            $table->json('dimensione_impresa')->nullable()->after('tipologia_investimento');
            $table->enum('intensita_aiuto', ['25%', '35%', '45%', '65%+'])->nullable()->after('dimensione_impresa');
            $table->boolean('cup_attivo')->default(false)->after('intensita_aiuto');

            // ============================================
            // GOL/PNRR
            // ============================================
            $table->json('target_group')->nullable()->after('cup_attivo');
            $table->json('attivita_erogabili')->nullable()->after('target_group');
            $table->boolean('accreditamento_formativo')->default(false)->after('attivita_erogabili');
            $table->string('regione_accreditamento')->nullable()->after('accreditamento_formativo');
            $table->json('sistemi_informativi')->nullable()->after('regione_accreditamento');

            // ============================================
            // OBIETTIVI POLICY
            // ============================================
            $table->json('obiettivi_policy')->nullable()->after('sistemi_informativi');

            // ============================================
            // MODELLO BUDGET
            // ============================================
            $table->enum('modello_budget', ['full_cost', 'diretti', 'lump_sum'])->nullable()->after('obiettivi_policy');

            // ============================================
            // ASSICURAZIONE CATASTROFALE
            // ============================================
            $table->boolean('assicurazione_catastrofale')->default(false)->after('modello_budget');
        });
    }

    public function down()
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });
    }
};