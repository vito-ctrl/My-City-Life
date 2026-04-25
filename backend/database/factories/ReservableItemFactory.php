<?php

namespace Database\Factories;

use App\Models\Business;
use App\Models\ReservableItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReservableItem>
 */
class ReservableItemFactory extends Factory
{
    protected $model = ReservableItem::class;

    public function definition(): array
    {
        return [
            'business_id' => Business::factory(),
            'name' => fake()->randomElement([
                'Window Table',
                'Private Booth',
                'Rooftop Lounge Spot',
                'Family Table',
                'Chef Counter Seat',
                'Event Hall Access',
            ]),
            'capacity' => fake()->numberBetween(2, 12),
            'price' => fake()->randomFloat(2, 0, 350),
        ];
    }
}
