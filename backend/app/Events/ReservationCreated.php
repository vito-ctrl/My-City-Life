<?php

// namespace App\Events;

// use App\Models\Reservation;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Broadcasting\PrivateChannel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;

// class ReservationCreated implements ShouldBroadcastNow
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public function __construct(public Reservation $reservation) {}

//     public function broadcastOn(): array
//     {
//         // Notify the business owner
//         $ownerId = $this->reservation->reservableItem->business->user_id;
//         return [new PrivateChannel("user.{$ownerId}")];
//     }

//     public function broadcastAs(): string
//     {
//         return 'reservation.created';
//     }

//     public function broadcastWith(): array
//     {
//         $item     = $this->reservation->reservableItem;
//         $business = $item->business;

//         return [
//             'reservation_id' => $this->reservation->id,
//             'business_id'    => $business->id,
//             'business_name'  => $business->name,
//             'item_name'      => $item->name,
//             'guest_name'     => $this->reservation->user->name,
//             'start_time'     => $this->reservation->start_time,
//             'end_time'       => $this->reservation->end_time,
//         ];
//     }
// }
