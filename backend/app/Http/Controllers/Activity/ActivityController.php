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
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category'    => ['required', 'string'],
            'location'    => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'is_free'     => ['required', 'boolean'],
            'image'       => ['nullable', 'string'],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required', 'date', 'after:start_date'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        $organizer = $user->organizer;

        if (!$organizer) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $activity = $organizer->activities()->create($validated);

        return response()->json([
            'message' => 'Activity created successfully',
            'data'    => $activity
        ], 201);
    }

    public function index(Request $request)
    {
        $activities = Activity::with('organizer')
            ->when($request->category, fn($q, $v) => $q->where('category', $v))
            ->when($request->search,   fn($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->latest()
            ->paginate(15);

        return response()->json($activities);
    }

    public function show($id)
    {
        $activity = Activity::with('organizer')->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Activity not found'], 404);
        }

        return response()->json(['data' => $activity]);
    }

     public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'category'    => ['sometimes', 'string'],
            'location'    => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'is_free'     => ['sometimes', 'boolean'],
            'image'       => ['nullable', 'string'],
            'start_date'  => ['sometimes', 'date'],
            'end_date'    => ['sometimes', 'date', 'after:start_date'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        $organizer = $user->organizer;

        if (!$organizer) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $activity = $organizer->activities()->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Activity not found or unauthorized'], 404);
        }

        $activity->update($validated);

        return response()->json([
            'message' => 'Activity updated successfully',
            'data'    => $activity
        ]);
    }

    public function destroy($id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $organizer = $user->organizer;

        if (!$organizer) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $activity = $organizer->activities()->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Activity not found or unauthorized'], 404);
        }

        $activity->delete();

        return response()->json(['message' => 'Activity deleted successfully']);
    }

}
