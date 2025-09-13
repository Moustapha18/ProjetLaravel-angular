<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Product;
use App\Support\CacheVersion;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;


class ProductObserver
{

    public function boot(): void
    {
        \Illuminate\Http\Resources\Json\JsonResource::withoutWrapping();

        Category::observe(CategoryObserver::class);
        Product::observe(ProductObserver::class); // si déjà créé
    }

    public function creating(Product $p){
        if(!$p->slug){ $base=Str::slug($p->name); $p->slug=$this->unique($base); }
    }

    private function unique($base){ $slug=$base; $i=1; while(Product::where('slug',$slug)->exists()){ $slug=$base.'-'.$i++; } return $slug; }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $p): void { CacheVersion::bump('products'); }
    public function updated(Product $p): void { CacheVersion::bump('products'); }
    public function deleted(Product $p): void
    {
        // nettoyage image si présent
        if ($p->image_path) {
            Storage::disk('public')->delete($p->image_path);
        }
        CacheVersion::bump('products');
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        //
    }
    public function deleting(Product $product): void
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        //
    }
}
