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
        'is_approved',
        'approved_at',
        'approved_by',
        'banned_at',
        'banned_reason',
        'banned_by',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'approved_at' => 'datetime',
            'banned_at' => 'datetime',
        ];
    }

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

    public function scopePubliclyVisible($query)
    {
        return $query
            ->where('is_approved', true)
            ->whereNull('banned_at')
            ->whereHas('user', fn ($userQuery) => $userQuery->whereNull('banned_at'));
    }

    public function isVisibleTo(?User $viewer): bool
    {
        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();

        if ($this->isOperational() && $owner) {
            return true;
        }

        if (! $viewer) {
            return false;
        }

        return $viewer->isAdmin() || $viewer->id === $this->user_id;
    }

    public function isBanned(): bool
    {
        return ! is_null($this->banned_at);
    }

    public function isOperational(): bool
    {
        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();

        return $this->is_approved
            && ! $this->isBanned()
            && $owner
            && ! $owner->isBanned();
    }
}
