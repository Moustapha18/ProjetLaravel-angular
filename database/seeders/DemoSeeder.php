<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // Utilisateurs
        $admin = User::updateOrCreate(
            ['email' => 'admin@demo.sn'],
            ['name' => 'Admin', 'password' => Hash::make('password'), 'role' => 'ADMIN']
        );
        $emp = User::updateOrCreate(
            ['email' => 'emp@demo.sn'],
            ['name' => 'Employe', 'password' => Hash::make('password'), 'role' => 'EMPLOYE']
        );
        $client = User::updateOrCreate(
            ['email' => 'client@demo.sn'],
            ['name' => 'Client', 'password' => Hash::make('password'), 'role' => 'CLIENT']
        );

        // Catalogue
        $cats = Category::factory()->count(3)->create([
            // rien de spécial, slug auto via factory
        ]);

        // Produits
        $cats->each(function ($cat) {
            Product::factory()->count(8)->create([
                'category_id' => $cat->id,
                'stock' => 20, // stock suffisant pour jouer
            ]);
        });

        // Promotions : -10% sur la 1ère catégorie, -0.5 fixe sur la 2e
        $catIds = $cats->pluck('id')->values();

        if ($catIds->count() >= 1) {
            Promotion::updateOrCreate(
                ['scope' => 'CATEGORY', 'scope_id' => $catIds[0], 'type' => 'PERCENT'],
                ['value' => 10, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(30), 'is_active' => true]
            );
        }
        if ($catIds->count() >= 2) {
            Promotion::updateOrCreate(
                ['scope' => 'CATEGORY', 'scope_id' => $catIds[1], 'type' => 'FIXED'],
                ['value' => 0.5, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDays(30), 'is_active' => true]
            );
        }

        // Commande d’exemple pour le client
        $product = Product::inRandomOrder()->first();
        if ($product) {
            $order = Order::create([
                'user_id' => $client->id,
                'status' => 'EN_PREPARATION',
                'paid' => false,
                'address' => 'Dakar, SICAP',
                'total_cents' => 0,
            ]);

            $qty = 2;
            $lineTotal = $product->price_cents * $qty;

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'qty' => $qty,
                'unit_price_cents' => $product->price_cents,
                'line_total_cents' => $lineTotal,
            ]);

            $order->update(['total_cents' => $lineTotal]);
        }
    }
}
