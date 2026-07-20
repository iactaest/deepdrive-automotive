<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendicontazioni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bando_id')->constrained('bandi_importati')->cascadeOnDelete();
            $table->string('titolo_progetto');
            $table->decimal('importo_finanziato', 15, 2);
            $table->decimal('importo_cofinanziamento', 15, 2)->default(0);
            $table->date('data_inizio');
            $table->date('data_fine');
            $table->enum('stato', ['in_corso', 'completata', 'chiusa'])->default('in_corso');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('bando_id');
            $table->index('stato');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendicontazioni');
    }
};
