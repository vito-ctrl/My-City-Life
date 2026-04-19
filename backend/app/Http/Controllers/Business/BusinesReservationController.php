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
}
