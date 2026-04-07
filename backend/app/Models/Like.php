<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_id',
        'business_id',
    ];

    /**
     * Get the user who made the like.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the activity being liked.
     */
    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }

    /**
     * Get the business being liked.
     */
    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
