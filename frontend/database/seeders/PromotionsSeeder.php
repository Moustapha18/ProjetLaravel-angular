<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Database\Seeder;

class PromotionsSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::where('name', 'Pains')->first();
        if ($cat) {
            Promotion::updateOrCreate(
                ['scope' => 'CATEGORY', 'scope_id' => $cat->id, 'type' => 'PERCENT'],
                ['value' => 10, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(30), 'is_active' => true]
            );
        }

        $prod = Product::where('name', 'Croissant beurre')->first();
        if ($prod) {
            Promotion::updateOrCreate(
                ['scope' => 'PRODUCT', 'scope_id' => $prod->id, 'type' => 'FIXED'],
                ['value' => 0.5, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(30), 'is_active' => true]
            );
        }
    }
}
