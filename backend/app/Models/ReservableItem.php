<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Business;
use App\Models\Reservation;


class ReservableItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'name',
        'capacity',
        'price',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}