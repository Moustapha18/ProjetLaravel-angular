<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewEmployeeMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UsersController extends Controller
{
    public function __construct()
    {
        // ADMIN uniquement
        $this->middleware(['auth:sanctum','can:admin']);
    }

    // GET /api/v1/admin/users?q=&role=&page=&per_page=
    public function index(Request $request)
    {
        $q        = trim((string) $request->get('q', ''));
        $role     = strtoupper((string) $request->get('role', ''));
        $perPage  = (int) $request->integer('per_page', 12);

        $query = User::query()
            ->select(['id','name','email','role','created_at'])
            ->orderByDesc('id');

        if ($q !== '') {
            $driver = DB::getDriverName(); // pgsql | mysql | sqlite
            if ($driver === 'pgsql') {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name',  'ilike', "%{$q}%")
                        ->orWhere('email','ilike', "%{$q}%");
                });
            } else {
                $qLower = mb_strtolower($q);
                $query->where(function ($sub) use ($qLower) {
                    $sub->whereRaw('LOWER(name)  LIKE ?', ["%{$qLower}%"])
                        ->orWhereRaw('LOWER(email) LIKE ?', ["%{$qLower}%"]);
                });
            }
        }

        if (in_array($role, ['ADMIN','EMPLOYE'], true)) {
            $query->where('role', $role);
        }

        $p = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => $p->items(),
            'meta' => [
                'current_page' => $p->currentPage(),
                'last_page'    => $p->lastPage(),
                'total'        => $p->total(),
            ],
        ]);
    }

    // GET /api/v1/admin/users/{user}
    public function show(User $user)
    {
        return response()->json(['data' => $user->only('id','name','email','role','created_at')]);
    }

    // POST /api/v1/admin/users { name, email, role: ADMIN|EMPLOYE }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required','string','max:255'],
            'email' => ['required','string','email','max:255','unique:users,email'],
            'role'  => ['required', Rule::in(['ADMIN','EMPLOYE','EMPLOYEE'])],
        ]);

// normaliser vers le seul format stocké en DB
        $validated['role'] = strtoupper($validated['role']) === 'EMPLOYEE' ? 'EMPLOYE' : strtoupper($validated['role']);


        $plain = method_exists(Str::class, 'password') ? Str::password(12) : Str::random(12);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'role'     => $validated['role'],
            'password' => Hash::make($plain),
            'must_change_password' => true,
        ]);

        // Envoi email (si ton Mailable existe)
        try {
            if (class_exists(NewEmployeeMail::class)) {
                Mail::to($user->email)->send(new NewEmployeeMail($user, $plain));
            }
        } catch (\Throwable $e) {
            // On ne bloque pas la création si l'email échoue
        }

        return response()->json([
            'message' => 'Utilisateur créé.',
            'data'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }

    // PUT /api/v1/admin/users/{user} { name?, email?, role? }
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'  => ['nullable','string','max:255'],
            'email' => ['nullable','string','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'role'  => ['nullable', Rule::in(['ADMIN','EMPLOYE'])],
        ]);

        $user->update(array_filter($validated, fn($v) => !is_null($v)));

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'data'    => $user->only('id','name','email','role','created_at'),
        ]);
    }

    // POST /api/v1/admin/users/{user}/reset-password
    public function resetPassword(User $user)
    {
        $plain = method_exists(Str::class, 'password') ? Str::password(12) : Str::random(12);
        $user->update([
            'password' => Hash::make($plain),
            'must_change_password' => true,
        ]);

        try {
            if (class_exists(NewEmployeeMail::class)) {
                Mail::to($user->email)->send(new NewEmployeeMail($user, $plain));
            }
        } catch (\Throwable $e) {}

        return response()->json(['message' => 'Mot de passe réinitialisé.']);
    }

    // DELETE /api/v1/admin/users/{user}
    public function destroy(User $user)
    {
        if ($user->role === 'ADMIN') {
            $admins = User::where('role','ADMIN')->count();
            if ($admins <= 1) {
                return response()->json(['message' => 'Impossible de supprimer le dernier administrateur.'], 422);
            }
        }

        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
