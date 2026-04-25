<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Business;
use App\Models\Comment;
use App\Models\Favorites;
use App\Models\Like;
use App\Models\User;
use Illuminate\Database\Seeder;

class EngagementSeeder extends Seeder
{
    public function run(): void
    {
        // These interaction tables are unique by user/resource pair, so we seed once.
        if (Like::query()->exists() || Comment::query()->exists() || Favorites::query()->exists()) {
            return;
        }

        $users = User::query()->whereNull('banned_at')->get();
        $activities = Activity::query()->where('is_approved', true)->get();
        $businesses = Business::query()->where('is_approved', true)->whereNull('banned_at')->get();

        foreach ($activities as $activity) {
            $participants = $users->where('id', '!=', $activity->user_id)->shuffle();

            foreach ($participants->take(fake()->numberBetween(2, min(5, $participants->count()))) as $user) {
                Like::firstOrCreate([
                    'user_id' => $user->id,
                    'activity_id' => $activity->id,
                ]);
            }

            foreach ($participants->take(fake()->numberBetween(1, min(3, $participants->count()))) as $user) {
                Favorites::firstOrCreate([
                    'user_id' => $user->id,
                    'activity_id' => $activity->id,
                ]);
            }

            foreach ($participants->take(fake()->numberBetween(2, min(4, $participants->count()))) as $user) {
                Comment::factory()
                    ->for($user)
                    ->forActivity($activity)
                    ->create();
            }
        }

        foreach ($businesses as $business) {
            $participants = $users->where('id', '!=', $business->user_id)->shuffle();

            foreach ($participants->take(fake()->numberBetween(2, min(5, $participants->count()))) as $user) {
                Like::firstOrCreate([
                    'user_id' => $user->id,
                    'business_id' => $business->id,
                ]);
            }

            foreach ($participants->take(fake()->numberBetween(1, min(3, $participants->count()))) as $user) {
                Favorites::firstOrCreate([
                    'user_id' => $user->id,
                    'business_id' => $business->id,
                ]);
            }

            foreach ($participants->take(fake()->numberBetween(2, min(4, $participants->count()))) as $user) {
                Comment::factory()
                    ->for($user)
                    ->forBusiness($business)
                    ->create();
            }
        }
    }
}
