<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profili_caratteristiche', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('profilo_impresa_id');
            $table->boolean('impresa_giovanile')->default(false);
            $table->integer('percentuale_under35')->nullable();
            $table->boolean('impresa_femminile')->default(false);
            $table->integer('percentuale_donne')->nullable();
            $table->boolean('startup_innovativa')->default(false);
            $table->boolean('impresa_sociale')->default(false);
            $table->boolean('benefit_corporation')->default(false);
            $table->boolean('area_svantaggiata')->default(false);
            $table->string('tipo_area_svantaggiata')->nullable();
            $table->boolean('consorzio_rete')->default(false);
            $table->string('nome_consorzio')->nullable();
            $table->timestamps();
            
            $table->foreign('profilo_impresa_id', 'fk_caratteristiche_profilo')
                  ->references('id')
                  ->on('profili_impresa')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profili_caratteristiche');
    }
};