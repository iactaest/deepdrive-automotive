<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifiche', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tipo');
            $table->string('titolo');
            $table->text('testo')->nullable();
            $table->string('url')->nullable();
            $table->foreignId('calendario_task_id')->nullable()->constrained('calendario_task')->cascadeOnDelete();
            $table->timestamp('letta_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'letta_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifiche');
    }
};
