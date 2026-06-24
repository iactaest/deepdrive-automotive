<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bandi', function (Blueprint $table) {
            if (!Schema::hasColumn('bandi', 'codice_esterno')) {
                $table->string('codice_esterno')->nullable()->after('id');
            }
        });
    }

    public function down()
    {
        Schema::table('bandi', function (Blueprint $table) {
            $table->dropColumn('codice_esterno');
        });
    }
};