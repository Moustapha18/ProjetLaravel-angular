<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        if (!Schema::hasColumn('products','image_path')) {
            Schema::table('products', function(Blueprint $t){
                $t->string('image_path')->nullable()->after('stock');
            });
        }
    }
    public function down(): void {
        if (Schema::hasColumn('products','image_path')) {
            Schema::table('products', function(Blueprint $t){
                $t->dropColumn('image_path');
            });
        }
    }
};
