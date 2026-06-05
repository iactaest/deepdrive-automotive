<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bandi_analisi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bando_id')->constrained('bandi')->onDelete('cascade');
            $table->text('riepilogo')->nullable();
            $table->text('requisiti')->nullable();
            $table->text('spese_ammissibili')->nullable();
            $table->integer('punteggio_massimo')->nullable();
            $table->json('criteri_valutazione')->nullable();
            $table->json('tags')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bandi_analisi');
    }
};