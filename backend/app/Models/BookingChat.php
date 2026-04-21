<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Activity;


class BookingChat extends Model
{
    protected $fillable = [
        'type',        // 'social' | 'support'
        'activity_id',
        'slug',
    ];

    protected $guarded = [];

    public function users()
    {
        return $this->belongsToMany(User::class, 'booking_chat_user', 'booking_chat_id', 'user_id');
    }

    public function messages()
    {
        return $this->hasMany(BookingMessage::class);
    }

    public function activity(){
        return $this->belongsTo(Activity::class);
    }

     // ── Scopes ────────────────────────────────────────────────────────────
 
    public function scopeSocial($query)
    {
        return $query->where('type', 'social');
    }
 
    public function scopeSupport($query)
    {
        return $query->where('type', 'support');
    }
}