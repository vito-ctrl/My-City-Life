<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Business;
use Illuminate\Support\Facades\Auth;
use App\Models\Reservation;

class BusinesReservationController extends Controller
{
    public function StoreReservationItem(Request $request, $businessId)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $business = Business::where('id', $businessId)->where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'name'     => 'required|string',
            'capacity' => 'required|integer|min:1',
            'price'    => 'nullable|numeric',
        ]);

        $item = $business->reservableItems()->create($validated);

        return response()->json(['message' => 'Item added', 'data' => $item], 201);
    }

public function UpdateReservationItem(Request $request, $businessId, $itemId)
{
    // 1. Authenticate the user
    $user = JWTAuth::parseToken()->authenticate();

    // 2. Verify the business exists and belongs to this user
    $business = Business::where('id', $businessId)
        ->where('user_id', $user->id)
        ->firstOrFail();

    // 3. Find the specific reservable item within that business
    $item = $business->reservableItems()->findOrFail($itemId);

    // 4. Validate the incoming data
    // We use 'sometimes' so you can update only specific fields if you want
    $validated = $request->validate([
        'name'     => 'sometimes|required|string',
        'capacity' => 'sometimes|required|integer|min:1',
        'price'    => 'sometimes|nullable|numeric',
    ]);

    // 5. Perform the update
    $item->update($validated);

    return response()->json([
        'message' => 'Item updated successfully',
        'data' => $item
    ], 200);
}
    public function GetReservationItems($id){
        $business = Business::where('id', $id)->firstOrFail();
        $businessItem = $business->reservableItems()->get();
        return response()->json($businessItem);
    }

    public function StoreReservation(Request $request)
    {
        $validated = $request->validate([
            'reservable_item_id' => 'required|exists:reservable_items,id',
            'start_time'         => 'required|date|after:now',
            'end_time'           => 'required|date|after:start_time',
            'notes'              => 'nullable|string',
        ]);

        $user = JWTAuth::parseToken()->authenticate();

        // Check availability
        $isBooked = Reservation::where('reservable_item_id', $validated['reservable_item_id'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                      ->orWhereBetween('end_time', [$validated['start_time'], $validated['end_time']]);
            })
            ->exists();

        if ($isBooked) {
            return response()->json(['error' => 'This slot is already taken'], 422);
        }

        $reservation = Reservation::create([
            'user_id'            => $user->id,
            'reservable_item_id' => $validated['reservable_item_id'],
            'start_time'         => $validated['start_time'],
            'end_time'           => $validated['end_time'],
            'notes'              => $validated['notes'],
        ]);

        return response()->json(['message' => 'Reservation pending', 'data' => $reservation], 201);
    }

    public function indexReservation()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $reservations = Reservation::with('reservableItem.business')
            ->where('user_id', $user->id)
            ->get();

        return response()->json($reservations);
    }

    public function GetBusinessReservations($businessId)
    {
        $user = JWTAuth::parseToken()->authenticate();

        // 1. Verify that the business exists and belongs to the authenticated user
        $business = Business::where('id', $businessId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // 2. Fetch all reservations related to this business's items
        $reservations = Reservation::whereHas('reservableItem', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
        ->with(['user', 'reservableItem']) // Get the customer info and item details
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($reservations);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,cancelled']);
        
        $user = JWTAuth::parseToken()->authenticate();
        // Ensure the reservation belongs to a business owned by this user
        $reservation = Reservation::whereHas('reservableItem.business', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        $reservation->update(['status' => $request->status]);

        return response()->json(['message' => 'Status updated', 'data' => $reservation]);
    }
}
