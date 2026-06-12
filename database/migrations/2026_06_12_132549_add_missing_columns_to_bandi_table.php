<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->string('ente_erogatore')->nullable();
            $table->decimal('budget_totale', 15, 2)->nullable();
            $table->string('livello')->nullable();
            $table->string('categoria')->nullable();
            $table->string('tipologia')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->dropColumn(['ente_erogatore', 'budget_totale', 'livello', 'categoria', 'tipologia']);
        });
    }
};