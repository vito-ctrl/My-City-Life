<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Activity;
use Carbon\Carbon;
use App\Models\User;

class ActivitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first(); // or create one
    
        if (!$user) {
            $user = User::factory()->create();
        }

        $activities = [
            [
                'title' => 'Sunset Camel Ride',
                'description' => 'Enjoy a magical camel ride in the Marrakech desert during sunset.',
                'category' => 'Outdoors',
                'location' => 'Marrakech Desert',
                'price' => 150,
                'is_free' => false,
                'image' => 'camel.jpg',
                'start_date' => Carbon::now()->addDays(2),
                'end_date' => Carbon::now()->addDays(2),
                'duration' => '2 hours',
                'requirements' => 'Comfortable clothes',
                'user_id' => $user->id,
            ],
            [
                'title' => 'Traditional Cooking Class',
                'description' => 'Learn how to cook authentic Moroccan dishes.',
                'category' => 'Food & Drink',
                'location' => 'Medina, Marrakech',
                'price' => 200,
                'is_free' => false,
                'image' => 'cooking.jpg',
                'start_date' => Carbon::now()->addDays(5),
                'end_date' => Carbon::now()->addDays(5),
                'duration' => '3 hours',
                'requirements' => 'None',
                'user_id' => $user->id,
            ],
            [
                'title' => 'Street Art Tour',
                'description' => 'Explore hidden street art spots in the city.',
                'category' => 'Art',
                'location' => 'Gueliz',
                'price' => 0,
                'is_free' => true,
                'image' => 'art.jpg',
                'start_date' => Carbon::now()->addDays(1),
                'end_date' => Carbon::now()->addDays(1),
                'duration' => '1.5 hours',
                'requirements' => 'Walking shoes',
                'user_id' => $user->id,
            ],
            [
                'title' => 'Night Market Experience',
                'description' => 'عيش تجربة السوق الليلي في جامع الفنا 🔥',
                'category' => 'Culture',
                'location' => 'Jemaa el-Fnaa',
                'price' => 0,
                'is_free' => true,
                'image' => 'market.jpg',
                'start_date' => Carbon::now(),
                'end_date' => Carbon::now(),
                'duration' => 'Flexible',
                'requirements' => null,
                'user_id' => $user->id,
            ],
        ];

        foreach ($activities as $activity) {
            Activity::create($activity);
        }
    }
}
