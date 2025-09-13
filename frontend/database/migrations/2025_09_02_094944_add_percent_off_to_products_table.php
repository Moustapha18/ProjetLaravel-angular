<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // PostgreSQL n’a pas “unsigned” → on reste sur smallInteger nullable
            if (!Schema::hasColumn('products', 'percent_off')) {
                $table->smallInteger('percent_off')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'percent_off')) {
                $table->dropColumn('percent_off');
            }
        });
    }
};
