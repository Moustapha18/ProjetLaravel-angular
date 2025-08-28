<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['me','logout']);
    }
    /**
     * @OA\Get(
     *   path="/api/v1/me",
     *   tags={"Auth"},
     *   summary="Retourne l’utilisateur courant",
     *   security={{"sanctum":{}}},
     *   @OA\Response(
     *     response=200,
     *     description="OK",
     *     @OA\JsonContent(ref="#/components/schemas/User")
     *   ),
     *   @OA\Response(response=401, description="Unauthenticated")
     * )
     */

    public function me(Request $r)
    {
        return response()->json(['data'=>$r->user()]);
    }

    public function logout(Request $r)
    {
        // Bearer token style (Sanctum tokens)
        $r->user()->currentAccessToken()?->delete();
        return response()->json(['message'=>'logged out']);
    }
}
