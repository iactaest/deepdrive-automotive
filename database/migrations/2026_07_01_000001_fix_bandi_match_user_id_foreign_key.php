<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            // Il FK originale puntava a enti.id; ora deve puntare a users.id
            // perché il comando usa $profilo->user_id (ID utente, non ID registro enti)
            $table->dropForeign('bandi_match_user_id_foreign');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            $table->dropForeign('bandi_match_user_id_foreign');
            $table->foreign('user_id')->references('id')->on('enti')->onDelete('cascade');
        });
    }
};
