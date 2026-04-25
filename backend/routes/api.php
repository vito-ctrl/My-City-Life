<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Admin\AdminModerationController;
use App\Http\Controllers\Activity\ActivityController;
use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Booking\BookingController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Statistic\StatisticController;
use App\Http\Controllers\FavoritesController;
use App\Http\Controllers\Organizer\OrganizerController;
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
Route::middleware(['auth:api', 'not_banned'])->group(function () {
    
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
        Route::post('{id}/payment-sync', [BookingController::class, 'syncPaymentStatus']);
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
    Route::get('/reservations',   [BusinesReservationController::class, 'indexReservation']);
    Route::post('/reservations/{id}/payment-intent', [BusinesReservationController::class, 'createPaymentIntent']);
    Route::post('/reservations/{id}/payment-sync', [BusinesReservationController::class, 'syncPaymentStatus']);
    
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

    // Admin moderation
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/activities', [AdminModerationController::class, 'activities']);
        Route::get('/activities/pending', [AdminModerationController::class, 'pendingActivities']);
        Route::patch('/activities/{activity}/approve', [AdminModerationController::class, 'approveActivity']);
        Route::patch('/activities/{activity}/disapprove', [AdminModerationController::class, 'disapproveActivity']);

        Route::get('/businesses', [AdminModerationController::class, 'businesses']);
        Route::get('/businesses/pending', [AdminModerationController::class, 'pendingBusinesses']);
        Route::patch('/businesses/{business}/approve', [AdminModerationController::class, 'approveBusiness']);
        Route::patch('/businesses/{business}/disapprove', [AdminModerationController::class, 'disapproveBusiness']);

        Route::get('/users', [AdminModerationController::class, 'users']);
        Route::patch('/users/{user}/ban', [AdminModerationController::class, 'banUser']);
        Route::patch('/users/{user}/unban', [AdminModerationController::class, 'unbanUser']);
    });

});

// ── Stripe Webhook (No auth — Stripe calls this directly) ─────────────────────
Route::post('stripe/webhook', [BookingController::class, 'webhook'])
    ->withoutMiddleware(['auth:api', \Illuminate\Auth\Middleware\Authenticate::class]);
