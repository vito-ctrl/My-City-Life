<?php

namespace Database\Factories;

use App\Models\Reservation;
use App\Models\ReservableItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('+1 day', '+3 months');
        $endTime = (clone $startTime)->modify('+' . fake()->numberBetween(1, 4) . ' hours');
        $status = fake()->randomElement(['pending', 'confirmed', 'cancelled']);
        $paymentStatus = $status === 'confirmed'
            ? fake()->randomElement(['unpaid', 'paid'])
            : 'unpaid';

        return [
            'user_id' => User::factory(),
            'reservable_item_id' => ReservableItem::factory(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'status' => $status,
            'amount' => fake()->randomFloat(2, 0, 500),
            'payment_status' => $paymentStatus,
            'payment_method' => $paymentStatus === 'paid'
                ? fake()->randomElement(['card', 'stripe', 'cash'])
                : null,
            'stripe_payment_intent_id' => null,
            'stripe_charge_id' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
