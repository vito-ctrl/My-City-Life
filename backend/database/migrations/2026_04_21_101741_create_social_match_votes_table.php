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
        Schema::create('social_match_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_one_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('user_two_id')->constrained('users')->onDelete('cascade');
            $table->enum('user_one_status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->enum('user_two_status', ['pending', 'accepted', 'declined'])->default('pending');
            $table->foreignId('chat_id')->nullable()->constrained('booking_chats')->nullOnDelete();
            $table->timestamps();
 
            // Prevent duplicate vote rows for the same pair on the same activity
            $table->unique(['activity_id', 'user_one_id', 'user_two_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_match_votes');
    }
};
