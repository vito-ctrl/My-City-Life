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
// use App\Model\Organizer;
use App\Model\Booking;
use App\Model\UserProfile;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'role', 'age', 'city', 'image', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements JWTSubject
{
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

    public function organizer()
    {
        return $this->hasOne(Organizer::class);
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
        return $this->role === 'organizer';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

}
