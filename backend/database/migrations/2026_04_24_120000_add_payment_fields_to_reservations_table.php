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
        Schema::table('reservations', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->default(0)->after('status');
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])->default('unpaid')->after('amount');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->string('stripe_payment_intent_id')->nullable()->unique()->after('payment_method');
            $table->string('stripe_charge_id')->nullable()->after('stripe_payment_intent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn([
                'amount',
                'payment_status',
                'payment_method',
                'stripe_payment_intent_id',
                'stripe_charge_id',
            ]);
        });
    }
};
