<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Activity>
 */
class ActivityFactory extends Factory
{
    protected $model = Activity::class;

    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('+2 days', '+2 months');
        $endDate = (clone $startDate)->modify('+' . fake()->numberBetween(2, 8) . ' hours');
        $price = fake()->boolean(20) ? 0 : fake()->randomFloat(2, 50, 450);

        return [
            'user_id' => User::factory(),
            'title' => fake()->randomElement([
                'Sunset Medina Walk',
                'Moroccan Cooking Workshop',
                'Atlas Mountain Day Trip',
                'Hidden Cafes Photo Tour',
                'Gnawa Music Night',
                'Traditional Pottery Class',
            ]),
            'description' => fake()->paragraphs(2, true),
            'category' => fake()->randomElement([
                'Culture',
                'Food & Drink',
                'Outdoors',
                'Art',
                'Music',
                'Wellness',
            ]),
            'location' => fake()->randomElement([
                'Marrakech Medina',
                'Essaouira Coast',
                'Casablanca Center',
                'Agafay Desert',
                'Chefchaouen Old Town',
                'Tangier Corniche',
            ]),
            'price' => $price,
            'image' => json_encode([
                'activities/' . fake()->numberBetween(1, 16) . '.jpg',
            ]),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'duration' => fake()->randomElement(['2 hours', '3 hours', 'Half day', 'Full day']),
            'requirements' => fake()->randomElement([
                'Comfortable shoes recommended.',
                'Bring water and sunscreen.',
                'No special requirements.',
                'Suitable for beginners.',
            ]),
            'max_capacity' => fake()->numberBetween(8, 30),
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => null,
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
}
