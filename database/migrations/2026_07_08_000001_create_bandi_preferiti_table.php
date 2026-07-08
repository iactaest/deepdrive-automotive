<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bandi_preferiti', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bando_id')->constrained('bandi_importati')->onDelete('cascade');
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'bando_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bandi_preferiti');
    }
};
