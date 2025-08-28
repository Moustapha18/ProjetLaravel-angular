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
        Schema::table('categories', fn(Blueprint $t) => $t->softDeletes());
        Schema::table('products', fn(Blueprint $t) => $t->softDeletes());
    }
    public function down(): void {
        Schema::table('categories', fn(Blueprint $t) => $t->dropSoftDeletes());
        Schema::table('products', fn(Blueprint $t) => $t->dropSoftDeletes());
    }


    /**
     * Reverse the migrations.
     */

};
