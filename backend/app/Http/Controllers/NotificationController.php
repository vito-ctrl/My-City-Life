<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();
            
        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $user = auth()->user();
        $notification = Notification::where('user_id', $user->id)->findOrFail($id);
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function unreadCount()
    {
        $user = auth()->user();
        $count = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();
            
        return response()->json(['count' => $count]);
    }
}
