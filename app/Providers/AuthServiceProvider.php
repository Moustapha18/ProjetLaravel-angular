<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\User;
use App\Policies\OrderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        \App\Models\Order::class => \App\Policies\OrderPolicy::class,
        Order::class => OrderPolicy::class,   // <= AJOUT
    ];


    public function boot(): void
    {
        $this->registerPolicies();
        // (optionnel) en Laravel >=9, registerPolicies() est appelé par la base,
        // mais on peut l’appeler ici si besoin:
        // $this->registerPolicies();

        Gate::define('manage-catalog', fn(User $u) =>
        in_array(strtoupper((string)$u->role), ['ADMIN','EMPLOYE'], true)
        );

        // ⚠️ Nécessaire pour /api/v1/orders (groupe can:manage-orders)
        Gate::define('manage-orders', fn(User $u) =>
        in_array(strtoupper((string)$u->role), ['ADMIN','EMPLOYE'], true)
        );

        Gate::define('admin', fn(User $u) =>
            strtoupper((string)$u->role) === 'ADMIN'
        );

        RateLimiter::for('admin', function (Request $request) {
            $key = $request->user()?->id ? 'u:'.$request->user()->id : 'ip:'.$request->ip();
            return Limit::perMinute(600)->by($key);
        });
    }
}
