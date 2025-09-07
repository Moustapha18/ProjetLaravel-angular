<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            if (!Schema::hasColumn('orders', 'paid_at')) {
                $t->timestamp('paid_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'paid')) {
                $t->boolean('paid')->default(false)->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            if (Schema::hasColumn('orders', 'paid')) {
                $t->dropColumn('paid');
            }
            if (Schema::hasColumn('orders', 'paid_at')) {
                $t->dropColumn('paid_at');
            }
        });
    }
};
