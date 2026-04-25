<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Booking;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        if (Booking::query()->exists()) {
            return;
        }

        $attendees = User::query()
            ->where('role', 'user')
            ->whereNull('banned_at')
            ->get();

        $activities = Activity::query()
            ->where('is_approved', true)
            ->with('user')
            ->get();

        foreach ($activities as $activity) {
            $bookers = $attendees
                ->where('id', '!=', $activity->user_id)
                ->shuffle()
                ->take(fake()->numberBetween(1, min(3, max(1, $attendees->count() - 1))));

            foreach ($bookers as $booker) {
                $guests = fake()->numberBetween(1, min(4, $activity->max_capacity ?? 4));
                $status = fake()->randomElement(['pending', 'confirmed', 'confirmed', 'cancelled']);
                $amount = round((float) $activity->price * $guests, 2);
                $paymentStatus = $amount <= 0
                    ? 'paid'
                    : ($status === 'confirmed' && fake()->boolean(65) ? 'paid' : 'unpaid');

                Booking::factory()
                    ->for($booker)
                    ->for($activity)
                    ->state([
                        'booking_date' => $activity->start_date ?? now()->addDays(7),
                        'number_of_guests' => $guests,
                        'status' => $status,
                        'cancelled_at' => $status === 'cancelled' ? now()->subDays(fake()->numberBetween(1, 3)) : null,
                        'amount' => $amount,
                        'payment_status' => $paymentStatus,
                        'payment_method' => $paymentStatus === 'paid'
                            ? fake()->randomElement(['card', 'stripe'])
                            : null,
                    ])
                    ->create();
            }
        }
    }
}
