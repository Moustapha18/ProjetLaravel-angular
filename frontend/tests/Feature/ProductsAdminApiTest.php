<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductsAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_products()
    {
        $admin = User::factory()->create(['role'=>'ADMIN']);
        Sanctum::actingAs($admin);

        $cat = Category::factory()->create();

        // create
        $res = $this->postJson('/api/v1/products', [
            'category_id'=>$cat->id,
            'name'=>'Baguette',
            'price_cents'=>500,
            'stock'=>20,
            'description'=>'Farine, eau, levure',
        ])->assertOk();

        $id = $res->json('data.id');

        // update
        $this->putJson("/api/v1/products/{$id}", ['price_cents'=>650])
            ->assertOk()
            ->assertJsonPath('data.price_cents', 650);

        // delete
        $this->deleteJson("/api/v1/products/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('products', ['id'=>$id]);
    }
}
