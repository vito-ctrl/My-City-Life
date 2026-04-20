<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookingChat;
use App\Models\BookingMessage;
use App\Events\ChatMessageSent;

class BookingChatController extends Controller
{
    /**
     * Get all chat rooms the authenticated user is part of.
     */
    public function index()
    {
        $user = auth()->user();
        
        $chats = BookingChat::whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['activity:id,title', 'users:id,name,email'])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('sender_id', '!=', $user->id)->where('is_read', false);
            }])
            // get the latest message for the preview
            ->with(['messages' => function ($query) {
                $query->latest()->limit(1);
            }])
            ->get();

        return response()->json($chats);
    }

    /**
     * Get a specific chat room and its messages.
     */
    public function show($slug)
    {
        $user = auth()->user();
        
        $chat = BookingChat::where('slug', $slug)
            ->whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['activity:id,title', 'users:id,name,email'])
            ->firstOrFail();

        // Mark messages as read
        BookingMessage::where('booking_chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $chat->messages()->with('sender:id,name')->orderBy('created_at', 'asc')->get();

        return response()->json([
            'chat' => $chat,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message to the chat room.
     */
    public function sendMessage(Request $request, $slug)
    {
        $request->validate(['message' => 'required|string|max:1000']);
        
        $user = auth()->user();
        
        $chat = BookingChat::where('slug', $slug)
            ->whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->firstOrFail();

        $message = $chat->messages()->create([
            'sender_id' => $user->id,
            'message' => $request->message,
        ]);

        $message->load('sender:id,name');

        // Broadcast the message globally
        broadcast(new ChatMessageSent($chat->slug, $message))->toOthers();

        return response()->json($message, 201);
    }
}
