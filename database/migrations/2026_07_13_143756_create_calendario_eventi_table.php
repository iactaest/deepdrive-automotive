<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendario_eventi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('tipo', ['bando', 'manuale']);
            $table->foreignId('bando_id')->nullable()->constrained('bandi_importati')->onDelete('cascade');
            $table->boolean('origine_preferito')->default(false);
            $table->boolean('origine_match')->default(false);
            $table->string('titolo')->nullable();
            $table->text('descrizione')->nullable();
            $table->date('data_scadenza')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'bando_id']);
            $table->index(['user_id', 'tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_eventi');
    }
};
