<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $t) {
                $t->id();
                $t->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $t->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $t->string('product_name');
                $t->bigInteger('unit_price_cents');
                $t->unsignedInteger('qty');
                $t->bigInteger('line_total_cents');
                $t->timestamps();
            });

        }
    }

    public function down(): void {
        Schema::dropIfExists('order_items');
    }
};
