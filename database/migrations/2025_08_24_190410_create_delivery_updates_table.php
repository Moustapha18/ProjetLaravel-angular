<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('delivery_updates')) {
            Schema::create('delivery_updates', function (Blueprint $t) {
                $t->id();
                $t->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
                $t->string('status');
                $t->text('note')->nullable();
                $t->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('delivery_updates');
    }
};
