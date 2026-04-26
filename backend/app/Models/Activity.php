<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Review;
use App\Models\Favorites;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'location',
        'price',
        'image',
        'start_date',
        'end_date',
        'duration',
        'requirements',
        'max_capacity',
        'is_approved',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'is_approved' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function user() {
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

    public function favorites() {
        return $this->hasMany(Favorites::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function scopePubliclyVisible($query)
    {
        return $query
            ->where('is_approved', true)
            ->whereHas('user', fn ($userQuery) => $userQuery->whereNull('banned_at'));
    }

    public function isVisibleTo(?User $viewer): bool
    {
        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();

        if ($this->is_approved && $owner && ! $owner->isBanned()) {
            return true;
        }

        if (! $viewer) {
            return false;
        }

        return $viewer->isAdmin() || $viewer->id === $this->user_id;
    }

    public function isBookable(): bool
    {
        $owner = $this->relationLoaded('user') ? $this->user : $this->user()->first();

        return $this->is_approved && $owner && ! $owner->isBanned();
    }
}
