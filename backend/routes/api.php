<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Activity\ActivityController;
use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Statistic\StatisticController;
use App\Http\Controllers\FavoritesController;

// ── Auth (Public) ─────────────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/auth/{provider}/redirect', [SocialLoginController::class, 'redirect']);
Route::get('/auth/{provider}/callback', [SocialLoginController::class, 'callback']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
Route::post('/reset-password',  [PasswordResetController::class, 'resetPassword']);


// ── Public Reads ──────────────────────────────────────────────────────────────
Route::get('/activities',      [ActivityController::class, 'index']);
Route::get('/activities/user/all',   [ActivityController::class, 'getUserActivities']);
Route::get('/activities/{id}', [ActivityController::class, 'show']);

Route::get('/businesses',      [BusinessController::class, 'index']);
Route::get('/businesses/{id}', [BusinessController::class, 'show']);

Route::get('/comments/{type}/{id}', [CommentController::class, 'index']);


// ── Protected Routes (Auth required) ─────────────────────────────────────────
Route::middleware('auth:api')->group(function () {
    
    Route::get ('/profile', [AuthController::class, 'getUser']);

    // Activities CRUD
    Route::post  ('/activities/create', [ActivityController::class, 'create']);
    Route::put   ('/activities/{id}',   [ActivityController::class, 'update']);
    Route::delete('/activities/{id}',   [ActivityController::class, 'destroy']);

    // Businesses CRUD
    Route::post  ('/businesses/create', [BusinessController::class, 'create']);
    Route::put   ('/businesses/{id}',   [BusinessController::class, 'update']);
    Route::delete('/businesses/{id}',   [BusinessController::class, 'destroy']);

    // Likes (Toggle Like/Unlike)
    Route::get('/like/activities/{id}', [LikeController::class, 'getActivityLikes']);
    Route::post('/like/{type}/{id}', [LikeController::class, 'toggle']);

    // Likes (Toggle Favorite/Unfavorite)
    Route::get('/favorite/activities/{id}', [FavoritesController::class, 'getActivityFavorites']);
    Route::post('/favorite/{type}/{id}', [FavoritesController::class, 'toggle']);

    // Comments
    Route::post  ('/comments/{type}/{id}',              [CommentController::class, 'store']);
    Route::delete('/comments/{type}/{id}/{commentId}',  [CommentController::class, 'destroy']);

    // Bookings
    Route::get   ('bookings',                     [BookingController::class, 'index']);
    Route::post  ('bookings',                     [BookingController::class, 'store']);
    Route::get   ('bookings/{id}',                [BookingController::class, 'show']);
    Route::patch ('bookings/{id}/cancel',         [BookingController::class, 'cancel']);
    Route::patch ('bookings/{id}/confirm',        [BookingController::class, 'confirm']);
    Route::post  ('bookings/{id}/payment-intent', [BookingController::class, 'createPaymentIntent']);

    // Statistics (Per-User Analytics)
    Route::get('/statistics/general',           [StatisticController::class, 'general']);
    Route::get('/statistics/activities/{id}',   [StatisticController::class, 'activitySpecific']);
    Route::get('/statistics/businesses/{id}',   [StatisticController::class, 'businessSpecific']);
});


// ── Stripe Webhook (No auth — Stripe calls this directly) ─────────────────────
Route::post('stripe/webhook', [BookingController::class, 'webhook']);