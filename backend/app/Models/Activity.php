<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use App\Models\Review;
use App\Models\Favorites;

class Activity extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'location',
        'price',
        'is_free',
        'image',
        'start_date',
        'end_date',
        'duration',
        'requirements',
        'max_capacity',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
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

    public function favorites() {
        return $this->hasMany(Favorites::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
