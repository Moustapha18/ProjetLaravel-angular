<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@demo.sn'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'ADMIN']
        );

        User::updateOrCreate(
            ['email' => 'emp@demo.sn'],
            ['name' => 'Employe', 'password' => Hash::make('password'), 'role' => 'EMPLOYE']
        );

        User::updateOrCreate(
            ['email' => 'client@demo.sn'],
            ['name' => 'Client', 'password' => Hash::make('password'), 'role' => 'CLIENT']
        );
    }
}
