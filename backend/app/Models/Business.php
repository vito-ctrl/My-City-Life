<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Favorites;
use App\Models\Booking;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'location',
        'description',
        'image',
        'opening_hours',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function isLikedBy($user)
    {
        if (!$user) return false;
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function favorites(){
        return $this->hasMany(Favorites::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function reservableItems()
    {
        return $this->hasMany(ReservableItem::class);
    }
}
