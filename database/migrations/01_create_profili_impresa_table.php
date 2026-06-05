<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profili_impresa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Dati anagrafici
            $table->string('forma_giuridica'); // Srl, Spa, Ditta individuale, Startup innovativa, PMI, Grande Impresa, Cooperativa
            $table->integer('anno_costituzione');
            $table->string('settore_ateco_primario');
            $table->string('settore_ateco_secondario')->nullable();
            $table->string('codice_cpv')->nullable();
            $table->string('regione');
            $table->string('provincia');
            $table->string('comune');
            $table->json('sedi_operative')->nullable(); // JSON per sedi multiple
            $table->json('certificazioni')->nullable(); // JSON per ISO, SOA, ecc.
            
            // Dimensione aziendale
            $table->enum('range_dipendenti', ['0-9', '10-49', '50-249', '250+']);
            $table->enum('range_fatturato', ['<100k', '100k-500k', '500k-2M', '>2M']);
            $table->decimal('patrimonio_netto', 15, 2)->nullable();
            $table->string('classificazione'); // Micro, Piccola, Media, Grande Impresa
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profili_impresa');
    }
};