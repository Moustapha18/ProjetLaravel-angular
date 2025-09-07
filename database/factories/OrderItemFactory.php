<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    public function definition(): array
    {
        $product = Product::inRandomOrder()->first() ?? Product::factory()->create();
        $qty = $this->faker->numberBetween(1, 3);
        $unit = $product->price_cents;
        return [
            'order_id' => Order::factory(),
            'product_id' => $product->id,
            'qty' => $qty,
            'unit_price_cents' => $unit,
            'line_total_cents' => $unit * $qty,
        ];
    }
}
