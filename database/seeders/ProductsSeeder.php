<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        // Si tu as des factories Product/Category, tu peux utiliser Product::factory()
        // Ici on crée quelques produits “fixes”
        $catalog = [
            'Pains' => [
                ['name' => 'Baguette tradition',  'price_cents' => 500,  'stock' => 50],
                ['name' => 'Pain complet',        'price_cents' => 700,  'stock' => 40],
            ],
            'Viennoiseries' => [
                ['name' => 'Croissant beurre',    'price_cents' => 400,  'stock' => 60],
                ['name' => 'Pain au chocolat',    'price_cents' => 450,  'stock' => 60],
            ],
            'Pâtisseries' => [
                ['name' => 'Éclair chocolat',     'price_cents' => 1000, 'stock' => 20],
                ['name' => 'Tarte aux pommes',    'price_cents' => 1200, 'stock' => 15],
            ],
        ];

        foreach ($catalog as $catName => $items) {
            $category = Category::where('name', $catName)->first();
            if (!$category) continue;

            foreach ($items as $p) {
                Product::updateOrCreate(
                    ['slug' => Str::slug($p['name'])],
                    [
                        'category_id'      => $category->id,
                        'name'             => $p['name'],
                        'price_cents'      => $p['price_cents'],
                        'stock'            => $p['stock'],
                        'image_path'       => null,
                        'description'      => null,
                    ]
                );
            }
        }
    }
}
