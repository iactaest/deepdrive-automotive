<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendario_reminder', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendario_evento_id')->constrained('calendario_eventi')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('giorni_anticipo');
            $table->date('scadenza_riferimento');
            $table->timestamp('inviato_at');
            $table->timestamps();

            $table->unique(
                ['calendario_evento_id', 'giorni_anticipo', 'scadenza_riferimento'],
                'calendario_reminder_dedup_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendario_reminder');
    }
};
