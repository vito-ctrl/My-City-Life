<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Business;
use Illuminate\Support\Facades\Auth;
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
            'image' => json_encode($paths) 
        ]);

        if (!$user->isOrganizer()) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $business = $user->businesses()->create($BusinessData);

        return response()->json([
            'message' => 'Business created successfully',
            'data'    => $business
        ], 201);
    }

    public function index(Request $request)
    {
        $businesses = Business::with('user')
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->when($request->search, fn($q, $v) => $q->where('name', 'like', "%{$v}%"))
            ->latest()
            ->paginate(15);

        return response()->json($businesses);
    }

    public function show($id)
    {
        $business = Business::with('user')->find($id);

        if (!$business) {
            return response()->json(['error' => 'Business not found'], 404);
        }

        return response()->json(['data' => $business]);
    }

    public function getAllOwnerBusinesses(){
        $user = JWTAuth::parseToken()->authenticate();
        
        // return $user->id;
        $business = Business::with('user')->find($user->id)->all();
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

    if (!$business) {
        return response()->json(['error' => 'Unauthorized'], 404);
    }

    // Handle new photo uploads
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

        $images = json_decode($business->image, true) ?? [];

        foreach ($images as $path) {
            Storage::disk('public')->delete($path);
        }

        $business->delete();

        return response()->json(['message' => 'Business deleted successfully']);
    }
}
