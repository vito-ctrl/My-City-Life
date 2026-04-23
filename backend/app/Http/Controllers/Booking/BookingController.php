<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Booking;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use App\Models\Activity;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'activity_id' => 'required|exists:activities,id',
                'booking_date' => 'required|date',
                'number_of_guests' => 'required|integer|min:1',
                'is_open_to_group' => 'boolean',
            ]);
    
            $user = auth()->user();
            $activity = Activity::findOrFail($request->activity_id);
    
            $amount = $activity->is_free ? 0 : ($activity->price * $request->number_of_guests);
    
            $booking = Booking::create([
                'user_id' => $user->id,
                'activity_id' => $activity->id,
                'booking_date' => $request->booking_date,
                'number_of_guests' => $request->number_of_guests,
                'is_open_to_group' => $request->boolean('is_open_to_group', false),
                'amount' => $amount,
                'payment_status' => $activity->is_free ? 'paid' : 'unpaid',
                'status' => $activity->price === 0 ? 'confirmed' : 'pending',
            ]);
    
            if ($booking->status === 'confirmed' && $booking->is_open_to_group) {
                (new \App\Http\Controllers\Social\SocialMatchController)->checkAndNotifyMatch($booking);
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

        if(!$booking) {
            return response()->json(['error' => 'no booking founded.'], 403);
        }

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

        \Log::info('Webhook received', ['type' => $event->type]);

        if ($event->type === 'payment_intent.succeeded') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();

            if ($booking) {
                $booking->update([
                    'status'           => 'confirmed',
                    'payment_status'   => 'paid',
                    'stripe_charge_id' => $intent->latest_charge,
                ]);

                if ($booking->is_open_to_group) {
                    (new \App\Http\Controllers\Social\SocialMatchController)->checkAndNotifyMatch($booking);
                }
            }
        }

        if ($event->type === 'payment_intent.payment_failed') {
            $intent  = $event->data->object;
            $booking = Booking::where('stripe_payment_intent_id', $intent->id)->first();
            if ($booking) {
                $booking->update(['payment_status' => 'unpaid']);
            }
        }

        return response()->json(['received' => true]);
    }


    private function triggerSocialMatching(Booking $newBooking)
    {
        $newBooking->load('activity');

        $matches = Booking::where('activity_id', $newBooking->activity_id)
            ->where('user_id', '!=', $newBooking->user_id)
            ->where('is_open_to_group', true)
            ->where('status', 'confirmed')
            ->get();

        foreach ($matches as $match) {
            $requestData = [
                'activity_id' => $newBooking->activity_id,
                'sender_id'   => $newBooking->user_id,
                'receiver_id' => $match->user_id,
            ];

            $sharedRequest = \DB::table('shared_booking_requests')
                ->where($requestData)
                ->first();

            if (!$sharedRequest) {
                $requestId = \DB::table('shared_booking_requests')->insertGetId(array_merge($requestData, [
                    'status'     => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            } else {
                \DB::table('shared_booking_requests')->where('id', $sharedRequest->id)->update([
                    'status'     => 'pending',
                    'updated_at' => now(),
                ]);
                $requestId = $sharedRequest->id;
            }

            broadcast(new \App\Events\SocialMatchFound($match->user_id, $newBooking->activity->title, $requestId));
        }
    }
}
