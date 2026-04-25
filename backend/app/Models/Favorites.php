<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Activity;

class Favorites extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'activity_id',
        'business_id',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function activitie() {
        return $this->belongsTo(Activity::class);
    }
}
