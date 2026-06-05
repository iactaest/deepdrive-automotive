<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fonti_bandi', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('url');
            $table->string('tipo');
            $table->enum('stato', ['attivo', 'inattivo'])->default('attivo');
            $table->datetime('ultimo_crawl')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fonti_bandi');
    }
};