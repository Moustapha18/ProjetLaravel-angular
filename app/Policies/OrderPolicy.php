<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{

    public function pay(\App\Models\User $user, \App\Models\Order $order): bool
    {
        return $user->id === $order->user_id && !$order->paid;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id || in_array($user->role, [Role::ADMIN, Role::EMPLOYE]);
    }

    public function manage(User $user, Order $order): bool
    {
        return in_array($user->role, [Role::ADMIN, Role::EMPLOYE]);
    }
}
