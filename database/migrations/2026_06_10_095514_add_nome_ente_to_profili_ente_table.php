<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->string('nome_ente')->after('user_id');
            $table->string('tipo_ente')->default('comune')->after('nome_ente');
            $table->string('codice_fiscale')->nullable()->after('tipo_ente');
            $table->string('partita_iva')->nullable()->after('codice_fiscale');
            $table->string('regione')->after('partita_iva');
            $table->string('provincia')->after('regione');
            $table->string('comune')->after('provincia');
            $table->string('indirizzo')->nullable()->after('comune');
            $table->string('cap')->nullable()->after('indirizzo');
            $table->json('categorie_interesse')->nullable()->after('cap');
            $table->json('livelli_interesse')->nullable()->after('categorie_interesse');
            $table->json('importi_interesse')->nullable()->after('livelli_interesse');
            $table->boolean('profilo_completo')->default(false)->after('importi_interesse');
        });
    }

    public function down(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->dropColumn([
                'nome_ente', 'tipo_ente', 'codice_fiscale', 'partita_iva',
                'regione', 'provincia', 'comune', 'indirizzo', 'cap',
                'categorie_interesse', 'livelli_interesse', 'importi_interesse',
                'profilo_completo'
            ]);
        });
    }
};