<?php

namespace App\Services;

use App\Events\UserNotificationCreated;
use App\Models\Notification;
use App\Models\Booking;
use App\Models\Reservation;

class NotificationService
{
    public static function notifyBookingRequest(Booking $booking): void
    {
        $booking->loadMissing(['activity.user', 'user']);

        self::createForUser(
            userId: $booking->activity->user_id,
            type: 'booking_requested',
            content: "{$booking->user->name} wants to book \"{$booking->activity->title}\".",
            data: [
                'action' => 'requested',
                'entity_type' => 'booking',
                'booking_id' => $booking->id,
                'activity_id' => $booking->activity_id,
                'activity_title' => $booking->activity->title,
                'booking_date' => optional($booking->booking_date)->toIso8601String(),
                'number_of_guests' => $booking->number_of_guests,
                'amount' => $booking->amount,
                'payment_status' => $booking->payment_status,
                'status' => $booking->status,
                'requester_id' => $booking->user_id,
                'requester_name' => $booking->user->name,
            ],
        );
    }

    public static function notifyBookingConfirmed(Booking $booking): void
    {
        $booking->loadMissing(['activity.user', 'user']);

        self::createForUser(
            userId: $booking->user_id,
            type: 'booking_confirmed',
            content: "Your booking for \"{$booking->activity->title}\" has been confirmed.",
            data: [
                'action' => 'confirmed',
                'entity_type' => 'booking',
                'booking_id' => $booking->id,
                'activity_id' => $booking->activity_id,
                'activity_title' => $booking->activity->title,
                'booking_date' => optional($booking->booking_date)->toIso8601String(),
                'number_of_guests' => $booking->number_of_guests,
                'amount' => $booking->amount,
                'payment_status' => $booking->payment_status,
                'status' => $booking->status,
                'owner_id' => $booking->activity->user_id,
                'owner_name' => $booking->activity->user->name,
            ],
        );
    }

    public static function notifyBookingCancelled(Booking $booking, int $actorId): void
    {
        $booking->loadMissing(['activity.user', 'user']);

        $ownerId = $booking->activity->user_id;
        $bookerId = $booking->user_id;
        $cancelledByOwner = $actorId === $ownerId;

        self::createForUser(
            userId: $cancelledByOwner ? $bookerId : $ownerId,
            type: 'booking_cancelled',
            content: $cancelledByOwner
                ? "Your booking for \"{$booking->activity->title}\" was cancelled by the activity owner."
                : "{$booking->user->name} cancelled the booking for \"{$booking->activity->title}\".",
            data: [
                'action' => 'cancelled',
                'entity_type' => 'booking',
                'booking_id' => $booking->id,
                'activity_id' => $booking->activity_id,
                'activity_title' => $booking->activity->title,
                'booking_date' => optional($booking->booking_date)->toIso8601String(),
                'number_of_guests' => $booking->number_of_guests,
                'amount' => $booking->amount,
                'payment_status' => $booking->payment_status,
                'status' => $booking->status,
                'actor_id' => $actorId,
                'actor_name' => $cancelledByOwner ? $booking->activity->user->name : $booking->user->name,
                'actor_role' => $cancelledByOwner ? 'owner' : 'guest',
            ],
        );
    }

    public static function notifyReservationRequest(Reservation $reservation): void
    {
        $reservation->loadMissing(['reservableItem.business.user', 'user']);
        $business = $reservation->reservableItem->business;
        $item = $reservation->reservableItem;

        self::createForUser(
            userId: $business->user_id,
            type: 'reservation_requested',
            content: "{$reservation->user->name} wants to reserve \"{$item->name}\" at {$business->name}.",
            data: [
                'action' => 'requested',
                'entity_type' => 'reservation',
                'reservation_id' => $reservation->id,
                'business_id' => $business->id,
                'business_name' => $business->name,
                'item_id' => $item->id,
                'item_name' => $item->name,
                'start_time' => optional($reservation->start_time)->toIso8601String(),
                'end_time' => optional($reservation->end_time)->toIso8601String(),
                'amount' => $reservation->amount,
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'requester_id' => $reservation->user_id,
                'requester_name' => $reservation->user->name,
            ],
        );
    }

    public static function notifyReservationConfirmed(Reservation $reservation): void
    {
        $reservation->loadMissing(['reservableItem.business.user', 'user']);
        $business = $reservation->reservableItem->business;
        $item = $reservation->reservableItem;

        self::createForUser(
            userId: $reservation->user_id,
            type: 'reservation_confirmed',
            content: "Your reservation for \"{$item->name}\" at {$business->name} has been confirmed.",
            data: [
                'action' => 'confirmed',
                'entity_type' => 'reservation',
                'reservation_id' => $reservation->id,
                'business_id' => $business->id,
                'business_name' => $business->name,
                'item_id' => $item->id,
                'item_name' => $item->name,
                'start_time' => optional($reservation->start_time)->toIso8601String(),
                'end_time' => optional($reservation->end_time)->toIso8601String(),
                'amount' => $reservation->amount,
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'owner_id' => $business->user_id,
                'owner_name' => $business->user->name,
            ],
        );
    }

    public static function notifyReservationCancelled(Reservation $reservation, int $actorId): void
    {
        $reservation->loadMissing(['reservableItem.business.user', 'user']);
        $business = $reservation->reservableItem->business;
        $item = $reservation->reservableItem;
        $cancelledByOwner = $actorId === $business->user_id;

        self::createForUser(
            userId: $cancelledByOwner ? $reservation->user_id : $business->user_id,
            type: 'reservation_cancelled',
            content: $cancelledByOwner
                ? "Your reservation for \"{$item->name}\" at {$business->name} was cancelled by the business owner."
                : "{$reservation->user->name} cancelled the reservation for \"{$item->name}\".",
            data: [
                'action' => 'cancelled',
                'entity_type' => 'reservation',
                'reservation_id' => $reservation->id,
                'business_id' => $business->id,
                'business_name' => $business->name,
                'item_id' => $item->id,
                'item_name' => $item->name,
                'start_time' => optional($reservation->start_time)->toIso8601String(),
                'end_time' => optional($reservation->end_time)->toIso8601String(),
                'amount' => $reservation->amount,
                'payment_status' => $reservation->payment_status,
                'status' => $reservation->status,
                'actor_id' => $actorId,
                'actor_name' => $cancelledByOwner ? $business->user->name : $reservation->user->name,
                'actor_role' => $cancelledByOwner ? 'owner' : 'guest',
            ],
        );
    }

    private static function createForUser(int $userId, string $type, string $content, array $data = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'content' => $content,
            'data' => $data,
            'is_read' => false,
        ]);

        broadcast(new UserNotificationCreated($notification));

        return $notification;
    }
}
