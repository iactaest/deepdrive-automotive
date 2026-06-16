<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 public function up(): void
{
    Schema::table('profili_ente', function (Blueprint $table) {
        $table->string('telefono')->nullable()->after('partita_iva');
        $table->string('email_pec')->nullable()->after('telefono');
        $table->string('sito_web')->nullable()->after('email_pec');
        $table->string('fax')->nullable()->after('sito_web');
        $table->string('indirizzo')->nullable()->after('comune');
        $table->string('cap', 10)->nullable()->after('indirizzo');
        $table->string('popolazione_comune')->nullable()->after('cap');
        $table->string('settore_prevalente')->nullable()->after('popolazione_comune');
        $table->boolean('esperienza_fondi_europei')->default(false)->after('settore_prevalente');
        $table->string('ruolo_bandi')->default('nessuno')->after('esperienza_fondi_europei');
        $table->boolean('cofinanziamento_disponibile')->default(false)->after('ruolo_bandi');
        $table->decimal('percentuale_cofinanziamento', 5, 2)->nullable()->after('cofinanziamento_disponibile');
        $table->boolean('referente_bandi')->default(false)->after('percentuale_cofinanziamento');
        $table->boolean('gia_beneficiario_pnrr')->default(false)->after('referente_bandi');
        $table->json('categorie_interesse')->nullable()->after('gia_beneficiario_pnrr');
        $table->json('livelli_interesse')->nullable()->after('categorie_interesse');
        $table->json('importi_interesse')->nullable()->after('livelli_interesse');
        $table->boolean('profilo_completo')->default(false)->after('importi_interesse');
    });
}

public function down(): void
{
    Schema::table('profili_ente', function (Blueprint $table) {
        $table->dropColumn([
            'telefono', 'email_pec', 'sito_web', 'fax',
            'indirizzo', 'cap', 'popolazione_comune', 'settore_prevalente',
            'esperienza_fondi_europei', 'ruolo_bandi', 'cofinanziamento_disponibile',
            'percentuale_cofinanziamento', 'referente_bandi', 'gia_beneficiario_pnrr',
            'categorie_interesse', 'livelli_interesse', 'importi_interesse', 'profilo_completo',
        ]);
    });
}
};
