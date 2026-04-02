<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    // use HasFactory;

    protected $fillable = [
        'user_id',
        'favorites',
        'interests',
        'joined_groups',
    ];

    protected $casts = [
        'favorites' => 'array',
        'interests' => 'array',
        'joined_groups' => 'array',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }
}
