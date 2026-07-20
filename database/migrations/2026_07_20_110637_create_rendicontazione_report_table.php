<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendicontazione_report', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendicontazione_id')->constrained('rendicontazioni')->cascadeOnDelete();
            $table->enum('tipo', ['intermedio', 'finale']);
            $table->date('periodo_da');
            $table->date('periodo_a');
            $table->decimal('totale_spese', 15, 2);
            $table->decimal('spese_ammissibili', 15, 2);
            $table->decimal('spese_non_ammissibili', 15, 2);
            $table->unsignedTinyInteger('percentuale_avanzamento');
            $table->timestamp('generato_at');
            $table->string('path_pdf');
            $table->timestamps();

            $table->index('rendicontazione_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendicontazione_report');
    }
};
