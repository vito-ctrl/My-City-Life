<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Like;
use App\Models\Activity;
use App\Models\Business;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LikeController extends Controller
{
    public function toggle(Request $request, $type, $id)
    {
        try {
            $user = auth()->user();

            $model = $this->getModelInstance($type, $id, $user);
            $fkColumn = $this->getForeignKeyColumn($type);

            $like = $model->likes()->where('user_id', $user->id)->first();

            if ($like) {

                $like->delete();
                return response()->json([
                    'message' => 'Unliked successfully',
                    'liked' => false,
                    'likes_count' => $model->likes()->count(),
                ]);
            } else {

                $model->likes()->create([
                    'user_id' => $user->id,
                    $fkColumn => $model->id
                ]);
                return response()->json([
                    'message' => 'Liked successfully',
                    'liked' => true,
                    'likes_count' => $model->likes()->count(),
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

    public function getLikes($type, $id)
    {
        try {
            $user = auth()->user();

            $model = $this->getModelInstance($type, $id, $user);

            $likesCount = $model->likes()->count();

            $isLiked = $model->likes()
                ->where('user_id', $user->id)
                ->exists();

            return response()->json([
                'likes_count' => $likesCount,
                'liked' => $isLiked
            ]);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'error' => ucfirst(trim($type, 's')) . ' not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
