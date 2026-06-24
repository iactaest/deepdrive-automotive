<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bandi_importati', function (Blueprint $table) {
            $table->id();
            
            // === IDENTIFICATIVO ===
            $table->string('codice_esterno')->nullable()->unique();
            $table->string('fonte')->nullable(); // opencoesione, regione_sicilia, ted, anac, eu_funding
            
            // === DATI PRINCIPALI ===
            $table->string('titolo');
            $table->text('descrizione')->nullable();
            $table->string('url')->nullable();
            
            // === DATI PER IL MATCH ===
            $table->string('categoria')->nullable(); // digitalizzazione, ambiente, formazione, sociale, cultura, infrastrutture, sanita, innovazione
            $table->string('tema')->nullable(); // tema specifico
            $table->string('livello')->nullable(); // comunale, regionale, nazionale, europeo
            $table->string('regione')->nullable();
            $table->string('provincia')->nullable();
            $table->string('comune')->nullable();
            $table->string('target')->nullable(); // Comune, Provincia, Regione, Impresa, etc.
            
            // === DATI ECONOMICI ===
            $table->decimal('budget_totale', 15, 2)->nullable();
            $table->decimal('budget_min', 15, 2)->nullable();
            $table->decimal('budget_max', 15, 2)->nullable();
            
            // === DATI TEMPORALI ===
            $table->date('scadenza')->nullable();
            $table->date('data_pubblicazione')->nullable();
            $table->date('data_inizio')->nullable();
            
            // === STATO ===
            $table->string('stato')->default('aperto'); // aperto, in_scadenza, chiuso
            
            // === METADATI ===
            $table->json('extra_data')->nullable(); // per dati aggiuntivi specifici della fonte
            
            // === TIMESTAMPS ===
            $table->timestamps();
            
            // === INDICI PER RICERCA ===
            $table->index('fonte');
            $table->index('categoria');
            $table->index('regione');
            $table->index('stato');
            $table->index('scadenza');
            $table->index('livello');
            $table->index('target');
        });
    }

    public function down()
    {
        Schema::dropIfExists('bandi_importati');
    }
};