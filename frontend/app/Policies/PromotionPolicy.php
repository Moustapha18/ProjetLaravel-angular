<?php

namespace App\Policies;

use App\Models\Promotion;
use App\Models\User;

class PromotionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array((string)($user->role?->value ?? $user->role), ['EMPLOYE','ADMIN'], true);
    }

    public function view(User $user, Promotion $promotion): bool
    {
        return in_array((string)($user->role?->value ?? $user->role), ['EMPLOYE','ADMIN'], true);
    }

    public function create(User $user): bool
    {
        return (string)($user->role?->value ?? $user->role) === 'ADMIN';
    }

    public function update(User $user, Promotion $promotion): bool
    {
        return (string)($user->role?->value ?? $user->role) === 'ADMIN';
    }

    public function delete(User $user, Promotion $promotion): bool
    {
        return (string)($user->role?->value ?? $user->role) === 'ADMIN';
    }
}
