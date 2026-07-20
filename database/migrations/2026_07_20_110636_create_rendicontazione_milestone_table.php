<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendicontazione_milestone', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendicontazione_id')->constrained('rendicontazioni')->cascadeOnDelete();
            $table->string('titolo');
            $table->text('descrizione')->nullable();
            $table->date('data_prevista')->nullable();
            $table->date('data_completamento')->nullable();
            $table->enum('stato', ['da_fare', 'in_corso', 'completata'])->default('da_fare');
            $table->unsignedTinyInteger('percentuale_avanzamento')->default(0);
            $table->text('note')->nullable();
            $table->unsignedInteger('ordine')->default(0);
            $table->timestamps();

            $table->index(['rendicontazione_id', 'ordine']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendicontazione_milestone');
    }
};
