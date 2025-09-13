<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (Schema::hasTable('delivery_updates') && !Schema::hasColumn('delivery_updates','deleted_at')) {
            Schema::table('delivery_updates', function (Blueprint $t) {
                $t->softDeletes(); // ajoute deleted_at nullable
            });
        }
    }

    public function down(): void {
        if (Schema::hasTable('delivery_updates') && Schema::hasColumn('delivery_updates','deleted_at')) {
            Schema::table('delivery_updates', function (Blueprint $t) {
                $t->dropColumn('deleted_at');
            });
        }
    }
};
