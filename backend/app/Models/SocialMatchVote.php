<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialMatchVote extends Model
{
    protected $fillable = [
        'activity_id',
        'user_one_id',
        'user_two_id',
        'user_one_status',
        'user_two_status',
        'chat_id',
    ];

    // ── Relationships ────────────────────────────────────────────────────────

    public function activity()
    {
        return $this->belongsTo(\App\Models\Activity::class);
    }

    public function userOne()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_one_id');
    }

    public function userTwo()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_two_id');
    }

    public function chat()
    {
        return $this->belongsTo(BookingChat::class, 'chat_id');
    }

    // ── Helper methods called by SocialMatchController ───────────────────────

    /**
     * Returns 1 if the given user is user_one, 2 if user_two.
     * Not used directly anymore (controller inlines the check),
     * kept here for any future use.
     */
    public function slotFor(int $userId): int
    {
        return $this->user_one_id === $userId ? 1 : 2;
    }

    /**
     * True when both users have accepted the match.
     */
    public function bothAccepted(): bool
    {
        return $this->user_one_status === 'accepted'
            && $this->user_two_status === 'accepted';
    }
}