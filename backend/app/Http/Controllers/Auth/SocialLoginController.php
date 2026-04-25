<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class SocialLoginController extends Controller
{
    public function redirect($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider)
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'password' => bcrypt(Str::random(16)),
                'role' => 'user',
                'date_of_birth' => now()->subYears(18)->toDateString(),
                'city' => 'unknown',
            ]
        );

        if ($user->isBanned()) {
            return redirect('http://localhost:5173/oauth-success?error=banned');
        }

        if (! $user->hasRole('user')) {
            $user->assignRole('user');
        }

        if (! $user->profile && $user->role === 'user') {
            UserProfile::create([
                'user_id' => $user->id,
                'interests' => null,
            ]);
        }

        $token = JWTAuth::fromUser($user);
        
        return redirect("http://localhost:5173/oauth-success?token=$token");
    }
}
