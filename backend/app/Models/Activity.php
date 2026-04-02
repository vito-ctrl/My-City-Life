<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Organizer;
use App\Models\Review;

class Activity extends Model
{
    public function Organizer(){
        return $this->belongsTo(User::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
