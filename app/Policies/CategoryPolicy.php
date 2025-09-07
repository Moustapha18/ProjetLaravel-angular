<?php
namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $u): bool { return true; }
    public function view(User $u, Category $c): bool { return true; }
    public function create(User $u): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
    public function update(User $u, Category $c): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
    public function delete(User $u, Category $c): bool { return (string)($u->role?->value ?? $u->role) === 'ADMIN'; }
}
