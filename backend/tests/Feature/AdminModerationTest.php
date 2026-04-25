<?php

use App\Models\Business;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function apiUser(string $role = 'user', array $overrides = []): User
{
    $user = User::factory()->create(array_merge([
        'role' => $role,
        'password' => Hash::make('password'),
    ], $overrides));

    $user->assignRole($role);

    return $user;
}

function authHeadersFor(User $user): array
{
    return [
        'Authorization' => 'Bearer ' . JWTAuth::fromUser($user),
    ];
}

test('standard user registration flow remains intact', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Normal User',
        'email' => 'normal@example.com',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'role' => 'user',
        'date_of_birth' => '1995-05-10',
        'city' => 'Casablanca',
        'interests' => ['food', 'music'],
    ]);

    $response
        ->assertCreated()
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'role'],
            'token',
        ])
        ->assertJsonPath('user.role', 'user');

    $user = User::where('email', 'normal@example.com')->firstOrFail();

    $this->assertDatabaseHas('user_profiles', [
        'user_id' => $user->id,
    ]);
});

test('organizer registration creates a pending business that admin can approve', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Organizer One',
        'email' => 'organizer@example.com',
        'password' => 'secret123',
        'password_confirmation' => 'secret123',
        'role' => 'Organizer',
        'date_of_birth' => '1990-04-10',
        'city' => 'Rabat',
        'business_name' => 'Atlas Cafe',
        'business_type' => 'Cafe',
        'business_location' => 'Rabat Medina',
        'business_description' => 'A pending cafe listing',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('user.role', 'Organizer');

    $organizer = User::where('email', 'organizer@example.com')->firstOrFail();
    $business = $organizer->businesses()->firstOrFail();

    expect($business->is_approved)->toBeFalse();

    $this->getJson("/api/businesses/{$business->id}")
        ->assertNotFound();

    $admin = apiUser('admin');

    $this->withHeaders(authHeadersFor($admin))
        ->patchJson("/api/admin/businesses/{$business->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.id', $business->id);

    $this->getJson("/api/businesses/{$business->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $business->id);
});

test('activities stay hidden until an admin approves them', function () {
    $user = apiUser('user');

    $response = $this->withHeaders(authHeadersFor($user))
        ->postJson('/api/activities/create', [
            'title' => 'Hidden Until Approved',
            'description' => 'Pending activity',
            'category' => 'Culture',
            'location' => 'Marrakesh',
            'price' => 25,
            'start_date' => now()->addWeek()->toDateTimeString(),
            'end_date' => now()->addWeek()->addHour()->toDateTimeString(),
            'duration' => '1 hour',
            'requirements' => 'None',
            'max_capacity' => 10,
        ]);

    $response->assertCreated();

    $activityId = $response->json('data.id');

    $this->assertDatabaseHas('activities', [
        'id' => $activityId,
        'is_approved' => false,
    ]);

    $this->getJson("/api/activities/{$activityId}")
        ->assertNotFound();

    $admin = apiUser('admin');

    $this->withHeaders(authHeadersFor($admin))
        ->patchJson("/api/admin/activities/{$activityId}/approve")
        ->assertOk()
        ->assertJsonPath('data.id', $activityId);

    $this->getJson("/api/activities/{$activityId}")
        ->assertOk()
        ->assertJsonPath('data.id', $activityId);
});

test('banned users cannot log in or access protected organizer routes', function () {
    $organizer = apiUser('Organizer', [
        'email' => 'banned-organizer@example.com',
        'banned_at' => now(),
    ]);

    $this->postJson('/api/login', [
        'email' => $organizer->email,
        'password' => 'password',
    ])
        ->assertForbidden()
        ->assertJson([
            'error' => 'Your account has been banned.',
        ]);

    $this->withHeaders(authHeadersFor($organizer))
        ->getJson('/api/organizer/dashboard')
        ->assertForbidden()
        ->assertJson([
            'error' => 'Your account has been banned.',
        ]);
});

test('banned businesses cannot be operated by their owner', function () {
    $organizer = apiUser('Organizer');
    $admin = apiUser('admin');

    $business = Business::create([
        'user_id' => $organizer->id,
        'name' => 'Blocked Venue',
        'type' => 'Event Space',
        'location' => 'Tangier',
        'description' => 'A business that will be banned',
        'is_approved' => true,
    ]);

    $this->withHeaders(authHeadersFor($admin))
        ->patchJson("/api/admin/businesses/{$business->id}/ban", [
            'reason' => 'Fraudulent listing',
        ])
        ->assertOk()
        ->assertJsonPath('data.id', $business->id);

    $this->withHeaders(authHeadersFor($organizer))
        ->putJson("/api/businesses/{$business->id}", [
            'name' => 'Updated Name',
        ])
        ->assertForbidden()
        ->assertJson([
            'error' => 'This business has been banned.',
        ]);
});
