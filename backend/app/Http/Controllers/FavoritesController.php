<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Database\Eloquent\ModelNotFoundException;


class FavoritesController extends Controller
{
    public function toggle(Request $request, $type, $id){
        try{
            $user = JWTAuth::parseToken()->authenticate();

            $model = $this->getModelInstance($type, $id);
            $fkColumn = $this->getForeignKeyColumn($type);

            $favorite = $model->favorites()->where('user_id', $user->id)->first();
            return $favorite;

        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => ucfirst(trim($type, 's')) . ' not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
