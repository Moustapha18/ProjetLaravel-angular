<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_endpoints_work()
    {
        $cat = Category::factory()->create(['name'=>'Pains']);
        Product::factory()->count(3)->create(['category_id'=>$cat->id]);

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonStructure(['data'=>[['id','name','slug']]]);

        $this->getJson('/api/v1/products?sort=id')
            ->assertOk()
            ->assertJsonStructure([ 'data'=>[['id','name','slug','price_cents','stock','category']], 'links','meta' ]);
    }
}
