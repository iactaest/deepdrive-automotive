<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('criteri_match', function (Blueprint $table) {
            $table->id();
            
            // Foreign key verso la tabella 'enti' (NON 'entes')
            $table->foreignId('ente_id')
                  ->constrained('enti')
                  ->onDelete('cascade');
            
            // Profilo dell'ente (criteri di ricerca)
            $table->string('tipo_ente')->nullable();
            $table->string('regione')->nullable();
            $table->string('provincia')->nullable();
            $table->string('comune')->nullable();
            $table->json('settori_interesse')->nullable();
            $table->decimal('budget_disponibile', 15, 2)->nullable();
            $table->boolean('esperienza_europea')->default(false);
            $table->integer('popolazione')->nullable();
            
            // Pesi per il calcolo del match
            $table->integer('peso_tipologia')->default(25);
            $table->integer('peso_territorio')->default(20);
            $table->integer('peso_settore')->default(25);
            $table->integer('peso_budget')->default(15);
            $table->integer('peso_esperienza')->default(10);
            $table->integer('peso_scadenza')->default(5);
            
            // Soglie per le notifiche
            $table->integer('soglia_notifica_alta')->default(80);
            $table->integer('soglia_notifica_media')->default(60);
            
            $table->timestamps();
            
            $table->unique('ente_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('criteri_match');
    }
};