<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Like;
use App\Models\Activity;
use App\Models\Business;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LikeController extends Controller
{
    /**
     * Toggle a like on a specific model instance.
     * 
     * Expects parameters: {type} (activities or businesses), {id}
     */
    public function toggle(Request $request, $type, $id)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();

            $model = $this->getModelInstance($type, $id);
            $fkColumn = $this->getForeignKeyColumn($type);

            $like = $model->likes()->where('user_id', $user->id)->first();

            if ($like) {

                $like->delete();
                return response()->json([
                    'message' => 'Unliked successfully',
                    'liked' => false
                ]);
            } else {

                $model->likes()->create([
                    'user_id' => $user->id,
                    $fkColumn => $model->id
                ]);
                return response()->json([
                    'message' => 'Liked successfully',
                    'liked' => true
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
}
