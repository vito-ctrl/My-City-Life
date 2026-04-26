<?php

// namespace App\Events;

// use App\Models\Booking;
// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Broadcasting\PrivateChannel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;

// class BookingCreated implements ShouldBroadcastNow
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public function __construct(public Booking $booking) {}

//     public function broadcastOn(): array
//     {
//         // Notify the activity owner
//         $ownerId = $this->booking->activity->user_id;
//         return [new PrivateChannel("user.{$ownerId}")];
//     }

//     public function broadcastAs(): string
//     {
//         return 'booking.created';
//     }

//     public function broadcastWith(): array
//     {
//         return [
//             'booking_id'    => $this->booking->id,
//             'activity_id'   => $this->booking->activity_id,
//             'activity_title'=> $this->booking->activity->title,
//             'booker_name'   => $this->booking->user->name,
//             'guests'        => $this->booking->number_of_guests,
//             'booking_date'  => $this->booking->booking_date,
//         ];
//     }
// }
