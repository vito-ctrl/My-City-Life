<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Organizer;
use App\Models\Review;

class Activity extends Model
{
    protected $fillable = [
        'organizer_id',
        'title',
        'description',
        'category',
        'location',
        'price',
        'is_free',
        'image',
        'start_date',
        'end_date'
    ];

    public function Organizer(){
        return $this->belongsTo(User::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
