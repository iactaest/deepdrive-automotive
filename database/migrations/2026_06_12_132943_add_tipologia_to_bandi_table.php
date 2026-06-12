<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            if (!Schema::hasColumn('bandi', 'tipologia')) {
                $table->string('tipologia')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->dropColumn('tipologia');
        });
    }
};