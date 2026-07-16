<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('calendario_task', function (Blueprint $table) {
            $table->foreignId('assegnato_user_id')->nullable()->after('assegnato_a')
                ->constrained('users')->nullOnDelete();
            $table->index(['assegnato_user_id', 'stato']);
        });
    }

    public function down(): void
    {
        Schema::table('calendario_task', function (Blueprint $table) {
            $table->dropConstrainedForeignId('assegnato_user_id');
        });
    }
};
