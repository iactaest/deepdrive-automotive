<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            // Step 1 - Dati Anagrafici
            if (!Schema::hasColumn('profili_ente', 'nome_ente')) {
                $table->string('nome_ente')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'tipo_ente')) {
                $table->string('tipo_ente')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'codice_fiscale')) {
                $table->string('codice_fiscale')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'partita_iva')) {
                $table->string('partita_iva')->nullable();
            }

            // Step 3 - Localizzazione
            if (!Schema::hasColumn('profili_ente', 'regione')) {
                $table->string('regione')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'provincia')) {
                $table->string('provincia')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'comune')) {
                $table->string('comune')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'indirizzo')) {
                $table->string('indirizzo')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'cap')) {
                $table->string('cap', 10)->nullable();
            }

            // Step 4 - Caratteristiche
            if (!Schema::hasColumn('profili_ente', 'popolazione_comune')) {
                $table->unsignedInteger('popolazione_comune')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'settore_prevalente')) {
                $table->json('settore_prevalente')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'esperienza_fondi_europei')) {
                $table->boolean('esperienza_fondi_europei')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'ruolo_bandi')) {
                $table->string('ruolo_bandi')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'cofinanziamento_disponibile')) {
                $table->boolean('cofinanziamento_disponibile')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'percentuale_cofinanziamento')) {
                $table->unsignedTinyInteger('percentuale_cofinanziamento')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'referente_bandi')) {
                $table->boolean('referente_bandi')->default(false);
            }
            if (!Schema::hasColumn('profili_ente', 'gia_beneficiario_pnrr')) {
                $table->boolean('gia_beneficiario_pnrr')->default(false);
            }

            // Step 5 - Preferenze Bandi
            if (!Schema::hasColumn('profili_ente', 'categorie_interesse')) {
                $table->json('categorie_interesse')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'livelli_interesse')) {
                $table->json('livelli_interesse')->nullable();
            }
            if (!Schema::hasColumn('profili_ente', 'importi_interesse')) {
                $table->json('importi_interesse')->nullable();
            }

            // Stato completamento wizard
            if (!Schema::hasColumn('profili_ente', 'profilo_completo')) {
                $table->boolean('profilo_completo')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->dropColumn([
                'nome_ente', 'tipo_ente', 'codice_fiscale', 'partita_iva',
                'regione', 'provincia', 'comune', 'indirizzo', 'cap',
                'popolazione_comune', 'settore_prevalente', 'esperienza_fondi_europei',
                'ruolo_bandi', 'cofinanziamento_disponibile', 'percentuale_cofinanziamento',
                'referente_bandi', 'gia_beneficiario_pnrr',
                'categorie_interesse', 'livelli_interesse', 'importi_interesse',
                'profilo_completo',
            ]);
        });
    }
};
