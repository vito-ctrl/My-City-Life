<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    public function run(): void
    {
        // Skip when activities already exist to keep the seeder safe on repeated runs.
        if (Activity::query()->exists()) {
            return;
        }

        $approvedBy = User::query()->where('role', 'admin')->value('id');
        $creators = User::query()
            ->whereIn('role', ['user', 'Organizer'])
            ->whereNull('banned_at')
            ->get();

        foreach ($creators as $index => $creator) {
            Activity::factory()
                ->count($creator->role === 'Organizer' ? 3 : 2)
                ->for($creator)
                ->state([
                    'approved_by' => $approvedBy,
                    'approved_at' => now()->subDays(fake()->numberBetween(1, 20)),
                ])
                ->create();

            if ($index < 2) {
                Activity::factory()
                    ->pendingApproval()
                    ->for($creator)
                    ->create();
            }
        }
    }
}
