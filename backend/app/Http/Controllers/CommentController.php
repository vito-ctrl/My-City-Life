<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\Comment;
use App\Models\Activity;
use App\Models\Business;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CommentController extends Controller
{
    /**
     * Get comments for a specific model instance.
     */
    public function index($type, $id)
    {
        try {
            $model = $this->getModelInstance($type, $id);
            
            $comments = $model->comments()
                ->with('user:id,name,image')
                ->latest()
                ->get();
                
            return response()->json($comments);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a new comment.
     */
    public function store(Request $request, $type, $id)
    {
        try {
            $request->validate([
                'body' => 'required|string|max:1000'
            ]);

            $user = JWTAuth::parseToken()->authenticate();
            $model = $this->getModelInstance($type, $id);
            $fkColumn = $this->getForeignKeyColumn($type);

            $comment = $model->comments()->create([
                'user_id' => $user->id,
                $fkColumn => $model->id,
                'body' => $request->body
            ]);

            // Load user data to return
            $comment->load('user:id,name,image');

            return response()->json([
                'message' => 'Comment posted successfully',
                'data' => $comment
            ], 201);

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a comment.
     */
    public function destroy($type, $id, $commentId)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $model = $this->getModelInstance($type, $id);

            $comment = $model->comments()->findOrFail($commentId);

            if ($comment->user_id !== $user->id && !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized deletion'], 403);
            }

            $comment->delete();

            return response()->json(['message' => 'Comment deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper to resolve standard plural resource types to literal Eloquent models.
     */
    private function getModelInstance($type, $id)
    {
        switch (strtolower($type)) {
            case 'activities':
                return Activity::findOrFail($id);
            case 'businesses':
                return Business::findOrFail($id);
            default:
                throw new \Exception("Unsupported commentable type: {$type}");
        }
    }
}
