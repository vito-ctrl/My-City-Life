<?php

namespace App\Http\Controllers\Statistic;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Activity;
use App\Models\Business;
use App\Models\Booking;
use App\Models\Like;
use App\Models\Comment;

class StatisticController extends Controller
{
    /**
     * General statistics for the currently authenticated user.
     * Shows a summary of all their activities, businesses, bookings, and revenue.
     */
    public function general()
    {
        $user = JWTAuth::parseToken()->authenticate();

        // ── Activities ──────────────────────────────────────────────────
        $activityIds = Activity::where('user_id', $user->id)->pluck('id');
        $totalActivities = $activityIds->count();

        $totalActivityLikes    = Like::whereIn('activity_id', $activityIds)->count();
        $totalActivityComments = Comment::whereIn('activity_id', $activityIds)->count();

        $activityBookings        = Booking::whereIn('activity_id', $activityIds);
        $totalBookings           = $activityBookings->count();
        $totalConfirmedBookings  = (clone $activityBookings)->where('status', 'confirmed')->count();
        $totalPendingBookings    = (clone $activityBookings)->where('status', 'pending')->count();
        $totalCancelledBookings  = (clone $activityBookings)->where('status', 'cancelled')->count();
        $totalRevenue            = (clone $activityBookings)->where('payment_status', 'paid')->sum('amount');

        // ── Businesses ───────────────────────────────────────────────────
        $businessIds = Business::where('user_id', $user->id)->pluck('id');
        $totalBusinesses = $businessIds->count();

        $totalBusinessLikes    = Like::whereIn('business_id', $businessIds)->count();
        $totalBusinessComments = Comment::whereIn('business_id', $businessIds)->count();

        return response()->json([
            'user' => [
                'id'   => $user->id,
                'name' => $user->name,
                'role' => $user->role,
            ],
            'activities' => [
                'total'    => $totalActivities,
                'likes'    => $totalActivityLikes,
                'comments' => $totalActivityComments,
            ],
            'bookings' => [
                'total'     => $totalBookings,
                'confirmed' => $totalConfirmedBookings,
                'pending'   => $totalPendingBookings,
                'cancelled' => $totalCancelledBookings,
            ],
            'revenue' => [
                'total_paid_mad' => number_format($totalRevenue, 2),
            ],
            'businesses' => [
                'total'    => $totalBusinesses,
                'likes'    => $totalBusinessLikes,
                'comments' => $totalBusinessComments,
            ],
        ]);
    }

    /**
     * Specific statistics for a single Activity.
     * Only the owner of the activity can access this.
     */
    public function activitySpecific($id)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $activity = Activity::where('id', $id)->where('user_id', $user->id)->first();

        if (!$activity) {
            return response()->json(['error' => 'Activity not found or you do not own it.'], 404);
        }

        $bookings           = Booking::where('activity_id', $id);
        $totalBookings      = $bookings->count();
        $confirmedBookings  = (clone $bookings)->where('status', 'confirmed')->count();
        $pendingBookings    = (clone $bookings)->where('status', 'pending')->count();
        $cancelledBookings  = (clone $bookings)->where('status', 'cancelled')->count();
        $totalRevenue       = (clone $bookings)->where('payment_status', 'paid')->sum('amount');
        $totalGuests        = (clone $bookings)->where('payment_status', 'paid')->sum('number_of_guests');

        $totalLikes    = Like::where('activity_id', $id)->count();
        $totalComments = Comment::where('activity_id', $id)->count();

        return response()->json([
            'activity' => [
                'id'      => $activity->id,
                'title'   => $activity->title,
                'is_free' => $activity->is_free,
                'price'   => $activity->price,
            ],
            'engagement' => [
                'likes'    => $totalLikes,
                'comments' => $totalComments,
            ],
            'bookings' => [
                'total'     => $totalBookings,
                'confirmed' => $confirmedBookings,
                'pending'   => $pendingBookings,
                'cancelled' => $cancelledBookings,
            ],
            'revenue' => [
                'total_paid_mad' => number_format($totalRevenue, 2),
                'total_guests'   => $totalGuests,
            ],
        ]);
    }

    /**
     * Specific statistics for a single Business.
     * Only the owner of the business can access this.
     */
    public function businessSpecific($id)
    {
        $user = JWTAuth::parseToken()->authenticate();

        $business = Business::where('id', $id)->where('user_id', $user->id)->first();

        if (!$business) {
            return response()->json(['error' => 'Business not found or you do not own it.'], 404);
        }

        $totalLikes    = Like::where('business_id', $id)->count();
        $totalComments = Comment::where('business_id', $id)->count();

        $recentComments = Comment::where('business_id', $id)
            ->with('user:id,name,image')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'business' => [
                'id'       => $business->id,
                'name'     => $business->name,
                'type'     => $business->type,
                'location' => $business->location,
            ],
            'engagement' => [
                'likes'    => $totalLikes,
                'comments' => $totalComments,
            ],
            'recent_comments' => $recentComments,
        ]);
    }
}
