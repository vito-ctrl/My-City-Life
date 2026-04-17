<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SocialMatchFound implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $receiverId;
    public $activityName;
    public $requestId;

    public function __construct($receiverId, $activityName, $requestId)
    {
        $this->receiverId = $receiverId;
        $this->activityName = $activityName;
        $this->requestId = $requestId;
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
            'activityName' => $this->activityName,
            'requestId' => $this->requestId,
        ];
    }
}