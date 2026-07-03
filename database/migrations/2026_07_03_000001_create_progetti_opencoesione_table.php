<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * La tabella esisteva già in produzione/locale ma senza una migration corrispondente
     * (creata fuori dal sistema di migration di Laravel) — `migrate:fresh` la cancellava
     * silenziosamente. Questa migration ne formalizza la struttura reale già in uso.
     */
    public function up(): void
    {
        Schema::create('progetti_opencoesione', function (Blueprint $table) {
            $table->id();
            $table->string('oc_titolo_progetto')->nullable();
            $table->string('oc_codice_progetto')->nullable()->unique();
            $table->string('oc_regione')->nullable();
            $table->string('oc_provincia')->nullable();
            $table->string('oc_comune')->nullable();
            $table->decimal('oc_importo', 15, 2)->nullable();
            $table->decimal('oc_importo_fesr', 15, 2)->nullable();
            $table->decimal('oc_importo_fse', 15, 2)->nullable();
            $table->decimal('oc_importo_fsc', 15, 2)->nullable();
            $table->string('oc_tema')->nullable();
            $table->string('oc_sottotema')->nullable();
            $table->date('oc_data_inizio')->nullable();
            $table->date('oc_data_fine')->nullable();
            $table->string('oc_soggetto')->nullable();
            $table->string('oc_cup')->nullable();
            $table->string('oc_categoria')->nullable();
            $table->string('oc_stato')->nullable();
            $table->integer('anno_inizio')->nullable();
            $table->integer('anno_fine')->nullable();
            $table->string('ciclo_programmazione')->nullable();
            $table->timestamps();

            $table->index('oc_regione');
            $table->index('oc_tema');
            $table->index('oc_stato');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('progetti_opencoesione');
    }
};
