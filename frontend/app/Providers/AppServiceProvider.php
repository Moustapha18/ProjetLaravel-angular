<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Observers\CategoryObserver;
use App\Observers\ProductObserver;
use App\Observers\PromotionObserver;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Product::observe(ProductObserver::class);
        Category::observe(CategoryObserver::class);
        Promotion::observe(PromotionObserver::class);
    }
}
