<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Activity;


class Organizer extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'business_location',
        'business_description'
    ];

    public function activities() {
        return $this->HasMany(Activity::class);
    }
}
