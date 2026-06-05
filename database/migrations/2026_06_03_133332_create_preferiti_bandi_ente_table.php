<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preferiti_bandi_ente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bando_id')->constrained('bandi')->onDelete('cascade');
            $table->text('note')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'bando_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preferiti_bandi_ente');
    }
};