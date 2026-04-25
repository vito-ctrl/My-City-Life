<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProfile>
 */
class UserProfileFactory extends Factory
{
    protected $model = UserProfile::class;

    public function definition(): array
    {
        $interestPool = [
            'Art',
            'Beach Trips',
            'Coffee',
            'Cooking',
            'Culture',
            'Food',
            'Hiking',
            'History',
            'Live Music',
            'Nightlife',
            'Photography',
            'Shopping',
            'Wellness',
        ];

        return [
            'user_id' => User::factory(),
            'interests' => fake()->randomElements($interestPool, fake()->numberBetween(3, 5)),
        ];
    }
}
