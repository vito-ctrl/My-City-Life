<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\UserProfile;

class AuthController extends Controller
{
      public function register(Request $request)
    {
        $request->validate([
            // Common
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'role' => ['required', 'in:user,admin,organizer'],
            'age' => ['required', 'integer', 'min:13', 'max:70'],
            'city' => ['required', 'string', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // Organizer
            'businessName' => ['required_if:role,organizer', 'string'],
            'businessType' => ['required_if:role,organizer', 'in:Bar,Cafe,Restaurant,Event'],
            'businessLocation' => ['required_if:role,organizer', 'string'],
            'businessDescription' => ['required_if:role,organizer', 'string'],

            // User
            'interests' => ['required_if:role,user', 'array'],
        ]);

         $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('users', 'public');
        }

        
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'age' => $request->age,
            'city' => $request->city,
            'image' => $imagePath,
            'password' => Hash::make($request->password),
        ]);

        if ($request->role === 'organizer') {
            Organizer::create([
                'user_id' => $user->id,
                'business_name' => $request->businessName,
                'business_type' => $request->businessType,
                'business_location' => $request->businessLocation,
                'business_description' => $request->businessDescription,
            ]);
        }

        if ($request->role === 'user') {
            UserProfile::create([
                'user_id' => $user->id,
                'interests' => json_encode($request->interests),
            ]);
        }

        $token = Auth::login($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'token' => $token,
            'user' => auth('api')->user()
        ]);
    }
}
