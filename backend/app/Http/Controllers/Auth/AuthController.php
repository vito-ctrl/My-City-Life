<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use App\Models\Organizer;

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
            'business_name' => ['required_if:role,organizer', 'string'],
            'business_type' => ['required_if:role,organizer', 'in:Bar,Cafe,Restaurant,Event'],
            'business_location' => ['required_if:role,organizer', 'string'],
            'business_description' => ['required_if:role,organizer', 'string'],

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
            $user->organizer()->create([
                'business_name' => $request->business_name,
                'business_type' => $request->business_type,
                'business_location' => $request->business_location,
                'business_description' => $request->business_description,
            ]);

            $user->assignRole('business');
        }

        if ($request->role === 'user') {
            UserProfile::create([
                'user_id' => $user->id,
                'interests' => json_encode($request->interests),
            ]);
            
            $user->assignRole($request->role);
        }

        if ($request->role === 'admin') {
            $user->assignRole($request->role);
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
