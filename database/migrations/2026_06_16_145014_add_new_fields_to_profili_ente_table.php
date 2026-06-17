<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            // Aggiungi solo colonne che non esistono già
            
            if (!Schema::hasColumn('profili_ente', 'num_progetti_europei')) {
                $table->enum('num_progetti_europei', ['0', '1-3', '4+'])->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'staff_dedicato_bandi')) {
                $table->boolean('staff_dedicato_bandi')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'consulente_esterno_bandi')) {
                $table->boolean('consulente_esterno_bandi')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'anticipo_spese_disponibile')) {
                $table->boolean('anticipo_spese_disponibile')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'conto_dedicato_fondi')) {
                $table->boolean('conto_dedicato_fondi')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'tipologia_investimento')) {
                $table->json('tipologia_investimento')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'dimensione_impresa')) {
                $table->json('dimensione_impresa')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'intensita_aiuto')) {
                $table->enum('intensita_aiuto', ['25%', '35%', '45%', '65%+'])->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'cup_attivo')) {
                $table->boolean('cup_attivo')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'target_group')) {
                $table->json('target_group')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'attivita_erogabili')) {
                $table->json('attivita_erogabili')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'accreditamento_formativo')) {
                $table->boolean('accreditamento_formativo')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'regione_accreditamento')) {
                $table->string('regione_accreditamento')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'sistemi_informativi')) {
                $table->json('sistemi_informativi')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'obiettivi_policy')) {
                $table->json('obiettivi_policy')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'modello_budget')) {
                $table->enum('modello_budget', ['full_cost', 'diretti', 'lump_sum'])->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'assicurazione_catastrofale')) {
                $table->boolean('assicurazione_catastrofale')->default(false);
            }
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