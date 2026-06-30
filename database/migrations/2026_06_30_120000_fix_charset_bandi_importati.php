<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Converte l'intera tabella a utf8mb4 per supportare caratteri multibyte
        // (cirillico, arabo, emoji, ecc.) provenienti dalle API esterne
        DB::statement('ALTER TABLE bandi_importati CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE bandi_importati CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci');
    }
};
