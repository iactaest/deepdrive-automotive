<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('enti', function (Blueprint $table) {
            if (!Schema::hasColumn('enti', 'partita_iva')) {
                $table->string('partita_iva', 20)->nullable()->unique()->after('codice_identificativo');
            }
            if (!Schema::hasColumn('enti', 'cap')) {
                $table->string('cap', 10)->nullable()->after('indirizzo');
            }
            if (!Schema::hasColumn('enti', 'popolazione')) {
                $table->integer('popolazione')->nullable()->after('cap');
            }
            if (!Schema::hasColumn('enti', 'attivo')) {
                $table->boolean('attivo')->default(true)->after('popolazione');
            }
        });
    }

    public function down()
    {
        Schema::table('enti', function (Blueprint $table) {
            $table->dropColumn(['partita_iva', 'cap', 'popolazione', 'attivo']);
        });
    }
};