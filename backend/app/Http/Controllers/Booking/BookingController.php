<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Activity;
use App\Models\Reservation;
use App\Services\NotificationService;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'booking_date' => 'required|date',
                'number_of_guests' => 'required|integer|min:1',
            ]);
    
            $user = auth()->user();
            $activity = Activity::with('user')->findOrFail($request->activity_id);

            if (! $activity->isBookable()) {
                return response()->json(['error' => 'Activity not available'], 404);
            }
    
            $amount = $activity->is_free ? 0 : ($activity->price * $request->number_of_guests);
    
            $booking = Booking::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'booking_date' => $request->booking_date,
                'number_of_guests' => $request->number_of_guests,
                'amount' => $amount,
                'payment_status' => $activity->is_free ? 'paid' : 'unpaid',
                'status' => $activity->price === 0 ? 'confirmed' : 'pending',
            ]);

            $booking->load(['activity', 'user']);
            NotificationService::notifyBookingRequest($booking);

            if ($booking->status === 'confirmed') {
                NotificationService::notifyBookingConfirmed($booking);
            }
    
            return response()->json($booking, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function index(Request $request)
    {
        $user = auth()->user();

        if ($request->query('type') === 'incoming') {
            $bookings = Booking::with(['activity', 'user'])
                ->whereHas('activity', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $bookings = Booking::with('activity')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return response()->json($bookings);
    }

    public function show($id)
    {
        $user = auth()->user();

        $booking = Booking::with('activity')
            ->where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json($booking);
    }

    
    public function confirm($id)
    {
        $user    = auth()->user();
        $booking = Booking::with('activity')->findOrFail($id);


        if ($booking->activity->user_id !== $user->id) {
            return response()->json([
                'error' => 'Unauthorized. Only the activity owner can confirm bookings.',
                'user_id' =>  $user->id,
                'activity_owner' =>  $booking->activity->user_id,
                'activity_is' => $booking->activity->id
            ], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['error' => 'Cannot confirm a cancelled booking.'], 422);
        }

        $booking->update(['status' => 'confirmed']);
        $booking->load(['activity.user', 'user']);

        NotificationService::notifyBookingConfirmed($booking);

        return response()->json([
            'message' => 'Booking confirmed successfully.',
            'booking' => $booking->fresh(),
        ]);
    }

    public function cancel($id)
    {
        $user    = auth()->user();
        $booking = Booking::with('activity')->findOrFail($id);

        $isBooker        = $booking->user_id === $user->id;
        $isActivityOwner = $booking->activity->user_id === $user->id;

        if (!$isBooker && !$isActivityOwner) {
            return response()->json(['error' => 'Unauthorized. You cannot cancel this booking.'], 403);
        }

        if ($booking->status === 'cancelled') {
            return response()->json(['error' => 'Booking is already cancelled.'], 422);
        }

        $booking->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);
        $booking->load(['activity.user', 'user']);

        NotificationService::notifyBookingCancelled($booking, $user->id);

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'booking' => $booking->fresh(),
        ]);
    }
    
    public function createPaymentIntent($id)
{
    $user    = auth()->user();
    $booking = Booking::where('user_id', $user->id)
                    ->where('status', 'confirmed')
                    ->where('payment_status', 'unpaid')
                    ->findOrFail($id);

    if ($booking->amount <= 0) {
        return response()->json(['error' => 'This booking does not require payment.'], 400);
    }

    \Stripe\Stripe::setApiKey(config('services.stripe.secret'));

    if ($booking->stripe_payment_intent_id) {
        $intent = \Stripe\PaymentIntent::retrieve($booking->stripe_payment_intent_id);
        
        if (in_array($intent->status, ['requires_payment_method', 'requires_confirmation', 'requires_action'])) {
            return response()->json(['client_secret' => $intent->client_secret]);
        }
    }

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

    return response()->json(['client_secret' => $intent->client_secret]);
}

    public function syncPaymentStatus(Request $request, $id)
    {
        $user = auth()->user();
        $booking = Booking::where('user_id', $user->id)->findOrFail($id);

        if (!$booking->stripe_payment_intent_id) {
            return response()->json(['error' => 'No payment intent found for this booking.'], 422);
        }

        if ($request->filled('payment_intent_id') && $request->payment_intent_id !== $booking->stripe_payment_intent_id) {
            return response()->json(['error' => 'Payment intent mismatch.'], 422);
        }

        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        $intent = \Stripe\PaymentIntent::retrieve($booking->stripe_payment_intent_id);

        if ($intent->status !== 'succeeded') {
            return response()->json([
                'error' => 'Payment has not completed yet.',
                'payment_status' => $intent->status,
            ], 422);
        }

        $this->markBookingAsPaid($booking, $intent);

        return response()->json([
            'message' => 'Payment synchronized successfully.',
            'booking' => $booking->fresh(['activity']),
        ]);
    }

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
            \Log::error('Stripe Webhook signature verification failed', [
                'error' => $e->getMessage(),
                'payload' => $payload,
                'signature' => $sig
            ]);
            return response()->json(['error' => $e->getMessage()], 400);
        }

        \Log::info('Webhook received', ['type' => $event->type]);

        if ($event->type === 'payment_intent.succeeded') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();

            if ($booking) {
                $paymentMethod = $intent->payment_method_types[0] ?? 'stripe';
                $this->markBookingAsPaid($booking, $intent);

                \Log::info('Booking payment updated successfully', [
                    'booking_id' => $booking->id,
                    'payment_intent' => $intent->id,
                    'payment_method' => $paymentMethod
                ]);


            } else {
                $reservation = Reservation::where('stripe_payment_intent_id', $intent->id)->first();

                if ($reservation) {
                    $paymentMethod = $intent->payment_method_types[0] ?? 'stripe';
                    $this->markReservationAsPaid($reservation, $intent);

                    \Log::info('Reservation payment updated successfully', [
                        'reservation_id' => $reservation->id,
                        'payment_intent' => $intent->id,
                        'payment_method' => $paymentMethod,
                    ]);
                } else {
                    \Log::warning('No payable entity found for payment intent', ['intent_id' => $intent->id]);
                }
            }
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();
            if ($booking) {
                $booking->update(['payment_status' => 'unpaid']);
                \Log::warning('Booking payment failed', ['booking_id' => $booking->id, 'error' => $intent->last_payment_error->message ?? 'Unknown error']);
            } else {
                $reservation = Reservation::where('stripe_payment_intent_id', $intent->id)->first();

                if ($reservation) {
                    $reservation->update(['payment_status' => 'unpaid']);
                    \Log::warning('Reservation payment failed', ['reservation_id' => $reservation->id, 'error' => $intent->last_payment_error->message ?? 'Unknown error']);
                }
            }
        }

        return response()->json(['received' => true]);
    }

    private function markBookingAsPaid(Booking $booking, object $intent): void
    {
        $paymentMethod = $intent->payment_method_types[0] ?? 'stripe';
        $chargeId = is_string($intent->latest_charge) && $intent->latest_charge !== ''
            ? $intent->latest_charge
            : $intent->id;

        $booking->update([
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'stripe_charge_id' => $chargeId,
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
