<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'address')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('address', 1000)->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'address')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('address');
            });
        }
    }
};
