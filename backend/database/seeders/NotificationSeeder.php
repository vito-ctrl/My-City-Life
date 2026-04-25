<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        if (Notification::query()->exists()) {
            return;
        }

        User::query()
            ->whereNull('banned_at')
            ->get()
            ->each(function (User $user) {
                Notification::factory()
                    ->count(fake()->numberBetween(2, 4))
                    ->for($user)
                    ->create();
            });
    }
}
