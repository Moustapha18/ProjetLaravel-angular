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
        Schema::table('promotions', function (Blueprint $table) {
            $table->index(['is_active']);
            $table->index(['starts_at']);
            $table->index(['ends_at']);
        });
    }
    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropIndex(['promotions_is_active_index']);
            $table->dropIndex(['promotions_starts_at_index']);
            $table->dropIndex(['promotions_ends_at_index']);
        });
    }
};
