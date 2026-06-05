<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profili_capacita', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('profilo_impresa_id');
            $table->boolean('esperienza_bandi')->default(false);
            $table->integer('numero_bandi_vinti')->default(0);
            $table->json('categorie_soa')->nullable();
            $table->decimal('max_commessa', 15, 2)->nullable();
            $table->json('personale_qualificato')->nullable();
            $table->text('settori_competenza')->nullable();
            $table->timestamps();
            
            // Foreign key con nome esatto
            $table->foreign('profilo_impresa_id', 'fk_capacita_profilo')
                  ->references('id')
                  ->on('profili_impresa')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profili_capacita');
    }
};