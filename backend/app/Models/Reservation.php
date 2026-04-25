<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\ReservableItem;


class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reservable_item_id',
        'start_time',
        'end_time',
        'status',
        'amount',
        'payment_status',
        'payment_method',
        'stripe_payment_intent_id',
        'stripe_charge_id',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reservableItem()
    {
        return $this->belongsTo(ReservableItem::class);
    }
}
