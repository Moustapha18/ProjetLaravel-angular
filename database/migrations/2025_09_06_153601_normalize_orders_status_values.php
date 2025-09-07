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
        //
        DB::statement("
            UPDATE orders
            SET status = 'EN_PREPARATION'
            WHERE status IS NULL
               OR status NOT IN ('EN_PREPARATION','PRETE','EN_LIVRAISON','LIVREE')
        ");

        // Option : mapping plus fin
        DB::statement("UPDATE orders SET status = 'EN_PREPARATION' WHERE status = 'PENDING'");
        DB::statement("UPDATE orders SET status = 'PRETE'          WHERE status = 'PAID'");
        DB::statement("UPDATE orders SET status = 'EN_PREPARATION' WHERE status = 'CANCELLED'");

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
