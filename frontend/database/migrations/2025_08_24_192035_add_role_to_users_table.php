<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Évite l’erreur "Duplicate column" quand les tests refont les migrations
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('CLIENT')->index()->after('password');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                // Nom d'index par défaut: users_role_index (PostgreSQL)
                try { $table->dropIndex('users_role_index'); } catch (\Throwable $e) {}
                $table->dropColumn('role');
            });
        }
    }
};
