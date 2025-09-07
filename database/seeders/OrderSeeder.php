<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrdersSeeder extends Seeder
{
    public function run(): void
    {
        $client = User::where('email', 'client@demo.sn')->first();
        if (!$client) return;

        $p1 = Product::where('name', 'Baguette tradition')->first();
        $p2 = Product::where('name', 'Croissant beurre')->first();

        if (!$p1 || !$p2) return;

        // Crée une commande simple de démo
        $order = Order::create([
            'user_id'     => $client->id,
            'status'      => 'EN_PREPARATION',
            'paid'        => false,
            'address'     => 'Dakar, SICAP',
            'total_cents' => 0,
        ]);

        $l1 = [
            'order_id'           => $order->id,
            'product_id'         => $p1->id,
            'qty'                => 2,
            'unit_price_cents'   => $p1->price_cents,
            'line_total_cents'   => $p1->price_cents * 2,
        ];
        $l2 = [
            'order_id'           => $order->id,
            'product_id'         => $p2->id,
            'qty'                => 3,
            'unit_price_cents'   => $p2->price_cents,
            'line_total_cents'   => $p2->price_cents * 3,
        ];

        OrderItem::updateOrCreate(
            ['order_id'=>$order->id,'product_id'=>$p1->id],
            $l1
        );
        OrderItem::updateOrCreate(
            ['order_id'=>$order->id,'product_id'=>$p2->id],
            $l2
        );

        $order->update(['total_cents' => $l1['line_total_cents'] + $l2['line_total_cents']]);
    }
}
