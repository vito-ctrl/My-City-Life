<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Business;
use App\Models\Reservation;
use App\Models\ReservableItem;
use App\Services\NotificationService;

class BusinesReservationController extends Controller
{
    public function StoreReservationItem(Request $request, $businessId)
    {
        $user = JWTAuth::parseToken()->authenticate();
        $business = Business::where('id', $businessId)->where('user_id', $user->id)->firstOrFail();

        if ($business->isBanned()) {
            return response()->json(['error' => 'This business has been banned.'], 403);
        }

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
    $user = JWTAuth::parseToken()->authenticate();

    $business = Business::where('id', $businessId)
        ->where('user_id', $user->id)
        ->firstOrFail();

    if ($business->isBanned()) {
        return response()->json(['error' => 'This business has been banned.'], 403);
    }

    $item = $business->reservableItems()->findOrFail($itemId);

    $validated = $request->validate([
        'name'     => 'sometimes|required|string',
        'capacity' => 'sometimes|required|integer|min:1',
        'price'    => 'sometimes|nullable|numeric',
    ]);

    $item->update($validated);

    return response()->json([
        'message' => 'Item updated successfully',
        'data' => $item
    ], 200);
}
    public function GetReservationItems($id){
        $user = JWTAuth::parseToken()->authenticate();
        $business = Business::with('user')->where('id', $id)->firstOrFail();

        if (! $business->isVisibleTo($user)) {
            return response()->json(['error' => 'Business not found'], 404);
        }

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
        $reservableItem = ReservableItem::with('business')->findOrFail($validated['reservable_item_id']);

        if (! $reservableItem->business || ! $reservableItem->business->isOperational()) {
            return response()->json(['error' => 'Business not available'], 404);
        }

        $isBooked = Reservation::where('reservable_item_id', $validated['reservable_item_id'])
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $validated['end_time'])
            ->where('end_time', '>', $validated['start_time'])
            ->exists();

        if ($isBooked) {
            return response()->json(['error' => 'This slot is already taken'], 422);
        }

        $amount = (float) ($reservableItem->price ?? 0);

        $reservation = Reservation::create([
            'user_id'            => $user->id,
            'reservable_item_id' => $validated['reservable_item_id'],
            'start_time'         => $validated['start_time'],
            'end_time'           => $validated['end_time'],
            'amount'             => $amount,
            'payment_status'     => 'unpaid',
            'notes'              => $validated['notes'],
        ]);

        $reservation->load(['reservableItem.business', 'user']);
        NotificationService::notifyReservationRequest($reservation);

        return response()->json(['message' => 'Reservation pending', 'data' => $reservation], 201);
    }

    public function indexReservation()
    {
        $user = JWTAuth::parseToken()->authenticate();
        $reservations = Reservation::with('reservableItem.business')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reservations);
    }

    public function GetBusinessReservations($businessId)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $business = Business::where('id', $businessId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($business->isBanned()) {
            return response()->json(['error' => 'This business has been banned.'], 403);
        }

        $reservations = Reservation::whereHas('reservableItem', function ($query) use ($businessId) {
            $query->where('business_id', $businessId);
        })
        ->with(['user', 'reservableItem.business'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json($reservations);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,confirmed,cancelled']);
        
        $user = JWTAuth::parseToken()->authenticate();
        $reservation = Reservation::whereHas('reservableItem.business', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->findOrFail($id);

        if ($reservation->reservableItem?->business?->isBanned()) {
            return response()->json(['error' => 'This business has been banned.'], 403);
        }

        $previousStatus = $reservation->status;
        $updates = ['status' => $request->status];

        if ($request->status === 'confirmed' && (float) $reservation->amount <= 0) {
            $updates['payment_status'] = 'paid';
            $updates['payment_method'] = 'free';
        }

        $reservation->update($updates);
        $reservation->load(['reservableItem.business.user', 'user']);

        if ($previousStatus !== $reservation->status) {
            if ($reservation->status === 'confirmed') {
                NotificationService::notifyReservationConfirmed($reservation);
            }

            if ($reservation->status === 'cancelled') {
                NotificationService::notifyReservationCancelled($reservation, $user->id);
            }
        }

        return response()->json(['message' => 'Status updated', 'data' => $reservation]);
    }

    public function createPaymentIntent($id)
    {
        $user = auth()->user();
        $reservation = Reservation::with('reservableItem.business')
            ->where('user_id', $user->id)
            ->where('status', 'confirmed')
            ->where('payment_status', 'unpaid')
            ->findOrFail($id);

        if ($reservation->amount <= 0) {
            return response()->json(['error' => 'This reservation does not require payment.'], 400);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        if ($reservation->stripe_payment_intent_id) {
            $intent = \Stripe\PaymentIntent::retrieve($reservation->stripe_payment_intent_id);

            if (in_array($intent->status, ['requires_payment_method', 'requires_confirmation', 'requires_action'])) {
                return response()->json(['client_secret' => $intent->client_secret]);
            }
        }

        $intent = \Stripe\PaymentIntent::create([
            'amount' => (int) round($reservation->amount * 100),
            'currency' => 'mad',
            'metadata' => [
                'entity_type' => 'reservation',
                'reservation_id' => $reservation->id,
                'user_id' => $user->id,
                'business_id' => $reservation->reservableItem->business_id,
                'reservable_item_id' => $reservation->reservable_item_id,
            ],
        ]);

        $reservation->update(['stripe_payment_intent_id' => $intent->id]);

        return response()->json(['client_secret' => $intent->client_secret]);
    }

    public function syncPaymentStatus(Request $request, $id)
    {
        $user = auth()->user();
        $reservation = Reservation::with('reservableItem.business')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        if (!$reservation->stripe_payment_intent_id) {
            return response()->json(['error' => 'No payment intent found for this reservation.'], 422);
        }

        if ($request->filled('payment_intent_id') && $request->payment_intent_id !== $reservation->stripe_payment_intent_id) {
            return response()->json(['error' => 'Payment intent mismatch.'], 422);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        $intent = \Stripe\PaymentIntent::retrieve($reservation->stripe_payment_intent_id);

        if ($intent->status !== 'succeeded') {
            return response()->json([
                'error' => 'Payment has not completed yet.',
                'payment_status' => $intent->status,
            ], 422);
        }

        $this->markReservationAsPaid($reservation, $intent);

        return response()->json([
            'message' => 'Payment synchronized successfully.',
            'reservation' => $reservation->fresh(['reservableItem.business']),
        ]);
    }

    private function markReservationAsPaid(Reservation $reservation, object $intent): void
    {
        $paymentMethod = $intent->payment_method_types[0] ?? 'stripe';
        $chargeId = is_string($intent->latest_charge) && $intent->latest_charge !== ''
            ? $intent->latest_charge
            : $intent->id;

        $reservation->update([
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'stripe_charge_id' => $chargeId,
            'stripe_payment_intent_id' => $intent->id,
        ]);
    }
}
