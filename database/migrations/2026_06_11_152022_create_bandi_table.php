<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->enum('popolazione_comune', ['<5k', '5k-15k', '15k-50k', '>50k'])->nullable();
            $table->string('settore_prevalente')->nullable();
            $table->boolean('esperienza_fondi_europei')->default(false);
            $table->enum('ruolo_bandi', ['capofila', 'partner', 'nessuno'])->default('nessuno');
            $table->boolean('cofinanziamento_disponibile')->default(false);
            $table->decimal('percentuale_cofinanziamento', 5, 2)->nullable();
            $table->boolean('referente_bandi')->default(false);
            $table->boolean('gia_beneficiario_pnrr')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->dropColumn([
                'popolazione_comune', 'settore_prevalente', 'esperienza_fondi_europei',
                'ruolo_bandi', 'cofinanziamento_disponibile', 'percentuale_cofinanziamento',
                'referente_bandi', 'gia_beneficiario_pnrr'
            ]);
        });
    }
};