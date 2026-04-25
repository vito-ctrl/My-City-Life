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
    public function index($type, $id)
    {
        try {
            $model = $this->getModelInstance($type, $id);
            
            $comments = $model->comments()
                ->with('user:id,name,image')
                ->latest()
                ->get();

            $comments->transform(fn ($comment) => $this->formatComment($comment));
                
            return response()->json($comments);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request, $type, $id)
    {
        try {
            $request->validate([
                'body' => 'required|string|max:1000'
            ]);

            $user = JWTAuth::parseToken()->authenticate();
            $model = $this->getModelInstance($type, $id, $user);
            $fkColumn = $this->getForeignKeyColumn($type);

            $comment = $model->comments()->create([
                'user_id' => $user->id,
                $fkColumn => $model->id,
                'body' => $request->body
            ]);

            $comment->load('user:id,name,image');
            $comment = $this->formatComment($comment);

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

    public function destroy($type, $id, $commentId)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
            $model = $this->getModelInstance($type, $id, $user);

            $comment = $model->comments()->findOrFail($commentId);

            if ($comment->user_id !== $user->id && !$user->isAdmin()) {
                return response()->json(['error' => 'Unauthorized deletion'], 403);
            }

            $comment->delete();

            return response()->json(['message' => 'Comment deleted successfully']);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Resource not found'], 404);
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
                throw new \Exception("Unsupported commentable type: {$type}");
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

    private function formatComment(Comment $comment): Comment
    {
        if ($comment->relationLoaded('user') && $comment->user) {
            $comment->user->image = $this->formatImageUrl($comment->user->image);
        }

        return $comment;
    }

    private function formatImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $normalizedPath = preg_replace('#^/?storage/#', '', $path);

        return asset('storage/' . ltrim($normalizedPath, '/'));
    }
}
