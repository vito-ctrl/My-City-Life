<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'confirmed', 'cancelled']);
        $paymentStatus = $status === 'confirmed'
            ? fake()->randomElement(['unpaid', 'paid'])
            : 'unpaid';

        return [
            'user_id' => User::factory(),
            'activity_id' => Activity::factory(),
            'booking_date' => fake()->dateTimeBetween('+1 day', '+2 months'),
            'number_of_guests' => fake()->numberBetween(1, 6),
            'status' => $status,
            'booked_at' => fake()->dateTimeBetween('-2 weeks', 'now'),
            'cancelled_at' => $status === 'cancelled'
                ? fake()->dateTimeBetween('-1 week', 'now')
                : null,
            'amount' => fake()->randomFloat(2, 0, 900),
            'payment_status' => $paymentStatus,
            'payment_method' => $paymentStatus === 'paid'
                ? fake()->randomElement(['card', 'stripe', 'cash'])
                : null,
            'stripe_payment_intent_id' => null,
            'stripe_charge_id' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'cancelled_at' => null,
        ]);
    }
}
