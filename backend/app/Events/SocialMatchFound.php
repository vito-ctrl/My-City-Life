<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SocialMatchFound implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $receiverId;
    public $activityName;

    public function __construct($receiverId, $activityName)
    {
        $this->receiverId = $receiverId;
        $this->activityName = $activityName;
    }

    // This ensures the notification goes ONLY to the matched user
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }

    // Data sent to the frontend
    public function broadcastWith(): array
    {
        return [
            'message' => "Someone else is going to {$this->activityName}!",
            'action_url' => '/dashboard/social',
        ];
    }

    private function triggerSocialMatching(Booking $newBooking)
    {
        $matches = Booking::where('activity_id', $newBooking->activity_id)
            ->where('user_id', '!=', $newBooking->user_id)
            ->where('is_open_to_group', true)
            ->where('status', 'confirmed')
            ->get();

        foreach ($matches as $match) {
            // ... (Your existing DB updateOrInsert logic) ...

            // FIRE THE REAL-TIME NOTIFICATION
            broadcast(new SocialMatchFound($match->user_id, $newBooking->activity->name));
        }
    }
}