<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;   // <= important
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;    // <= important

    protected $fillable = [
        'name', 'email', 'password', 'role','must_change_password',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
       // 'must_change_password' => 'bool',
        'must_change_password' => 'boolean',
      //  'role' => \App\Enums\Role::class,   // <= AJOUT

    ];

}
