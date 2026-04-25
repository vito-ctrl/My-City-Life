<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\ReservableItem;
use App\Models\User;
use Illuminate\Database\Seeder;

class BusinessSeeder extends Seeder
{
    public function run(): void
    {
        // Skip when businesses already exist so the seeded catalog stays stable.
        if (Business::query()->exists()) {
            return;
        }

        $approvedBy = User::query()->where('role', 'admin')->value('id');
        $organizers = User::query()
            ->where('role', 'Organizer')
            ->whereNull('banned_at')
            ->get();

        foreach ($organizers as $index => $organizer) {
            $approvedBusinesses = Business::factory()
                ->count(2)
                ->for($organizer)
                ->state([
                    'approved_by' => $approvedBy,
                    'approved_at' => now()->subDays(fake()->numberBetween(2, 30)),
                ])
                ->create();

            foreach ($approvedBusinesses as $business) {
                ReservableItem::factory()
                    ->count(fake()->numberBetween(2, 4))
                    ->for($business)
                    ->create();
            }

            if ($index === 0) {
                Business::factory()
                    ->pendingApproval()
                    ->for($organizer)
                    ->create();
            }
        }
    }
}
