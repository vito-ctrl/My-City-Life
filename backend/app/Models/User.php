<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Models\Activity;
use App\Models\Business;
use App\Models\Booking;
use App\Models\UserProfile;
use Spatie\Permission\Traits\HasRoles;
use App\Models\Favorites;

class User extends Authenticatable implements JWTSubject
{
    protected $fillable = [
        'name', 'email', 'role', 'date_of_birth', 'city', 'image', 'password'
    ];

    protected $hidden = [
        'password',
        'remember_token'
    ];

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasRoles;
    
    protected $guard_name = 'api'; 

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function bookings() {
        return $this->hasMany(Booking::class);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    // role shecking
    public function isOrganizer()
    {
        return $this->role === 'Organizer';
    }

    public function isGuideLocal()
    {
        return $this->role === 'Guide Local';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function favorites(){
        return $this->hasMany(Favorites::class);
    }

    public function sharedRequests()
    {
        // Requests this user has sent or received
        return $this->hasMany(SharedBookingRequest::class, 'sender_id')
                    ->orWhere('receiver_id', $this->id);
    }

}
