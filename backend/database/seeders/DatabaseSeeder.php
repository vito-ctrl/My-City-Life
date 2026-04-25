<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            ActivitySeeder::class,
            BusinessSeeder::class,
            BookingSeeder::class,
            ReservationSeeder::class,
            EngagementSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
