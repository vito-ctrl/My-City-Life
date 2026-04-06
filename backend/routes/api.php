<?php
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Activity\ActivityController;


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

Route::middleware(['auth:api', 'role:business'])->group(function () {
    Route::post('/activities/create', [ActivityController::class, 'create']);
});

Route::get('/activities',      [ActivityController::class, 'index']);
// Route::get('/activities/{id}', [ActivityController::class, 'show']);
