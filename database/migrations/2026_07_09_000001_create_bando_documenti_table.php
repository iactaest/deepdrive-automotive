<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bando_documenti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bando_id')->constrained('bandi_importati')->onDelete('cascade');
            $table->string('nome_documento');
            $table->text('descrizione')->nullable();
            $table->string('link_ufficiale')->nullable();
            $table->boolean('obbligatorio')->default(false);
            $table->enum('categoria', ['basilare', 'specifico'])->default('basilare');
            $table->string('path_file')->nullable();
            $table->enum('stato', ['da_caricare', 'caricato'])->default('da_caricare');
            $table->timestamps();

            $table->unique(['user_id', 'bando_id', 'nome_documento']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bando_documenti');
    }
};
