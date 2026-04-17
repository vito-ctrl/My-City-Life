<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Activity;


class BookingChat extends Model
{
    protected $guarded = [];

    public function users()
    {
        return $this->belongsToMany(User::class, 'booking_chat_user');
    }

    public function messages()
    {
        return $this->hasMany(BookingMessage::class);
    }

    public function activity(){
        return $this->belongsTo(Activity::class);
    }
}