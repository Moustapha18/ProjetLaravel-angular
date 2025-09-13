<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('webhook_endpoints', function (Blueprint $t) {
            $t->id();
            $t->string('url');
            $t->string('secret');           // clé secrète pour signature HMAC
            $t->json('events');             // liste d’événements écoutés
            $t->boolean('is_active')->default(true);
            $t->timestamps();
        });

        Schema::create('webhook_deliveries', function (Blueprint $t) {
            $t->id();
            $t->foreignId('webhook_endpoint_id')->constrained()->cascadeOnDelete();
            $t->string('event');
            $t->json('payload');
            $t->unsignedSmallInteger('attempts')->default(0);
            $t->unsignedSmallInteger('max_attempts')->default(5);
            $t->unsignedInteger('status_code')->nullable();
            $t->text('error')->nullable();
            $t->timestamp('sent_at')->nullable();
            $t->timestamps();
            $t->index(['webhook_endpoint_id','event']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhook_endpoints');
    }
};
