<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Business;
use App\Models\User;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        // Get or create a user (owner of businesses)
        $user = User::first();

        if (!$user) {
            $user = User::factory()->create();
        }

        $businesses = [
            [
                'name' => 'Café Clock',
                'description' => 'Famous café with live music and Moroccan fusion food.',
                'type' => 'Cafe',
                'location' => 'Medina, Marrakech',
                'image' => 'cafe_clock.jpg',
                'opening_hours' => '09:00 - 23:00',
                'user_id' => 4,
            ],
            [
                'name' => 'Le Jardin Secret Restaurant',
                'description' => 'Beautiful garden restaurant with traditional Moroccan dishes.',
                'type' => 'Restaurant',
                'location' => 'Medina, Marrakech',
                'image' => 'restaurant.jpg',
                'opening_hours' => '10:00 - 22:00',
                'user_id' => 4,
            ],
            [
                'name' => 'Sky Lounge Rooftop',
                'description' => 'Rooftop bar with amazing sunset views and cocktails.',
                'type' => 'Bar',
                'location' => 'Hivernage',
                'image' => 'rooftop.jpg',
                'opening_hours' => '18:00 - 02:00',
                'user_id' => 4,
            ],
            [
                'name' => 'Atlas Fitness',
                'description' => 'Modern gym with full equipment and personal trainers.',
                'type' => 'Other',
                'location' => 'Gueliz',
                'image' => 'gym.jpg',
                'opening_hours' => '07:00 - 23:00',
                'user_id' => 4,
            ],
            [
                'name' => 'Souk Artisan Market',
                'description' => 'Local handmade crafts and traditional Moroccan goods.',
                'type' => 'Store',
                'location' => 'Old Medina',
                'image' => 'souk.jpg',
                'opening_hours' => '08:00 - 20:00',
                'user_id' => 4,
            ],
        ];

        foreach ($businesses as $business) {
            Business::create($business);
        }
    }
}
