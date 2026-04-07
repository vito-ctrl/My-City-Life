<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
