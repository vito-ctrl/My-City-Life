<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\ReservableItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        if (Reservation::query()->exists()) {
            return;
        }

        $guests = User::query()
            ->where('role', 'user')
            ->whereNull('banned_at')
            ->get();

        $items = ReservableItem::query()
            ->with('business')
            ->get();

        foreach ($items as $item) {
            $reservingUsers = $guests
                ->where('id', '!=', $item->business->user_id)
                ->shuffle()
                ->take(fake()->numberBetween(1, min(2, max(1, $guests->count() - 1))));

            foreach ($reservingUsers as $user) {
                $status = fake()->randomElement(['pending', 'confirmed', 'cancelled']);
                $paymentStatus = (float) $item->price === 0
                    ? 'paid'
                    : ($status === 'confirmed' && fake()->boolean(60) ? 'paid' : 'unpaid');

                Reservation::factory()
                    ->for($user)
                    ->for($item)
                    ->state([
                        'status' => $status,
                        'amount' => $item->price,
                        'payment_status' => $paymentStatus,
                        'payment_method' => $paymentStatus === 'paid'
                            ? fake()->randomElement(['card', 'stripe', 'cash'])
                            : null,
                    ])
                    ->create();
            }
        }
    }
}
