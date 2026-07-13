<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendario_task', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendario_evento_id')->constrained('calendario_eventi')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titolo');
            $table->text('descrizione')->nullable();
            $table->string('assegnato_a')->nullable();
            $table->enum('priorita', ['bassa', 'media', 'alta'])->default('media');
            $table->enum('stato', ['da_fare', 'in_corso', 'completato'])->default('da_fare');
            $table->date('scadenza')->nullable();
            $table->unsignedInteger('ordine')->default(0);
            $table->timestamp('completato_il')->nullable();
            $table->timestamps();

            $table->index(['calendario_evento_id']);
            $table->index(['user_id', 'stato']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_task');
    }
};
