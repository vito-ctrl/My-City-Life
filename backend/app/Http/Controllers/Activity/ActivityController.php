<?php

namespace App\Http\Controllers\Activity;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
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
        $activityData = array_merge($validated, [
            'image' => json_encode($paths),
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        $activity = $user->activities()->create($activityData);

        return response()->json([
            'message' => 'Activity created successfully',
            'data'    => $activity
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $this->resolveOptionalUser();

        $activities = Activity::with('user')
            ->publiclyVisible()
            ->withCount(['likes', 'favorites'])
            ->when($user, function ($query) use ($user) {
                $query->withExists([
                    'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    'favorites as favorited' => fn ($favoritesQuery) => $favoritesQuery->where('user_id', $user->id),
                ]);
            })
            ->when($request->category, fn($q, $v) => $q->where('category', $v))
            ->when($request->search,   fn($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->latest()
            ->paginate(15);

        $activities->getCollection()->transform(fn ($activity) => $this->appendMeta($activity, $user));

        return response()->json($activities);
    }

    public function show($id)
    {
        $user = $this->resolveOptionalUser();

        $activity = Activity::with('user')
            ->withCount(['likes', 'favorites'])
            ->when($user, function ($query) use ($user) {
                $query->withExists([
                    'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    'favorites as favorited' => fn ($favoritesQuery) => $favoritesQuery->where('user_id', $user->id),
                ]);
            })
            ->find($id);

        if (! $activity || ! $activity->isVisibleTo($user)) {
            return response()->json(['error' => 'Activity not found'], 404);
        }

        $activity = $this->appendMeta($activity, $user);

        return response()->json(['data' => $activity]);
    }

    public function update(Request $request, $id)
    {
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
        ]);

        $user = JWTAuth::parseToken()->authenticate();
        $activity = $user->activities()->find($id);

        if (!$activity) {
            return response()->json(['error' => 'Unauthorized'], 404);
        }

        if ($request->hasFile('images')) {
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

    private function appendMeta(Activity $activity, ?User $user): Activity
    {
        $images = json_decode($activity->image, true) ?? [];
        $activity->image_urls = array_values(array_filter(array_map(function ($path) {
            if (!$path) {
                return null;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            $normalizedPath = preg_replace('#^/?storage/#', '', $path);

            return asset('storage/' . ltrim($normalizedPath, '/'));
        }, $images)));

        $activity->liked = (bool) ($activity->liked ?? false);
        $activity->favorited = (bool) ($activity->favorited ?? false);

        return $activity;
    }

    private function resolveOptionalUser(): ?User
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (\Throwable $e) {
            return null;
        }
    }

}
