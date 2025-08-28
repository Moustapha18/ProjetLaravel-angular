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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('SIMULATED');     // ex: STRIPE, SIMULATED
            $table->string('reference')->nullable();              // id transaction
            $table->unsignedInteger('amount_cents');              // montant débité
            $table->string('status')->default('SUCCEEDED');       // SUCCEEDED / FAILED / PENDING
            $table->json('raw_payload')->nullable();              // payload complet
            $table->timestamps();
            $table->index(['order_id','status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
