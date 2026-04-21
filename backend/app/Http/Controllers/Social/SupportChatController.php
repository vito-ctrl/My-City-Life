<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookingChat;
use App\Models\Booking;
use Illuminate\Support\Str;

class SupportChatController extends Controller
{
    /**
     * POST /api/social/support/chats
     *
     * Opens (or returns existing) a support chat between the authenticated
     * user and the business owner of a given booking.
     *
     * Body: { booking_id: int }
     */
    public function openChat(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|integer|exists:bookings,id',
        ]);

        $user = auth()->user();

        // Load the booking and its activity's owner
        $booking = Booking::with('activity.owner')->findOrFail($request->booking_id);

        // Make sure this booking belongs to the authenticated user
        if ($booking->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $owner = $booking->activity->owner;

        if (!$owner) {
            return response()->json(['error' => 'No business owner found for this activity.'], 404);
        }

        // Return existing support chat if one already exists for this booking
        $existing = BookingChat::where('type', 'support')
            ->where('activity_id', $booking->activity_id)
            ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
            ->whereHas('users', fn($q) => $q->where('user_id', $owner->id))
            ->first();

        if ($existing) {
            return response()->json(['chat' => $existing], 200);
        }

        // Create new support chat
        $chat = BookingChat::create([
            'type'        => 'support',
            'activity_id' => $booking->activity_id,
            'slug'        => Str::uuid(),
        ]);

        $chat->users()->attach([$user->id, $owner->id]);

        $chat->messages()->create([
            'sender_id' => null,
            'message'   => "👋 Support chat opened for {$booking->activity->title}. How can we help?",
        ]);

        return response()->json(['chat' => $chat], 201);
    }

    /**
     * GET /api/social/support/chats
     *
     * Returns all support chats for the authenticated user.
     * Works for both regular users and business owners — returns
     * whichever support chats they are a participant in.
     */
    public function index()
    {
        $user = auth()->user();

        $chats = BookingChat::where('type', 'support')
            ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
            ->with(['activity:id,title', 'users:id,name,email'])
            ->withCount(['messages as unread_count' => fn($q) => $q
                ->where('sender_id', '!=', $user->id)
                ->where('is_read', false)
            ])
            ->with(['messages' => fn($q) => $q->latest()->limit(1)])
            ->latest()
            ->get();

        return response()->json($chats);
    }
}