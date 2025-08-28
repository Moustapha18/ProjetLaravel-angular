<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->nullableMorphs('subject');       // subject_type, subject_id  (ex: App\Models\Order, 15)
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // acteur
            $t->string('action');                // created | updated | deleted | status_updated | etc.
            $t->json('changes')->nullable();     // diff avant/après
            $t->string('ip')->nullable();
            $t->string('user_agent', 1024)->nullable();
            $t->string('method', 10)->nullable();
            $t->string('path', 1024)->nullable();
            $t->timestamp('created_at');         // on  pas besoin d’updated_at
          //  $t->index(['subject_type', 'subject_id']);
            $t->index(['user_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }

};
