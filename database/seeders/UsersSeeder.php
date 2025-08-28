<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Enums\Role; use App\Models\User; use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */

    public function run(){
        User::updateOrCreate(['email'=>'admin@demo.sn'],['name'=>'Admin','password'=>Hash::make('password'),'role'=>Role::ADMIN]);
        User::updateOrCreate(['email'=>'emp@demo.sn'],  ['name'=>'Employe','password'=>Hash::make('password'),'role'=>Role::EMPLOYE]);
        User::updateOrCreate(['email'=>'client@demo.sn'],['name'=>'Client','password'=>Hash::make('password'),'role'=>Role::CLIENT]);
    }

}
