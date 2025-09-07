<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use App\Models\User;
use Throwable;

class AuthController extends Controller
{
    // POST /api/v1/register (PUBLIC)
    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'name'                  => ['required','string','max:255'],
                'email'                 => ['required','email','unique:users,email'],
                'password'              => ['required', 'string', Password::min(6), 'confirmed'], // => nécessite password_confirmation
            ]);

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'USER', // adapte si tu as des rôles
            ]);

            $token = $user->createToken('api')->plainTextToken;

            return response()->json([
                'token' => $token,
                'data'  => [
                    'id'    => $user->id,
                    'name'  => $user->name,
                    'email' => $user->email,
                    'role'  => $user->role,
                    'must_change_password' => $user->must_change_password,
                ],
            ], 201);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Erreur serveur',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
    // app/Http/Controllers/Api/V1/AuthController.php (ajoute cette méthode)
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['nullable','string'],   // optionnel si tu veux l’exiger
            'password' => ['required','string','min:8','confirmed'], // attend password + password_confirmation
        ]);

        // Optionnel: vérifier current_password si fourni
        if (!empty($data['current_password']) && !\Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $user->password = \Hash::make($data['password']);
        $user->must_change_password = false;
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour']);
    }


    // POST /api/v1/login (PUBLIC)
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        /** @var User|null $user */
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            // Mauvais identifiants => 401
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        // crée un token Sanctum
        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'data'  => [
                'id'                    => $user->id,
                'name'                  => $user->name,
                'email'                 => $user->email,
                'role'                  => $user->role,
                'must_change_password'  => (bool)$user->must_change_password,
            ],
        ]);
    }

    // POST /api/v1/me/password (AUTH: Bearer <token>)
    public function updatePassword(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required','string'],
            'new_password'     => ['required','string','min:6','max:100','different:current_password'],
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel invalide'], 422);
        }

        $user->password = Hash::make($data['new_password']);
        $user->must_change_password = false;
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour']);
    }

    // GET /api/v1/me (AUTH)
    public function me(Request $request)
    {
        $u = $request->user();
        return response()->json([
            'data' => [
                'id'                   => $u->id,
                'name'                 => $u->name,
                'email'                => $u->email,
                'role'                 => $u->role,
                'must_change_password' => (bool)$u->must_change_password,
            ]
        ]);
    }

    // POST /api/v1/logout (AUTH)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message'=>'OK']);
    }
    // GET /api/v1/me (AUTH)
//    public function me(Request $request)
//    {
//        $u = $request->user();
//
//        return response()->json([
//            'data' => [
//                'id'    => $u->id,
//                'name'  => $u->name,
//                'email' => $u->email,
//                'role'  => $u->role,
//            ]
//        ]);
//    }
//
//    // POST /api/v1/logout (AUTH)
//    public function logout(Request $request)
//    {
//        // Révoque uniquement le token courant
//        $request->user()->currentAccessToken()->delete();
//
//        return response()->json(['message' => 'Déconnecté.']);
//    }
}
