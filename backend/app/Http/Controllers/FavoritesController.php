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

            $model = $this->getModelInstance($type, $id);
            $fkColumn = $this->getForeignKeyColumn($type);

            $favorite = $model->favorites()->where('user_id', $user->id)->first();

            if ($favorite) {

                $favorite->delete();
                return response()->json([
                    'message' => 'Unfavorite successfully',
                    'favorite' => false
                ]);
            } else {

                $model->favorites()->create([
                    'user_id' => $user->id,
                    $fkColumn => $model->id
                ]);
                return response()->json([
                    'message' => 'favorite successfully',
                    'favorite' => true
                ]);
            }

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => ucfirst(trim($type, 's')) . ' not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function getModelInstance($type, $id)
    {
        switch (strtolower($type)) {
            case 'activities':
                return Activity::findOrFail($id);
            case 'businesses':
                return Business::findOrFail($id);
            default:
                throw new \Exception("Unsupported likable type.");
        }
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
            $model = $this->getModelInstance($type, $id);

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
                })->get();
            } elseif (strtolower($type) === 'businesses') {
                $favorites = Business::whereHas('favorites', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->get();
            } else {
                throw new \Exception("Unsupported favorite type.");
            }

            return response()->json($favorites);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
