<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendicontazione_spese', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendicontazione_id')->constrained('rendicontazioni')->cascadeOnDelete();
            $table->enum('categoria', [
                'personale_interno', 'consulenze_esterne', 'attrezzature', 'materiali_forniture',
                'servizi_informatici', 'comunicazione', 'spese_generali', 'missioni_trasferte', 'formazione',
            ]);
            $table->string('descrizione');
            $table->decimal('importo', 12, 2);
            $table->date('data_spesa');
            $table->string('fornitore')->nullable();
            $table->string('numero_fattura')->nullable();
            $table->boolean('ammissibile')->nullable(); // null=da verificare, true=ammissibile, false=non ammissibile
            $table->text('note_conformita')->nullable();
            $table->string('allegato_path')->nullable();
            $table->timestamps();

            $table->index(['rendicontazione_id', 'categoria']);
            $table->index(['rendicontazione_id', 'ammissibile']);
            $table->index('data_spesa');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendicontazione_spese');
    }
};
