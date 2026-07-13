<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bando_documenti', function (Blueprint $table) {
            $table->text('nota')->nullable();
            $table->string('nota_autore')->nullable();
            $table->timestamp('nota_data')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('bando_documenti', function (Blueprint $table) {
            $table->dropColumn(['nota', 'nota_autore', 'nota_data']);
        });
    }
};
