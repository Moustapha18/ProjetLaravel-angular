// database/migrations/2025_08_26_175459_add_soft_deletes_to_categories_products.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasColumn('categories','deleted_at')) {
            Schema::table('categories', fn(Blueprint $t) => $t->softDeletes());
        }
        if (!Schema::hasColumn('products','deleted_at')) {
            Schema::table('products', fn(Blueprint $t) => $t->softDeletes());
        }
    }
    public function down(): void {
        if (Schema::hasColumn('categories','deleted_at')) {
            Schema::table('categories', fn(Blueprint $t) => $t->dropSoftDeletes());
        }
        if (Schema::hasColumn('products','deleted_at')) {
            Schema::table('products', fn(Blueprint $t) => $t->dropSoftDeletes());
        }
    }
};
