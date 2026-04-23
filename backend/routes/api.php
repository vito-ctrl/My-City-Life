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
use App\Http\Controllers\Organizer\OrganizerController;
use App\Http\Controllers\Social\BookingChatController;
use App\Http\Controllers\Social\SocialMatchController;
use App\Http\Controllers\Social\SupportChatController;
use App\Http\Controllers\Business\BusinesReservationController;

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

Route::get('/businesses/all/',      [BusinessController::class, 'getAllOwnerBusinesses']);
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

    // Likes
    Route::post('/like/{type}/{id}',        [LikeController::class, 'toggle']);
    Route::get('/like/{type}/{id}',         [LikeController::class, 'getLikes']);

    // Favorites
    Route::post('/favorite/{type}/{id}',    [FavoritesController::class, 'toggle']);
    Route::get('/favorite/{type}/{id}',     [FavoritesController::class, 'getFavorites']);
    Route::get('/favorites/{type}/all',     [FavoritesController::class, 'getUserFavorites']);

    // Comments
    Route::post  ('/comments/{type}/{id}',              [CommentController::class, 'store']);
    Route::delete('/comments/{type}/{id}/{commentId}',  [CommentController::class, 'destroy']);
    
    // Bookings

    Route::apiResource('bookings', BookingController::class)->only(['index', 'store', 'show']);

    Route::prefix('bookings')->group(function () {
        Route::patch('{id}/cancel', [BookingController::class, 'cancel']);
        Route::patch('{id}/confirm', [BookingController::class, 'confirm']);
        Route::post('{id}/payment-intent', [BookingController::class, 'createPaymentIntent']);
    });

    // statistics
    Route::prefix('statistics')->group(function () {
        Route::get('general', [StatisticController::class, 'general']);
        Route::get('activities/{id}', [StatisticController::class, 'activitySpecific']);
        Route::get('businesses/{id}', [StatisticController::class, 'businessSpecific']);
    });

    // reservation 
    Route::post('/reservation',   [BusinesReservationController::class, 'StoreReservation']);
    Route::get('/reservationItem/{id}',   [BusinesReservationController::class, 'GetReservationItems']);
    
    // ── Organizer Dashboard ───────────────────────────────────────────────────
    Route::prefix('organizer')->group(function () {
        // Summary stats + recent bookings
        Route::get('/dashboard',                    [OrganizerController::class, 'dashboard']);
        // All incoming bookings (?status=pending|confirmed|cancelled)
        Route::get('/bookings',                     [OrganizerController::class, 'bookings']);
        // Bookings for one specific activity
        Route::get('/activities/{id}/bookings',     [OrganizerController::class, 'activityBookings']);
        // organizer making reservations 
        Route::post('/reservation/{id}',     [BusinesReservationController::class, 'StoreReservationItem']);
    
        Route::put('/business/{businessId}/items/{itemId}', [BusinesReservationController::class, 'UpdateReservationItem']);  
        
        Route::get('/reservation/{business_id}',   [BusinesReservationController::class, 'GetBusinessReservations']);

        Route::put('/reservation/{id}',   [BusinesReservationController::class, 'updateStatus']);

    });

    // Notifications
    Route::get('/notifications',              [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/read',   [App\Http\Controllers\NotificationController::class, 'markAsRead']);

    Route::prefix('social')->group(function () {
        // ── Social Match (user ↔ user) ────────────────────────────────────────
        Route::get('/pending',          [SocialMatchController::class, 'pending']);
        Route::post('/vote',            [SocialMatchController::class, 'vote']);
    
        // ── Chat Rooms (shared: works for both social + support) ──────────────
        Route::get('/chats',                        [BookingChatController::class, 'index']);
        Route::get('/chats/{slug}',                 [BookingChatController::class, 'show']);
        Route::post('/chats/{slug}/message',        [BookingChatController::class, 'sendMessage']);
    
        // ── Support Chat (owner ↔ user) ───────────────────────────────────────
        Route::post('/support/chats',          [SupportChatController::class, 'openChat']);
        Route::get('/support/chats',           [SupportChatController::class, 'index']);
    });
});

// ── Stripe Webhook (No auth — Stripe calls this directly) ─────────────────────
Route::post('stripe/webhook', [BookingController::class, 'webhook']);