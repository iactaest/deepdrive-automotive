<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('enti', function (Blueprint $table) {
            if (!Schema::hasColumn('enti', 'comune')) {
                $table->string('comune')->nullable()->after('provincia');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enti', function (Blueprint $table) {
            if (Schema::hasColumn('enti', 'comune')) {
                $table->dropColumn('comune');
            }
        });
    }
};