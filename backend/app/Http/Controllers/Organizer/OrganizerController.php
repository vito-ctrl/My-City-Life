<?php

namespace App\Http\Controllers\Organizer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Activity;

class OrganizerController extends Controller
{
    /**
     * GET /api/organizer/dashboard
     *
     * Returns a simple summary for the Organizer's home screen:
     *   - total activities they have created
     *   - total bookings received across all their activities
     *   - total confirmed revenue (sum of paid bookings)
     *   - the 5 most recent incoming bookings
     */
    public function dashboard(Request $request)
    {
        $user = auth()->user();

        // Get all activity IDs that belong to this organizer
        $activityIds = Activity::where('user_id', $user->id)->pluck('id');

        // Count how many activities they have
        $totalActivities = $activityIds->count();

        // Count all bookings for those activities
        $totalBookings = Booking::whereIn('activity_id', $activityIds)->count();

        // Sum up revenue from confirmed + paid bookings only
        $totalRevenue = Booking::whereIn('activity_id', $activityIds)
            ->where('payment_status', 'paid')
            ->sum('amount');

        // The 5 most recent bookings so the organizer can see at a glance
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
            ],
            'recent_bookings' => $recentBookings,
        ]);
    }

    /**
     * GET /api/organizer/bookings
     *
     * Returns ALL incoming bookings across all of the organizer's activities.
     * Supports optional query parameter: ?status=pending|confirmed|cancelled
     */
    public function bookings(Request $request)
    {
        $user = auth()->user();

        // Get all activity IDs that belong to this organizer
        $activityIds = Activity::where('user_id', $user->id)->pluck('id');

        $query = Booking::with(['activity', 'user'])
            ->whereIn('activity_id', $activityIds);

        // Optional filter: ?status=pending
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->latest()->get();

        return response()->json($bookings);
    }

    /**
     * GET /api/organizer/activities/{id}/bookings
     *
     * Returns all bookings for ONE specific activity owned by the organizer.
     */
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
