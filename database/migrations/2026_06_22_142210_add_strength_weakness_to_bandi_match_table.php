<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            if (!Schema::hasColumn('bandi_match', 'punti_forza')) {
                $table->json('punti_forza')->nullable()->after('match_percentuale');
            }
            if (!Schema::hasColumn('bandi_match', 'punti_debolezza')) {
                $table->json('punti_debolezza')->nullable()->after('punti_forza');
            }
            if (!Schema::hasColumn('bandi_match', 'calcolato_il')) {
                $table->timestamp('calcolato_il')->nullable()->after('punti_debolezza');
            }
            if (!Schema::hasColumn('bandi_match', 'notified')) {
                $table->boolean('notified')->default(false)->after('calcolato_il');
            }
            if (!Schema::hasColumn('bandi_match', 'notified_at')) {
                $table->timestamp('notified_at')->nullable()->after('notified');
            }
        });
    }

    public function down()
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            $table->dropColumn(['punti_forza', 'punti_debolezza', 'calcolato_il', 'notified', 'notified_at']);
        });
    }
};