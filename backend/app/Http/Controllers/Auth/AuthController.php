<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use App\Models\UserProfile;
use App\Models\Business;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            // Common
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'role' => ['required', 'in:user,Organizer'],
            'date_of_birth' => ['required','date','before:-16 years','after:1900-01-01'],
            'city' => ['required', 'string', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // Business
            'business_name' => ['required_if:role,Organizer', 'string'],
            'business_type' => ['required_if:role,Organizer', 'in:Bar,Cafe,Restaurant,Event Space,Store,Other'],
            'business_location' => ['required_if:role,Organizer', 'string'],
            'business_description' => ['required_if:role,Organizer', 'string'],

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
            'date_of_birth' => $request->date_of_birth,
            'city' => $request->city,
            'image' => $imagePath,
            'password' => Hash::make($request->password),
        ]);
        
        if ($request->role === 'Organizer') {
            $user->businesses()->create([
                'name' => $request->business_name,
                'type' => $request->business_type,
                'location' => $request->business_location,
                'description' => $request->business_description,
                'is_approved' => false,
            ]);

            $user->assignRole('Organizer');
        }

        if ($request->role === 'user') {
            UserProfile::create([
                'user_id' => $user->id,
                'interests' => $request->interests ? json_encode($request->interests) : null, 
            ]);
            
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

        $user = auth('api')->user();

        if ($user->isBanned()) {
            auth('api')->logout();

            return response()->json([
                'error' => 'Your account has been banned.',
            ], 403);
        }

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }

    public function getUser(){
        $user = JWTAuth::parseToken()->authenticate();
        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }
        $user->image = asset('storage/' . $user->image);
        if ($user->role === 'Organizer') {
            $data = $user->businesses;
        } else {
            $data = $user->profile;
        }


        return response()->json([
            'user' => $user,
            'data' => $data,
        ]);
    }
}
