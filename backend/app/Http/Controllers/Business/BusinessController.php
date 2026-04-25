<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Business;
use Illuminate\Support\Facades\Storage;


class BusinessController extends Controller
{
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type'        => ['required', 'string', 'in:Bar,Cafe,Restaurant,Store,Event Space,Other'],
            'location'    => ['required', 'string'],
            'image'       => ['nullable', 'array', 'min:1'],
            'opening_hours'=> ['nullable', 'string'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();

        $paths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $paths[] = $image->store('Businesses', 'public');
            }
        }

        $BusinessData = array_merge($validated, [
            'image' => json_encode($paths),
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        if (!$user->isOrganizer()) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $business = $user->businesses()->create($BusinessData);
        $business = $this->appendMeta($business, $user);

        return response()->json([
            'message' => 'Business created successfully',
            'data'    => $business
        ], 201);
    }

    public function index(Request $request)
    {
        $user = $this->resolveOptionalUser();

        $businesses = Business::with('user')
            ->publiclyVisible()
            ->withCount(['likes', 'favorites'])
            ->when($user, function ($query) use ($user) {
                $query->withExists([
                    'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    'favorites as favorited' => fn ($favoritesQuery) => $favoritesQuery->where('user_id', $user->id),
                ]);
            })
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->latest()
            ->paginate(15);

        $businesses->getCollection()->transform(fn ($business) => $this->appendMeta($business, $user));

        return response()->json($businesses);
    }

    public function show($id)
    {
        $user = $this->resolveOptionalUser();

        $business = Business::with('user')
            ->withCount(['likes', 'favorites'])
            ->when($user, function ($query) use ($user) {
                $query->withExists([
                    'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    'favorites as favorited' => fn ($favoritesQuery) => $favoritesQuery->where('user_id', $user->id),
                ]);
            })
            ->find($id);

        if (! $business || ! $business->isVisibleTo($user)) {
            return response()->json(['error' => 'Business not found'], 404);
        }

        $business = $this->appendMeta($business, $user);

        return response()->json(['data' => $business]);
    }

    public function getAllOwnerBusinesses(){
        // return "hi";
        $user = JWTAuth::parseToken()->authenticate();
        
        // return $user->id;
        $business = $user->businesses()
            ->with('user')
            ->withCount(['likes', 'favorites'])
            ->withExists([
                'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                'favorites as favorited' => fn ($favoritesQuery) => $favoritesQuery->where('user_id', $user->id),
            ])
            ->get();
        $business->transform(fn ($entry) => $this->appendMeta($entry, $user));
        return response()->json($business);
    }

    public function update(Request $request, $id)
{
    $validated = $request->validate([
        'name'        => ['sometimes', 'string', 'max:255'],
        'description' => ['sometimes', 'string'],
        'type'        => ['sometimes', 'string'],
        'location'    => ['sometimes', 'string'],
        'opening_hours'=> ['nullable', 'string'],
    ]);

    $user = JWTAuth::parseToken()->authenticate();
    $business = $user->businesses()->findOrFail($id);

    if ($business->isBanned()) {
        return response()->json(['error' => 'This business has been banned.'], 403);
    }

    if ($request->hasFile('images')) {
        $oldImages = json_decode($business->image, true) ?? [];
        foreach ($oldImages as $oldPath) {
            Storage::disk('public')->delete($oldPath);
        }

        $paths = [];
        foreach ($request->file('images') as $image) {
            $paths[] = $image->store('Businesses', 'public');
        }
        $validated['image'] = json_encode($paths);
    }

    $business->update($validated);
    $business = $this->appendMeta(
        $business->fresh()->loadCount(['likes', 'favorites']),
        $user
    );

    return response()->json([
        'message' => 'Business updated successfully',
        'data'    => $business
    ]);
}

    public function destroy($id)
    {
        $user = JWTAuth::parseToken()->authenticate();
        
        if (!$user->isOrganizer()) {
            return response()->json(['error' => 'User is not an organizer'], 403);
            }
            
        $business = $user->businesses()->find($id);
            
        if (!$business) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
        }

        if ($business->isBanned()) {
            return response()->json(['error' => 'This business has been banned.'], 403);
        }

        $images = json_decode($business->image, true) ?? [];

        foreach ($images as $path) {
            Storage::disk('public')->delete($path);
        }

        $business->delete();

        return response()->json(['message' => 'Business deleted successfully']);
    }

    private function appendMeta(Business $business, $user = null): Business
    {
        $images = json_decode($business->image, true) ?? [];
        $business->image_urls = array_map(function ($path) {
            if (!$path) {
                return null;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            $normalizedPath = preg_replace('#^/?storage/#', '', $path);

            return asset('storage/' . ltrim($normalizedPath, '/'));
        }, $images);

        $business->image_urls = array_values(array_filter($business->image_urls));
        $business->liked = (bool) ($business->liked ?? false);
        $business->favorited = (bool) ($business->favorited ?? false);

        return $business;
    }

    private function resolveOptionalUser()
    {
        try {
            return JWTAuth::parseToken()->authenticate();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
