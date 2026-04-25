<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Business>
 */
class BusinessFactory extends Factory
{
    protected $model = Business::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->organizer(),
            'name' => fake()->company() . ' ' . fake()->randomElement([
                'Cafe',
                'Studio',
                'House',
                'Lounge',
                'Hub',
                'Venue',
            ]),
            'type' => fake()->randomElement([
                'Bar',
                'Cafe',
                'Restaurant',
                'Store',
                'Event Space',
                'Other',
            ]),
            'location' => fake()->randomElement([
                'Marrakech Medina',
                'Gueliz, Marrakech',
                'Casablanca Marina',
                'Tangier City Center',
                'Agadir Bay',
            ]),
            'description' => fake()->paragraphs(2, true),
            'image' => json_encode([
                'businesses/' . fake()->numberBetween(1, 16) . '.jpg',
            ]),
            'opening_hours' => fake()->randomElement([
                '08:00 - 18:00',
                '09:00 - 23:00',
                '10:00 - 22:00',
                '18:00 - 02:00',
            ]),
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => null,
            'banned_at' => null,
            'banned_reason' => null,
            'banned_by' => null,
        ];
    }

    public function pendingApproval(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }

    public function banned(): static
    {
        return $this->state(fn (array $attributes) => [
            'banned_at' => now(),
            'banned_reason' => fake()->sentence(),
        ]);
    }
}
