<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function pay(User $user, Order $order): bool
    {
        return $user->id === $order->user_id && !$order->paid;
    }

    // Optionnel, si tu l’utilises ailleurs
    public function manageAny(User $user): bool
    {
        return in_array($user->role, [Role::ADMIN, Role::EMPLOYE], true);
    }

//    public function view(User $user, Order $order): bool
//    {
//        return $user->id === $order->user_id || in_array($user->role, [Role::ADMIN, Role::EMPLOYE], true);
//    }
//
//    public function manage(User $user, Order $order): bool
//    {
//        return in_array($user->role, [Role::ADMIN, Role::EMPLOYE], true);
//    }

    // pour autoriser l’index (manageAny)

    public function manage(User $user, Order $order): bool
    {
        return in_array(strtoupper((string)$user->role), ['ADMIN','EMPLOYE'], true);
    }

    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id
            || in_array(strtoupper((string)$user->role), ['ADMIN','EMPLOYE'], true);
    }


}
