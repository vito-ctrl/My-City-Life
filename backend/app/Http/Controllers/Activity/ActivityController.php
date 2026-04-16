<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\UserProfile;
use App\Models\Activity;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Storage;


class ActivityController extends Controller
{
    public function create(Request $request)
    {
        $validated = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['required', 'string'],
            'category'     => ['required', 'string'],
            'location'     => ['required', 'string'],
            'price'        => ['nullable', 'numeric', 'min:0'],
            'is_free'      => ['required'],
            'images'       => ['nullable', 'array', 'min:1'],
            'images.*'     => ['image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date', 'after:start_date'],
            'duration'     => ['nullable', 'string', 'max:255'],
            'requirements' => ['nullable', 'string'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        
        $paths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $paths[] = $image->store('activities', 'public');
            }
        }
        // Convert array to JSON string for the database
        $activityData = array_merge($validated, [
            'image' => json_encode($paths) 
        ]);

        $activity = $user->activities()->create($activityData);

        return response()->json([
            'message' => 'Activity created successfully',
            'data'    => $activity
        ], 201);
    }

    public function index(Request $request)
    {
        $activities = Activity::with('user')
            ->when($request->category, fn($q, $v) => $q->where('category', $v))
            ->when($request->search,   fn($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->latest()
            ->paginate(15);

        // Transform image paths into full URLs for the frontend
        $activities->getCollection()->transform(function ($activity) {
            $images = json_decode($activity->image, true) ?? [];
            $activity->image_urls = array_map(fn($path) => asset('storage/' . $path), $images);
            return $activity;
        });

        return response()->json($activities);
    }

    public function show($id)
    {
        $activity = Activity::with('user')->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Activity not found'], 404);
        }

        // Decode paths and provide full URLs
        $images = json_decode($activity->image, true) ?? [];
        $activity->image_urls = array_map(fn($path) => asset('storage/' . $path), $images);

        return response()->json(['data' => $activity]);
    }

    public function update(Request $request, $id)
    {
        // Validation handles 'images' as an array of files
        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['sometimes', 'string'],
            'category'     => ['sometimes', 'string'],
            'location'     => ['nullable', 'string'],
            'price'        => ['nullable', 'numeric', 'min:0'],
            'is_free'      => ['sometimes'],
            'images'       => ['nullable', 'array'], 
            'images.*'     => ['image', 'mimes:jpeg,png,jpg', 'max:2048'],
            'start_date'   => ['nullable', 'date'],
            'end_date'     => ['nullable', 'date', 'after_or_equal:start_date'],
            'max_capacity' => ['nullable', 'integer', 'min:1'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        $activity = $user->activities()->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Unauthorized'], 404);
        }

        // Handle new image uploads if provided
        if ($request->hasFile('images')) {
            // Optional: Delete old images from storage
            $oldImages = json_decode($activity->image, true) ?? [];
            foreach ($oldImages as $oldPath) {
                Storage::disk('public')->delete($oldPath);
            }

            $paths = [];
            foreach ($request->file('images') as $file) {
                $paths[] = $file->store('activities', 'public');
            }
            $validated['image'] = json_encode($paths);
        }

        $activity->update($validated);

        return response()->json(['message' => 'Updated successfully', 'data' => $activity]);
    }

    public function destroy($id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $activity = $user->activities()->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Unauthorized'], 404);
        }

        // Delete physical files from storage before deleting the record
        $images = json_decode($activity->image, true) ?? [];
    foreach ($images as $path) {
        Storage::disk('public')->delete($path);
    }

        $activity->delete();

        return response()->json(['message' => 'Activity deleted successfully']);
    }

    public function getUserActivities () {
        $user = JWTAuth::parseToken()->authenticate();
        // return "hi";

        $activities = Activity::where('user_id', $user->id)->get();

        return response()->json($activities);
    }

}
