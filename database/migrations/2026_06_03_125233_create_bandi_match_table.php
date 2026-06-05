<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bandi_match', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bando_id')->constrained('bandi')->onDelete('cascade');
            $table->integer('punteggio_compatibilita'); // 0-100
            $table->json('punti_forza')->nullable();
            $table->json('punti_debolezza')->nullable();
            $table->json('requisiti_mancanti')->nullable();
            $table->boolean('match_obbligatori')->default(false);
            $table->timestamps();
            
            $table->unique(['user_id', 'bando_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bandi_match');
    }
};