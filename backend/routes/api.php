<?php
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Activity\ActivityController;
use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Booking\BookingController;



Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::post('/admin/dashboard', function () {
    return response()->json([
        "message" => "user only"
    ]);
})->middleware(['auth:api', 'role:user']);

Route::middleware(['auth:api'])->group(function () {
    Route::post('/activities/create', [ActivityController::class, 'create']);
    Route::put('/activities/{id}',    [ActivityController::class, 'update']); 
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
    
    Route::post('/businesses/create', [BusinessController::class, 'create']);
    Route::put('/businesses/{id}',    [BusinessController::class, 'update']);
    Route::delete('/businesses/{id}', [BusinessController::class, 'destroy']);
});

Route::get('/activities',      [ActivityController::class, 'index']);
Route::get('/activities/{id}', [ActivityController::class, 'show']);

Route::get('/businesses',      [BusinessController::class, 'index']);
Route::get('/businesses/{id}', [BusinessController::class, 'show']);

Route::middleware('auth:api')->group(function () {
    Route::get   ('bookings',                      [BookingController::class, 'index']);
    Route::post  ('bookings',                      [BookingController::class, 'store']);
    Route::get   ('bookings/{id}',                 [BookingController::class, 'show']);
    Route::patch ('bookings/{id}/cancel',          [BookingController::class, 'cancel']);
    Route::patch ('bookings/{id}/confirm',         [BookingController::class, 'confirm']);
    Route::post  ('bookings/{id}/payment-intent',  [BookingController::class, 'createPaymentIntent']);
});

// No auth — Stripe calls this directly
Route::post('stripe/webhook', [BookingController::class, 'webhook']);