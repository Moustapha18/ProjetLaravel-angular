<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // Crée la table orders si elle n'existe pas
        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $t) {
                $t->id();
                $t->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $t->string('address')->nullable();
                $t->string('status')->default('EN_PREPARATION');
                $t->bigInteger('total_cents');
                $t->timestamp('paid_at')->nullable();
                $t->timestamps();
            });

        }
    }

    public function down(): void {
        Schema::dropIfExists('orders');
    }
};
