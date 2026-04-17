<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatSlug;
    public $messageData;

    public function __construct($chatSlug, $messageData)
    {
        $this->chatSlug = $chatSlug;
        $this->messageData = $messageData;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->chatSlug),
        ];
    }

    public function broadcastWith(): array
    {
        return $this->messageData->toArray();
    }
}
