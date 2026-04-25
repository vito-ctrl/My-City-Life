<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Keep the core demo accounts stable so reseeding does not duplicate them.
        $admin = User::updateOrCreate(
            ['email' => 'admin@mycitylife.test'],
            [
                'name' => 'Platform Admin',
                'role' => 'admin',
                'date_of_birth' => '1990-01-15',
                'city' => 'Casablanca',
                'image' => 'users/admin.jpg',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->syncRoles(['admin']);

        $organizers = collect([
            [
                'name' => 'Leila Bennani',
                'email' => 'organizer1@mycitylife.test',
                'city' => 'Marrakech',
            ],
            [
                'name' => 'Youssef El Idrissi',
                'email' => 'organizer2@mycitylife.test',
                'city' => 'Rabat',
            ],
            [
                'name' => 'Sara Tazi',
                'email' => 'organizer3@mycitylife.test',
                'city' => 'Tangier',
            ],
        ])->map(function (array $payload, int $index) {
            $user = User::updateOrCreate(
                ['email' => $payload['email']],
                [
                    'name' => $payload['name'],
                    'role' => 'Organizer',
                    'date_of_birth' => now()->subYears(28 + $index)->toDateString(),
                    'city' => $payload['city'],
                    'image' => 'users/organizer-' . ($index + 1) . '.jpg',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles(['Organizer']);

            return $user;
        });

        collect([
            [
                'name' => 'Amine Saadi',
                'email' => 'user1@mycitylife.test',
                'city' => 'Casablanca',
                'interests' => ['Food', 'Culture', 'Photography'],
            ],
            [
                'name' => 'Nora Ait Ali',
                'email' => 'user2@mycitylife.test',
                'city' => 'Agadir',
                'interests' => ['Beach Trips', 'Wellness', 'Coffee'],
            ],
            [
                'name' => 'Omar El Fassi',
                'email' => 'user3@mycitylife.test',
                'city' => 'Fes',
                'interests' => ['History', 'Art', 'Hiking'],
            ],
            [
                'name' => 'Meryem Chraibi',
                'email' => 'user4@mycitylife.test',
                'city' => 'Essaouira',
                'interests' => ['Live Music', 'Food', 'Nightlife'],
            ],
        ])->each(function (array $payload, int $index) {
            $user = User::updateOrCreate(
                ['email' => $payload['email']],
                [
                    'name' => $payload['name'],
                    'role' => 'user',
                    'date_of_birth' => now()->subYears(24 + $index)->toDateString(),
                    'city' => $payload['city'],
                    'image' => 'users/member-' . ($index + 1) . '.jpg',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            $user->syncRoles(['user']);

            UserProfile::updateOrCreate(
                ['user_id' => $user->id],
                ['interests' => $payload['interests']]
            );
        });

        if (User::count() < 12) {
            User::factory()
                ->count(12 - User::count())
                ->create()
                ->each(function (User $user) {
                    $user->syncRoles([$user->role]);

                    if ($user->role === 'user') {
                        UserProfile::factory()->for($user, 'user')->create();
                    }
                });
        }
    }
}
