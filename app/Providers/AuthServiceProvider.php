<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Enums\Role;
class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */


    /**
     * Register any authentication / authorization services.
     */public function boot(): void
{
    Gate::define('admin', fn($user) => $user->role === Role::ADMIN);
    Gate::define('manage-orders', fn($user) => in_array($user->role, [Role::ADMIN, Role::EMPLOYE]));
}
    protected $policies = [
        \App\Models\Order::class     => \App\Policies\OrderPolicy::class,
        \App\Models\Product::class   => \App\Policies\ProductPolicy::class,
        \App\Models\Category::class  => \App\Policies\CategoryPolicy::class,
        \App\Models\Promotion::class => \App\Policies\PromotionPolicy::class,
    ];

}
