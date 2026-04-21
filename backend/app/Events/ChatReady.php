<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired to BOTH users the moment both votes are 'accepted'.
 * Frontend listens on their private user channel and redirects
 * them straight to the newly created chat room.
 */
class ChatReady implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $userId;
    public string $chatSlug;
    public string $activityName;

    public function __construct(int $userId, string $chatSlug, string $activityName)
    {
        $this->userId       = $userId;
        $this->chatSlug     = $chatSlug;
        $this->activityName = $activityName;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->userId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'chat_slug'     => $this->chatSlug,
            'activityName'  => $this->activityName,
            'message'       => "Your chat for {$this->activityName} is ready!",
        ];
    }
}