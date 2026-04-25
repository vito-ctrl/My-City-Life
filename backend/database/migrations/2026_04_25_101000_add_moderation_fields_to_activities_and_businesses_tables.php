<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->boolean('is_approved')->default(true)->after('max_capacity');
            $table->timestamp('approved_at')->nullable()->after('is_approved');
            $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->boolean('is_approved')->default(true)->after('opening_hours');
            $table->timestamp('approved_at')->nullable()->after('is_approved');
            $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->timestamp('banned_at')->nullable()->after('approved_by');
            $table->text('banned_reason')->nullable()->after('banned_at');
            $table->foreignId('banned_by')->nullable()->after('banned_reason')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn(['is_approved', 'approved_at']);
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropConstrainedForeignId('banned_by');
            $table->dropColumn(['is_approved', 'approved_at', 'banned_at', 'banned_reason']);
        });
    }
};
