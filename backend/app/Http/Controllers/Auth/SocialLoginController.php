<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;

class SocialLoginController extends Controller
{
     // Step 3a: Redirect to provider
    public function redirect($provider)
    {
        // return dd($provider);
        return Socialite::driver($provider)->stateless()->redirect();
    }

    // Step 3b: Handle callback
    public function callback($provider)
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'password' => bcrypt(Str::random(16)),
                 'role' => 'user',
                'age' => 18,
                'city' => 'unknown',
            ]
        );

        // Generate token (for API, e.g., Laravel Sanctum or JWT)
        $token = JWTAuth::fromUser($user);
        
        return redirect("http://localhost:5173/oauth-success?token=$token");
    }
}
