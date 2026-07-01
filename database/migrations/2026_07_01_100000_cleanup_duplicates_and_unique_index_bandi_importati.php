<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Elimina record stale da vecchie versioni del codice (fonte con prefix archivio/test)
        DB::table('bandi_importati')
            ->where('fonte', 'LIKE', 'regione_sicilia_archivio%')
            ->orWhere('fonte', 'LIKE', '%_test')
            ->delete();

        // 2. Elimina record con codice_esterno NULL rimasti (non dovrebbero esserci dopo il punto 1,
        //    ma per sicurezza li rimuoviamo: sono record invalidi senza identificatore univoco)
        DB::table('bandi_importati')->whereNull('codice_esterno')->delete();

        // 3. Rimuovi veri duplicati (stesso codice_esterno + fonte): tieni solo il record con id più alto
        DB::statement(
            'DELETE FROM bandi_importati
             WHERE id NOT IN (
                 SELECT MAX(id)
                 FROM bandi_importati
                 GROUP BY codice_esterno, fonte
             )'
        );

        // 4. Aggiungi indice unique su [codice_esterno, fonte]
        //    Questo garantisce che upsert() non crei mai duplicati nei sync futuri
        Schema::table('bandi_importati', function (Blueprint $table) {
            $table->unique(['codice_esterno', 'fonte'], 'bandi_importati_codice_fonte_unique');
        });
    }

    public function down(): void
    {
        Schema::table('bandi_importati', function (Blueprint $table) {
            $table->dropUnique('bandi_importati_codice_fonte_unique');
        });
    }
};
