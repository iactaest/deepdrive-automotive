<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            // Elimina la foreign key se esiste ancora
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {
                // La foreign key potrebbe essere già stata eliminata
            }
            
            // Ricrea la foreign key verso la tabella 'enti'
            $table->foreign('user_id')
                  ->references('id')
                  ->on('enti')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('bandi_match', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            
            // Ripristina la foreign key verso 'users'
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }
};