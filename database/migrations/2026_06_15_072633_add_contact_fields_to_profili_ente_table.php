<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->string('telefono')->nullable();
            $table->string('email_pec')->nullable();
            $table->string('sito_web')->nullable();
            $table->string('fax')->nullable();
            $table->string('indirizzo_pec')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('profili_ente', function (Blueprint $table) {
            $table->dropColumn(['telefono', 'email_pec', 'sito_web', 'fax', 'indirizzo_pec']);
        });
    }
};