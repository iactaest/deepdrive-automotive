<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            // Aggiungi tutte le colonne necessarie
            if (!Schema::hasColumn('bandi', 'ente_erogatore')) {
                $table->string('ente_erogatore')->nullable();
            }
            if (!Schema::hasColumn('bandi', 'budget_totale')) {
                $table->decimal('budget_totale', 15, 2)->nullable();
            }
            if (!Schema::hasColumn('bandi', 'livello')) {
                $table->string('livello')->nullable();
            }
            if (!Schema::hasColumn('bandi', 'categoria')) {
                $table->string('categoria')->nullable();
            }
            if (!Schema::hasColumn('bandi', 'tipologia')) {
                $table->string('tipologia')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->dropColumn(['ente_erogatore', 'budget_totale', 'livello', 'categoria', 'tipologia']);
        });
    }
};