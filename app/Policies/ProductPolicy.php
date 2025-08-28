<?php
namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $u): bool { return true; }
    public function view(User $u, Product $p): bool { return true; }
    public function create(User $u): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
    public function update(User $u, Product $p): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
    public function delete(User $u, Product $p): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
}
