<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SharedBookingRequest extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * The activity this shared booking request relates to.
     */
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * The user who initiated the request.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * The user who received the request.
     */
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
