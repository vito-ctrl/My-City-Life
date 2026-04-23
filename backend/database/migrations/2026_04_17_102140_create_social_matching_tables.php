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
        Schema::create('booking_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('activity_id')->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->enum('type', ['social', 'support'])->default('social');
            $table->timestamps();
        });

        Schema::create('booking_chat_user', function (Blueprint $table) {
            $table->foreignId('booking_chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        });

        Schema::create('booking_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_chat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_messages');
        Schema::dropIfExists('booking_chat_user');
        Schema::dropIfExists('booking_chats');
        Schema::dropIfExists('shared_booking_requests');
    }
};
