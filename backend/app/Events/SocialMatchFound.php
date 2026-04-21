<?php

namespace App\Events;

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
        $this->receiverId   = $receiverId;
        $this->activityName = $activityName;
        $this->requestId    = $requestId;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->receiverId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'message'      => "Someone else is going to {$this->activityName}!",
            'activityName' => $this->activityName,
            'voteId'       => $this->requestId, // FIX: was $this->voteId (undefined), now correctly uses $this->requestId
        ];
    }
}