<?php
namespace App\Observers;

use App\Models\Category;
use App\Support\CacheVersion;
use Illuminate\Support\Str;

class CategoryObserver
{
    public function creating(Category $c): void
    {
        if (!$c->slug) $c->slug = $this->unique(Str::slug($c->name));
    }
    public function created(Category $c): void
    {
        CacheVersion::bump('categories');
        CacheVersion::bump('products'); // lister/filtrer par catégorie
    }

    public function updated(Category $c): void
    {
        CacheVersion::bump('categories');
        CacheVersion::bump('products');
    }

    public function deleted(Category $c): void
    {
        CacheVersion::bump('categories');
        CacheVersion::bump('products');
    }

    public function updating(Category $c): void
    {
        if ($c->isDirty('name')) {
            $c->slug = $this->unique(Str::slug($c->name), $c->id);
        }
    }

    private function unique(string $base, ?int $ignoreId = null): string
    {
        $slug = $base; $i = 1;
        $query = Category::query();
        if ($ignoreId) $query->where('id','<>',$ignoreId);
        while ($query->where('slug',$slug)->exists()) $slug = $base.'-'.$i++;
        return $slug;
    }
}
