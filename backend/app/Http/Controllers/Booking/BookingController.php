<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Booking;
use Tymon\JWTAuth\Facades\JWTAuth;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use App\Models\Activity;

class BookingController extends Controller
{
    // POST /api/bookings/{id}/payment-intent
    // Creates a Stripe PaymentIntent and returns client_secret to the frontend
    public function createPaymentIntent($id)
    {
        $user    = JWTAuth::parseToken()->authenticate();
        $booking = Booking::where('user_id', $user->id)
                        ->where('status', 'pending')
                        ->where('payment_status', 'unpaid')
                        ->findOrFail($id);

        if ($booking->amount <= 0) {
            return response()->json(['error' => 'This booking does not require payment.'], 400);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $intent = \Stripe\PaymentIntent::create([
            'amount'   => (int) round($booking->amount * 100),
            'currency' => 'mad',
            'metadata' => [
                'booking_id'  => $booking->id,
                'user_id'     => $user->id,
                'activity_id' => $booking->activity_id,
            ],
        ]);

        $booking->update(['stripe_payment_intent_id' => $intent->id]);

        return response()->json([
            'client_secret' => $intent->client_secret,
        ]);
    }

    // POST /api/stripe/webhook  (no JWT — called by Stripe)
    public function webhook(Request $request)
    {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

        $payload = $request->getContent();
        $sig     = $request->header('Stripe-Signature');

        try {
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig, config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        if ($event->type === 'payment_intent.succeeded') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();

            if ($booking) {
                $booking->update([
                    'status'           => 'confirmed',
                    'payment_status'   => 'paid',
                    'stripe_charge_id' => $intent->latest_charge,
                ]);
            }
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();
            if ($booking) {
                $booking->update(['payment_status' => 'unpaid']); // let user retry
            }
        }

        return response()->json(['received' => true]);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'booking_date' => 'required|date',
                'number_of_guests' => 'required|integer|min:1',
            ]);

            $user = auth()->user();
            $activity = Activity::findOrFail($request->activity_id);

            $amount = $activity->is_free ? 0 : ($activity->price * $request->number_of_guests);

            // Create booking. If activity is free, auto-confirm it!
            $booking = Booking::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'booking_date' => $request->booking_date,
                'number_of_guests' => $request->number_of_guests,
                'amount' => $amount,
                'payment_status' => $activity->is_free ? 'paid' : 'unpaid',
                'status' => $activity->is_free ? 'confirmed' : 'pending',
            ]);

            return response()->json($booking, 201);
        } catch (\Exception $e) {
            // This will tell you EXACTLY what went wrong in your browser's Network tab
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

/**
 * Display a listing of the user's bookings.
 */
public function index(Request $request)
{
    $user = auth()->user();

    if ($request->query('type') === 'incoming') {
        // Bookings for activities owned by the current user
        $bookings = Booking::with(['activity', 'user'])
            ->whereHas('activity', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
    } else {
        // Bookings made by the current user (outgoing)
        $bookings = Booking::with('activity')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    return response()->json($bookings);
}

/**
 * Display the specified booking.
 */
public function show($id)
{
    $user = auth()->user();

    $booking = Booking::with('activity')
        ->where('user_id', $user->id)
        ->findOrFail($id);

    return response()->json($booking);
}
}
