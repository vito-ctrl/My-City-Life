<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\Business;
use App\Models\User;
use Illuminate\Http\Request;

class AdminModerationController extends Controller
{
    public function activities()
    {
        $activities = Activity::with('user')
            ->latest()
            ->paginate(15);

        return response()->json($activities);
    }

    public function pendingActivities()
    {
        $activities = Activity::with('user')
            ->where('is_approved', false)
            ->latest()
            ->paginate(15);

        return response()->json($activities);
    }

    public function approveActivity(Activity $activity, Request $request)
    {
        $activity->update([
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Activity approved successfully.',
            'data' => $activity->fresh(['user']),
        ]);
    }

    public function disapproveActivity(Activity $activity)
    {
        $activity->update([
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return response()->json([
            'message' => 'Activity disapproved successfully.',
            'data' => $activity->fresh(['user']),
        ]);
    }

    public function businesses()
    {
        $businesses = Business::with('user')
            ->latest()
            ->paginate(15);

        return response()->json($businesses);
    }

    public function pendingBusinesses()
    {
        $businesses = Business::with('user')
            ->where('is_approved', false)
            ->latest()
            ->paginate(15);

        return response()->json($businesses);
    }

    public function approveBusiness(Business $business, Request $request)
    {
        $business->update([
            'is_approved' => true,
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Business approved successfully.',
            'data' => $business->fresh(['user']),
        ]);
    }

    public function disapproveBusiness(Business $business)
    {
        $business->update([
            'is_approved' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);

        return response()->json([
            'message' => 'Business disapproved successfully.',
            'data' => $business->fresh(['user']),
        ]);
    }

    public function users()
    {
        $users = User::query()
            ->latest()
            ->paginate(15);

        return response()->json($users);
    }

    public function banUser(User $user, Request $request)
    {
        if ($request->user()->is($user)) {
            return response()->json([
                'error' => 'Admins cannot ban themselves.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $user->update([
            'banned_at' => now(),
            'banned_reason' => $validated['reason'] ?? null,
            'banned_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'User banned successfully.',
            'data' => $user->fresh(),
        ]);
    }

    public function unbanUser(User $user)
    {
        $user->update([
            'banned_at' => null,
            'banned_reason' => null,
            'banned_by' => null,
        ]);

        return response()->json([
            'message' => 'User unbanned successfully.',
            'data' => $user->fresh(),
        ]);
    }
}
