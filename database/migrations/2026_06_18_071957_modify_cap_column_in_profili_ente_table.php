<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            // Allunga il campo cap da 10 a 20 caratteri
            $table->string('cap', 20)->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->string('cap', 10)->nullable()->change();
        });
    }
};