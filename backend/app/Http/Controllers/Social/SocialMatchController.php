<?php
namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SharedBookingRequest;
use App\Models\BookingChat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SocialMatchController extends Controller
{
    /**
     * Get all pending match requests for the authenticated user.
     */
    public function pending()
    {
        $user = auth()->user();
        
        $requests = SharedBookingRequest::with(['activity', 'sender:id,name']) // Load basic sender info
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->get();

        return response()->json($requests);
    }

    /**
     * Accept a match request and initialize a chat room.
     */
    public function accept(Request $request)
    {
        $request->validate(['request_id' => 'required|exists:shared_booking_requests,id']);
        
        $user = auth()->user();
        $matchRequest = SharedBookingRequest::findOrFail($request->request_id);

        // Security check: Only the receiver can accept
        if ($matchRequest->receiver_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($matchRequest->status !== 'pending') {
            return response()->json(['error' => 'This request has already been processed.'], 400);
        }

        return DB::transaction(function () use ($matchRequest) {
            // 1. Update Handshake Status
            $matchRequest->update(['status' => 'accepted']);

            // 2. Create the Chat Room
            $chat = BookingChat::create([
                'activity_id' => $matchRequest->activity_id,
                'slug' => Str::uuid(), 
            ]);

            // 3. Attach both users to the chat pivot table
            $chat->users()->attach([$matchRequest->sender_id, $matchRequest->receiver_id]);

            // 4. Send the Automated Icebreaker Message
            $chat->messages()->create([
                'sender_id' => null, // null indicates a System Message
                'message' => "🎉 It's a match! You're both going to this activity. Say hi and coordinate your meetup!"
            ]);

            return response()->json([
                'message' => 'Match accepted! Chat room created.',
                'chat_slug' => $chat->slug
            ]);
        });
    }

    /**
     * Decline a match request.
     */
    public function decline(Request $request)
    {
        $request->validate(['request_id' => 'required|exists:shared_booking_requests,id']);
        
        $user = auth()->user();
        $matchRequest = SharedBookingRequest::findOrFail($request->request_id);

        if ($matchRequest->receiver_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // 1. Update status to declined to prevent showing it again
        $matchRequest->update(['status' => 'declined']);

        return response()->json([
            'message' => 'Match declined.',
        ]);
    }
}