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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Nullable Foreign Keys instead of Morphs
            $table->foreignId('activity_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('business_id')->nullable()->constrained()->cascadeOnDelete();

            $table->timestamps();

            // Prevent duplicating likes on either combination
            $table->unique(['user_id', 'activity_id']);
            $table->unique(['user_id', 'business_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
