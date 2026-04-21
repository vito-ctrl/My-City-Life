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
     * GET /api/social/chats
     * Returns ALL chats (both social + support) for the authenticated user.
     */
    public function index()
    {
        $user = auth()->user();

        $chats = BookingChat::whereHas('users', fn($q) => $q->where('user_id', $user->id))
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

    /**
     * GET /api/social/chats/{slug}
     * Returns a specific chat and its messages.
     */
    public function show($slug)
    {
        $user = auth()->user();

        $chat = BookingChat::where('slug', $slug)
            ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
            ->with(['activity:id,title', 'users:id,name,email'])
            ->firstOrFail();

        // Mark messages as read
        BookingMessage::where('booking_chat_id', $chat->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $messages = $chat->messages()
            ->with('sender:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'chat'     => $chat,
            'messages' => $messages,
        ]);
    }

    /**
     * POST /api/social/chats/{slug}/message
     * Send a message to any chat room (social or support).
     */
    public function sendMessage(Request $request, $slug)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $user = auth()->user();

        $chat = BookingChat::where('slug', $slug)
            ->whereHas('users', fn($q) => $q->where('user_id', $user->id))
            ->firstOrFail();

        $message = $chat->messages()->create([
            'sender_id' => $user->id,
            'message'   => $request->message,
        ]);

        $message->load('sender:id,name');

        broadcast(new ChatMessageSent($chat->slug, $message))->toOthers();

        return response()->json($message, 201);
    }
}