<?php

namespace Database\Factories;

use App\Models\Activity;
use App\Models\Business;
use App\Models\Favorites;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Favorites>
 */
class FavoritesFactory extends Factory
{
    protected $model = Favorites::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'activity_id' => Activity::factory(),
            'business_id' => null,
        ];
    }

    public function forBusiness(?Business $business = null): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_id' => null,
            'business_id' => $business?->id ?? Business::factory(),
        ]);
    }

    public function forActivity(?Activity $activity = null): static
    {
        return $this->state(fn (array $attributes) => [
            'activity_id' => $activity?->id ?? Activity::factory(),
            'business_id' => null,
        ]);
    }
}
