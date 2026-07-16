<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inviti_ente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitato_da_id')->constrained('users')->cascadeOnDelete();
            $table->string('email');
            $table->enum('stato', ['pending', 'accettato', 'scaduto', 'revocato'])->default('pending');
            $table->foreignId('accettato_da_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scade_il');
            $table->timestamps();

            $table->index(['invitato_da_id', 'stato']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inviti_ente');
    }
};
