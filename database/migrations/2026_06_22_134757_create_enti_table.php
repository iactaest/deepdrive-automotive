<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enti', function (Blueprint $table) {
            $table->id();
            
            // Dati anagrafici
            $table->string('nome');
            $table->string('codice_identificativo')->nullable()->unique();
            $table->string('partita_iva')->nullable()->unique();
            $table->string('tipo')->nullable()->comment('Comune, Provincia, Regione, Unione di Comuni, Comunità Montana, Consorzio, Città Metropolitana, Altro');
            
            // Descrizione e contatti
            $table->text('descrizione')->nullable();
            $table->string('sito_web')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->string('indirizzo')->nullable();
            $table->string('cap', 10)->nullable();
            
            // Dati territoriali
            $table->string('comune')->nullable();
            $table->string('provincia')->nullable();
            $table->string('regione')->nullable();
            
            // Dati aggiuntivi
            $table->integer('popolazione')->nullable();
            $table->decimal('budget_annuale', 15, 2)->nullable();
            $table->integer('num_dipendenti')->nullable();
            
            // Dati di sistema
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('attivo')->default(true);
            
            $table->timestamps();
            
            // Indici per ricerca veloce
            $table->index('tipo');
            $table->index('regione');
            $table->index('provincia');
            $table->index('comune');
            $table->index('nome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enti');
    }
};