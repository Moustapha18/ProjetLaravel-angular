<?php

namespace App\Observers;

use App\Models\Promotion;
use App\Support\CacheVersion;

class PromotionObserver
{
    public function created(Promotion $p): void { CacheVersion::bump('products'); }
    public function updated(Promotion $p): void { CacheVersion::bump('products'); }
    public function deleted(Promotion $p): void { CacheVersion::bump('products'); }
}
