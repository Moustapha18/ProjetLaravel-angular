<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;   // ← important
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens;   // ← important pour withAccessToken() de Sanctum
    use HasFactory;
    use Notifiable;

    // Si tu as un cast de rôle (enum), garde-le, sinon pas obligatoire.
    // protected $casts = ['role' => \App\Enums\Role::class];

    protected $fillable = [
        'name','email','password','role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // ← relation attendue par les tests (OrdersApiTest / InvoicesApiTest)
    public function orders()
    {
        return $this->hasMany(\App\Models\Order::class);
    }

}
