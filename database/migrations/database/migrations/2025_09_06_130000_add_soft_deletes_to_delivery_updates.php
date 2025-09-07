// database/migrations/2025_09_06_130000_add_soft_deletes_to_delivery_updates.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (Schema::hasTable('delivery_updates') && !Schema::hasColumn('delivery_updates','deleted_at')) {
            Schema::table('delivery_updates', function (Blueprint $t) {
                $t->softDeletes(); // ajoute la colonne deleted_at
            });
        }
    }

    public function down(): void {
        if (Schema::hasTable('delivery_updates') && Schema::hasColumn('delivery_updates','deleted_at')) {
            Schema::table('delivery_updates', function (Blueprint $t) {
                $t->dropSoftDeletes();
            });
        }
    }
};
