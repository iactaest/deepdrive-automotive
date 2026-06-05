<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bandi', function (Blueprint $table) {
            $table->id();
            $table->string('titolo');
            $table->text('descrizione')->nullable();
            $table->string('ente')->nullable();
            $table->string('budget')->nullable();
            $table->date('scadenza')->nullable();
            $table->string('link')->nullable();
            $table->string('categoria')->nullable();
            $table->string('target')->nullable();
            $table->string('regione')->nullable();
            $table->enum('stato', ['aperto', 'chiuso', 'in_scadenza'])->default('aperto');
            $table->text('testo_integrale')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bandi');
    }
};