<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        $type = fake()->randomElement([
            'booking.request',
            'booking.confirmed',
            'reservation.request',
            'reservation.confirmed',
            'system.announcement',
        ]);

        return [
            'user_id' => User::factory(),
            'type' => $type,
            'content' => fake()->sentence(10),
            'data' => [
                'title' => str($type)->replace('.', ' ')->title()->toString(),
                'message' => fake()->sentence(12),
            ],
            'is_read' => fake()->boolean(35),
        ];
    }
}
