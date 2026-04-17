<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'activity_id',
        'booking_date',
        'number_of_guests',
        'status',
        'booked_at',
        'cancelled_at',
        'amount',
        'payment_status',
        'payment_method',
        'stripe_payment_intent_id',
        'stripe_charge_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'booking_date' => 'datetime',
        'booked_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the user who made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the activity being booked.
     */
    public function activity(): BelongsTo
    {
        return $this->belongsTo(Activity::class);
    }

    public function scopeSocialReady($query) {
        return $query->where('is_open_to_group', true)->where('status', 'confirmed');
    }
}