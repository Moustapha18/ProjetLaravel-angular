<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    protected function configureRateLimiting(): void
    {
        // Clé de limitation (utilisateur si connecté, sinon IP)
        $by = function (Request $request) {
            return $request->user()?->id ? 'u:'.$request->user()->id : 'ip:'.$request->ip();
        };

        // Limiter global du groupe "api" (ton cas actuel)
        RateLimiter::for('api', function (Request $request) use ($by) {
            return app()->environment('local')
                ? Limit::perMinute(1000)->by($by($request))  // large en dev
                : Limit::perMinute(120)->by($by($request));  // ajuste pour prod
        });

        // 👉 Limiter pour les routes "throttle:admin"
        RateLimiter::for('admin', function (Request $request) use ($by) {
            return app()->environment('local')
                ? Limit::perMinute(1000)->by($by($request))   // large en dev
                : Limit::perMinute(300)->by($by($request));   // prod raisonnable
        });

        // 👉 Limiter pour les routes "throttle:orders"
        RateLimiter::for('orders', function (Request $request) use ($by) {
            // Les endpoints /orders et /orders/quote peuvent être appelés souvent en front
            return app()->environment('local')
                ? Limit::perMinute(600)->by($by($request))    // très large en dev
                : Limit::perMinute(60)->by($by($request));    // prod: 60/min
        });
    }
}
