<?php
namespace App\Services;

use App\Models\Booking;
use App\Models\SharedBookingRequest;

class SocialMatchService
{
    public function findMatchesForBooking(Booking $newBooking)
    {
        // 1. Only look for matches if the user opted-in
        if (!$newBooking->is_open_to_group) return null;

        // 2. Find other 'open' bookings for the same activity
        $matches = Booking::where('activity_id', $newBooking->activity_id)
            ->where('user_id', '!=', $newBooking->user_id)
            ->where('is_open_to_group', true)
            ->where('status', 'confirmed')
            ->get();

        foreach ($matches as $match) {
            // 3. Create a 'Pending' request for the UI to show
            SharedBookingRequest::firstOrCreate([
                'activity_id' => $newBooking->activity_id,
                'sender_id'   => $newBooking->user_id,
                'receiver_id' => $match->user_id,
                'status'      => 'pending'
            ]);
            
            // TODO: Dispatch a Notification (Pusher/Reverb) to $match->user_id
        }
    }
}