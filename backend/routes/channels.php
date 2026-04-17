<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.{slug}', function ($user, $slug) {
    $chat = \App\Models\BookingChat::where('slug', $slug)->first();
    return $chat && $chat->users()->where('user_id', $user->id)->exists();
});