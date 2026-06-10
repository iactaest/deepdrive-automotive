<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profili_ente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Dati anagrafici ente
            $table->string('nome_ente');
            $table->enum('tipo_ente', [
                'comune', 'provincia', 'regione', 'asl', 
                'universita', 'scuola', 'altro'
            ])->default('comune');
            $table->string('codice_fiscale')->nullable();
            $table->string('partita_iva')->nullable();
            
            // Localizzazione
            $table->string('regione');
            $table->string('provincia');
            $table->string('comune');
            $table->string('indirizzo')->nullable();
            $table->string('cap')->nullable();
            
            // Preferenze bandi
            $table->json('categorie_interesse')->nullable();
            $table->json('livelli_interesse')->nullable();
            $table->json('importi_interesse')->nullable();
            
            // Completamento profilo
            $table->boolean('profilo_completo')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profili_ente');
    }
};