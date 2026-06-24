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
                $table->string('partita_iva')->nullable()->unique()->after('codice_identificativo');
            }
            if (!Schema::hasColumn('enti', 'cap')) {
                $table->string('cap', 10)->nullable()->after('indirizzo');
            }
            if (!Schema::hasColumn('enti', 'popolazione')) {
                $table->integer('popolazione')->nullable()->after('cap');
            }
            if (!Schema::hasColumn('enti', 'user_id')) {
                $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->after('popolazione');
            }
            if (!Schema::hasColumn('enti', 'attivo')) {
                $table->boolean('attivo')->default(true)->after('user_id');
            }
            if (!Schema::hasColumn('enti', 'budget_annuale')) {
                $table->decimal('budget_annuale', 15, 2)->nullable()->after('attivo');
            }
            if (!Schema::hasColumn('enti', 'num_dipendenti')) {
                $table->integer('num_dipendenti')->nullable()->after('budget_annuale');
            }
        });
    }

    public function down()
    {
        Schema::table('enti', function (Blueprint $table) {
            $table->dropColumn([
                'partita_iva',
                'cap',
                'popolazione',
                'user_id',
                'attivo',
                'budget_annuale',
                'num_dipendenti'
            ]);
        });
    }
};