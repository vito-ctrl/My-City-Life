<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Activity;
use App\Models\Business;


class FavoritesController extends Controller
{
    public function toggle(Request $request, $type, $id){
        try{
            $user = auth()->user();

            $model = $this->getModelInstance($type, $id, $user);
            $fkColumn = $this->getForeignKeyColumn($type);

            $favorite = $model->favorites()->where('user_id', $user->id)->first();

            if ($favorite) {

                $favorite->delete();
                return response()->json([
                    'message' => 'Unfavorite successfully',
                    'favorite' => false,
                    'favorites_count' => $model->favorites()->count(),
                ]);
            } else {

                $model->favorites()->create([
                    'user_id' => $user->id,
                    $fkColumn => $model->id
                ]);
                return response()->json([
                    'message' => 'favorite successfully',
                    'favorite' => true,
                    'favorites_count' => $model->favorites()->count(),
                ]);
            }

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => ucfirst(trim($type, 's')) . ' not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getModelInstance($type, $id, $viewer = null)
    {
        switch (strtolower($type)) {
            case 'activities':
                $model = Activity::with('user')->findOrFail($id);
                break;
            case 'businesses':
                $model = Business::with('user')->findOrFail($id);
                break;
            default:
                throw new \Exception("Unsupported likable type.");
        }

        if (! $model->isVisibleTo($viewer)) {
            throw new ModelNotFoundException();
        }

        return $model;
    }

    private function getForeignKeyColumn($type)
    {
        switch (strtolower($type)) {
            case 'activities':
                return 'activity_id';
            case 'businesses':
                return 'business_id';
            default:
                throw new \Exception("Unsupported commentable type: {$type}");
        }
    }

    public function getFavorites($type, $id)
    {
        try {
            $user = auth()->user();
            $model = $this->getModelInstance($type, $id, $user);

            $favoritesCount = $model->favorites()->count();

            $isFavorited = $model->favorites()
                ->where('user_id', $user->id)
                ->exists();
            
            return response()->json([
                'favorites_count' => $favoritesCount,
                'favorited' => $isFavorited
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => ucfirst(trim($type, 's')) . ' not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUserFavorites($type)
    {
        try {
            $user = auth()->user();

            if (strtolower($type) === 'activities') {
                $favorites = Activity::whereHas('favorites', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                    ->publiclyVisible()
                    ->withCount(['likes', 'favorites'])
                    ->withExists([
                        'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    ])
                    ->get();
            } elseif (strtolower($type) === 'businesses') {
                $favorites = Business::whereHas('favorites', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                    ->publiclyVisible()
                    ->withCount(['likes', 'favorites'])
                    ->withExists([
                        'likes as liked' => fn ($likesQuery) => $likesQuery->where('user_id', $user->id),
                    ])
                    ->get();
            } else {
                throw new \Exception("Unsupported favorite type.");
            }

            $favorites->transform(fn ($favorite) => $this->appendMeta($favorite, $user));

            return response()->json($favorites);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function appendMeta($model, $user)
    {
        $images = json_decode($model->image, true) ?? [];
        $model->image_urls = array_map(function ($path) {
            if (!$path) {
                return null;
            }

            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            $normalizedPath = preg_replace('#^/?storage/#', '', $path);

            return asset('storage/' . ltrim($normalizedPath, '/'));
        }, $images);

        $model->image_urls = array_values(array_filter($model->image_urls));
        $model->favorited = true;
        $model->liked = (bool) ($model->liked ?? false);

        return $model;
    }
}
