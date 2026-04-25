<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Activity;

class OrganizerController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = auth()->user();

        $activityIds = Activity::where('user_id', $user->id)->pluck('id');

        $totalActivities = $activityIds->count();

        $totalBookings = Booking::whereIn('activity_id', $activityIds)->count();

        $totalRevenue = Booking::whereIn('activity_id', $activityIds)
            ->where('payment_status', 'paid')
            ->sum('amount');

        $totalLikes = \App\Models\Like::whereIn('activity_id', $activityIds)->count();
        $totalComments = \App\Models\Comment::whereIn('activity_id', $activityIds)->count();

        $recentBookings = Booking::with(['activity', 'user'])
            ->whereIn('activity_id', $activityIds)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_activities' => $totalActivities,
                'total_bookings'   => $totalBookings,
                'total_revenue'    => (float) $totalRevenue,
                'total_likes'      => $totalLikes,
                'total_comments'   => $totalComments,
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }

    public function bookings(Request $request)
    {
        $user = auth()->user();

        $activityIds = Activity::where('user_id', $user->id)->pluck('id');

        $query = Booking::with(['activity', 'user'])
            ->whereIn('activity_id', $activityIds);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->get();

        return response()->json($bookings);
    }

    public function activityBookings($id)
    {
        $user     = auth()->user();
        $activity = Activity::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $bookings = Booking::with('user')
            ->where('activity_id', $activity->id)
            ->latest()
            ->get();

        return response()->json([
            'activity' => $activity,
            'bookings' => $bookings,
        ]);
    }
}
