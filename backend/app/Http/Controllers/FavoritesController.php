<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Models\Activity;
use App\Models\Business;


class FavoritesController extends Controller
{
    public function toggle(Request $request, $type, $id){
        try{
            $user = JWTAuth::parseToken()->authenticate();

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

    public function getActivityFavorites($id){
        try {
            $user = $user = JWTAuth::parseToken()->authenticate();

            $activity = Activity::findOrFail($id);

            $likesCount = $activity->favorites()->count();

            $isLike = $activity->favorites()
                ->where('user_id', $user->id)
                ->exists();
            
            return response()->json([
                'favorites_count' => $likesCount,
                'favorited' => $isLike
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => 'Activity not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
