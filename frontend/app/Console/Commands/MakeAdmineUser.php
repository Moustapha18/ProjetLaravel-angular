<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class MakeAdminUser extends Command
{
    /**
     * Nom et signature de la commande (arguments attendus).
     */
    protected $signature = 'make:admin
                            {email : Email de l\'administrateur}
                            {password : Mot de passe en clair}
                            {name=Admin : Nom complet (optionnel)}';

    /**
     * Description de la commande.
     */
    protected $description = 'Créer un utilisateur ADMIN avec email + mot de passe spécifiés';

    /**
     * Exécution de la commande.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $name = $this->argument('name');

        if (User::where('email', $email)->exists()) {
            $this->error("Un utilisateur avec l'email {$email} existe déjà.");
            return Command::FAILURE;
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'ADMIN',
        ]);

        $this->info("✅ Admin créé avec succès : {$user->email}");
        return Command::SUCCESS;
    }
}
