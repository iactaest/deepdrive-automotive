<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bandi', function (Blueprint $table) {
            if (!Schema::hasColumn('bandi', 'fonte')) {
                $table->string('fonte')->nullable()->after('descrizione');
            }
            if (!Schema::hasColumn('bandi', 'target')) {
                $table->string('target')->nullable()->after('fonte');
            }
        });
    }

    public function down()
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->dropColumn(['fonte', 'target']);
        });
    }
};