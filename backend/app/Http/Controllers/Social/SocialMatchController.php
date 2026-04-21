<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SocialMatchVote;
use App\Models\BookingChat;
use App\Models\Booking;
use App\Events\SocialMatchFound;
use App\Events\ChatReady;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SocialMatchController extends Controller
{
    /**
     * Called by your booking logic after a booking is confirmed.
     * Scans for other users who booked the SAME activity and
     * creates a SocialMatchVote + notifies both users.
     *
     * Call this from your BookingController after a booking is stored:
     *   (new SocialMatchController)->checkAndNotifyMatch($booking->user_id, $booking->activity_id);
     */
    public function checkAndNotifyMatch(int $newUserId, int $activityId): void
    {
        $otherUserIds = Booking::where('activity_id', $activityId)
            ->where('user_id', '!=', $newUserId)
            ->pluck('user_id');

        $activity = \App\Models\Activity::find($activityId);

        foreach ($otherUserIds as $otherUserId) {
            $alreadyExists = SocialMatchVote::where('activity_id', $activityId)
                ->where(function ($q) use ($newUserId, $otherUserId) {
                    $q->where(fn($q) => $q->where('user_one_id', $newUserId)->where('user_two_id', $otherUserId))
                      ->orWhere(fn($q) => $q->where('user_one_id', $otherUserId)->where('user_two_id', $newUserId));
                })
                ->exists();

            if ($alreadyExists) continue;

            $vote = SocialMatchVote::create([
                'activity_id'     => $activityId,
                'user_one_id'     => $newUserId,
                'user_two_id'     => $otherUserId,
                'user_one_status' => 'pending',
                'user_two_status' => 'pending',
            ]);

            broadcast(new SocialMatchFound($newUserId,   $activity->title, $vote->id));
            broadcast(new SocialMatchFound($otherUserId, $activity->title, $vote->id));
        }
    }

    /**
     * POST /api/social/vote
     * Body: { vote_id: int, decision: 'accepted'|'declined' }
     */
    public function vote(Request $request)
    {
        $request->validate([
            'vote_id'  => 'required|integer|exists:social_match_votes,id',
            'decision' => 'required|in:accepted,declined',
        ]);

        $user = auth()->user();
        $vote = SocialMatchVote::with('activity')->findOrFail($request->vote_id);

        if ($vote->user_one_id !== $user->id && $vote->user_two_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // FIX: was "user_{$slot}_status" which produced 'user_1_status'/'user_2_status'
        // but columns are named user_one_status / user_two_status
        $statusColumn = $vote->user_one_id === $user->id ? 'user_one_status' : 'user_two_status';

        if ($vote->$statusColumn !== 'pending') {
            return response()->json(['error' => 'You have already voted on this match.'], 400);
        }

        $vote->update([$statusColumn => $request->decision]);
        $vote->refresh();

        if ($request->decision === 'declined') {
            return response()->json(['message' => 'Match declined.']);
        }

        if ($vote->bothAccepted()) {
            return DB::transaction(function () use ($vote) {
                $chat = BookingChat::create([
                    'type'        => 'social',
                    'activity_id' => $vote->activity_id,
                    'slug'        => Str::uuid(),
                ]);

                $chat->users()->attach([$vote->user_one_id, $vote->user_two_id]);

                $chat->messages()->create([
                    'sender_id' => null, // system message — ensure sender_id is nullable in migration
                    'message'   => "🎉 It's a match! You're both going to {$vote->activity->title}. Say hi and plan your meetup!",
                ]);

                $vote->update(['chat_id' => $chat->id]);

                broadcast(new ChatReady($vote->user_one_id, $chat->slug, $vote->activity->title));
                broadcast(new ChatReady($vote->user_two_id, $chat->slug, $vote->activity->title));

                return response()->json([
                    'message'   => 'Both accepted! Chat room is ready.',
                    'chat_slug' => $chat->slug,
                ]);
            });
        }

        return response()->json(['message' => 'Vote recorded. Waiting for the other user.']);
    }

    /**
     * GET /api/social/pending
     * Returns all pending votes for the authenticated user.
     */
    public function pending()
    {
        $user = auth()->user();

        // FIX: was chaining both conditions on the same $q which broke the orWhere grouping
        $votes = SocialMatchVote::with(['activity:id,title', 'userOne:id,name', 'userTwo:id,name'])
            ->where(function ($q) use ($user) {
                $q->where(function ($q) use ($user) {
                    $q->where('user_one_id', $user->id)
                      ->where('user_one_status', 'pending');
                })->orWhere(function ($q) use ($user) {
                    $q->where('user_two_id', $user->id)
                      ->where('user_two_status', 'pending');
                });
            })
            ->get();

        return response()->json($votes);
    }
}