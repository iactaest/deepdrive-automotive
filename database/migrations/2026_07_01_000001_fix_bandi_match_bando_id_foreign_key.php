<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            // Rimuove FK verso 'bandi' e la ricrea verso 'bandi_importati'
            try {
                $table->dropForeign(['bando_id']);
            } catch (\Exception $e) {
                // Potrebbe avere un nome diverso generato automaticamente
                try {
                    $table->dropForeign('bandi_match_bando_id_foreign');
                } catch (\Exception $e2) {
                    // Ignora se non esiste
                }
            }

            // Svuota i record esistenti che non corrispondono a bandi_importati
            DB::table('bandi_match')->delete();

            $table->foreign('bando_id')
                  ->references('id')
                  ->on('bandi_importati')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            $table->dropForeign(['bando_id']);

            $table->foreign('bando_id')
                  ->references('id')
                  ->on('bandi')
                  ->onDelete('cascade');
        });
    }
};
