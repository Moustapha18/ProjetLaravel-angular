<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrdersApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_create_order_and_fetch_it()
    {
        $cat = Category::factory()->create();
        $p1  = Product::factory()->create(['category_id'=>$cat->id,'price_cents'=>400,'stock'=>50]);
        $p2  = Product::factory()->create(['category_id'=>$cat->id,'price_cents'=>600,'stock'=>50]);

        $client = User::factory()->create(['role'=>'CLIENT']);
        Sanctum::actingAs($client);

        $res = $this->postJson('/api/v1/orders', [
            'address'=>'Dakar',
            'items'=>[
                ['product_id'=>$p1->id,'qty'=>2],
                ['product_id'=>$p2->id,'qty'=>1],
            ],
        ])->assertOk();

        $orderId = $res->json('data.id');

        $this->getJson('/api/v1/orders/mine')
            ->assertOk()
            ->assertJsonFragment(['id'=>$orderId]);

        $this->getJson("/api/v1/orders/{$orderId}")
            ->assertOk()
            ->assertJsonPath('data.id', $orderId);
    }

    public function test_employee_can_update_status_and_add_delivery_update()
    {
        $cat = Category::factory()->create();
        $p1  = Product::factory()->create(['category_id'=>$cat->id,'price_cents'=>500,'stock'=>50]);

        $client = User::factory()->create(['role'=>'CLIENT']);
        $order = $client->orders()->create(['total_cents'=>1000,'status'=>'EN_PREPARATION','paid'=>false,'address'=>'Dakar']);
        $order->items()->create(['product_id'=>$p1->id,'qty'=>2,'unit_price_cents'=>500,'line_total_cents'=>1000]);

        $emp = User::factory()->create(['role'=>'EMPLOYE']);
        Sanctum::actingAs($emp);

        $this->putJson("/api/v1/orders/{$order->id}/status", ['status'=>'PRETE'])
            ->assertOk()
            ->assertJsonPath('data.status', 'PRETE');

        $this->postJson("/api/v1/orders/{$order->id}/delivery-updates", ['status'=>'EN ROUTE','note'=>'Sorti du dépôt'])
            ->assertOk()
            ->assertJsonFragment(['status'=>'EN ROUTE']);
    }
}
