<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Business;
use Illuminate\Support\Facades\Auth;

class BusinessController extends Controller
{
    public function create(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type'        => ['required', 'string', 'in:Bar,Cafe,Restaurant,Store,Event Space,Other'],
            'location'    => ['required', 'string'],
            'image'       => ['nullable', 'string'],
            'opening_hours'=> ['nullable', 'string'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();

        if (!$user->isOrganizer()) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $business = $user->businesses()->create($validated);

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

     public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'type'        => ['sometimes', 'string', 'in:Bar,Cafe,Restaurant,Store,Event Space,Other'],
            'location'    => ['sometimes', 'string'],
            'image'       => ['nullable', 'string'],
            'opening_hours'=> ['nullable', 'string'],
        ]);

        $user = JWTAuth::parseToken()->authenticate();

        if (!$user->isOrganizer()) {
            return response()->json(['error' => 'User is not an organizer'], 403);
        }

        $business = $user->businesses()->find($id);

        if (!$business) {
            return response()->json(['error' => 'Business not found or unauthorized'], 404);
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

        $business->delete();

        return response()->json(['message' => 'Business deleted successfully']);
    }
}
