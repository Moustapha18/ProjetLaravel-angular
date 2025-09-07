<?php
// database/migrations/2025_09_06_120000_fix_orders_status_default.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        DB::table('orders')->where('status', 'PENDING')->update(['status' => 'EN_PREPARATION']);
        // MySQL/PgSQL :
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'EN_PREPARATION'");
        // (si MySQL <8, adapte le SQL)
    }
    public function down(): void {
        DB::statement("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PENDING'");
    }
};
