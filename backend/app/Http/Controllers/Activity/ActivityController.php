<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\UserProfile;
use App\Models\Organizer;
use App\Models\Activity;
use Tymon\JWTAuth\Facades\JWTAuth;


class ActivityController extends Controller
{
    public function create(Request $request)
{
    // ✅ Validation (stronger)
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'description' => ['required', 'string'],
        'category' => ['required', 'string'],
        'location' => ['nullable', 'string'],
        'price' => ['nullable', 'numeric', 'min:0'],
        'is_free' => ['required', 'boolean'],
        'image' => ['nullable', 'string'], // or image if upload
        'start_date' => ['required', 'date'],
        'end_date' => ['required', 'date', 'after:start_date'],
    ]);

    // ✅ Auth user (JWT)
    $user = JWTAuth::parseToken()->authenticate();

    // ✅ Get organizer safely
    $organizer = $user->organizer; // no () → returns model directly

    if (!$organizer) {
        return response()->json([
            'error' => 'User is not an organizer'
        ], 403);
    }

    // ✅ Create activity using relationship (BEST PRACTICE)
    $activity = $organizer->activities()->create($validated);

    return response()->json([
        'message' => 'Activity created successfully',
        'data' => $activity
    ], 201);
}

}
