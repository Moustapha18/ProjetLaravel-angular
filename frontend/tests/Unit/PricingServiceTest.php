<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_quote_applies_best_promo_and_totals()
    {
        $cat = Category::factory()->create();
        $p1 = Product::factory()->create(['category_id'=>$cat->id, 'price_cents'=>1000]);
        $p2 = Product::factory()->create(['category_id'=>$cat->id, 'price_cents'=>500]);

        // -10% sur la catégorie + -300 fixe sur p1 → le meilleur s’applique par ligne
        Promotion::create([
            'type'=>'PERCENT','value'=>10,
            'scope'=>'CATEGORY','scope_id'=>$cat->id,
            'starts_at'=>now()->subDay(),'ends_at'=>now()->addDay(),'is_active'=>true,
        ]);
        Promotion::create([
            'type'=>'FIXED','value'=>3.00, // 300 cts
            'scope'=>'PRODUCT','scope_id'=>$p1->id,
            'starts_at'=>now()->subDay(),'ends_at'=>now()->addDay(),'is_active'=>true,
        ]);

        $svc = app(PricingService::class);
        $quote = $svc->quote([
            ['product_id'=>$p1->id, 'qty'=>2], // 2 * 1000 = 2000 ; -10% = 200 ; -300 fixe -> meilleur = 300 (mais par ligne on a 2*1000 => ligne à 2000 -> on applique best 300)
            ['product_id'=>$p2->id, 'qty'=>3], // 3 * 500 = 1500 ; -10% = 150
        ]);

        $this->assertEquals(3500, $quote['subtotal']); // 2000 + 1500
        $this->assertEquals(450,  $quote['discount']); // 300 + 150
        $this->assertEquals(3050, $quote['total']);    // 3500 - 450
        $this->assertCount(2, $quote['lines']);
    }
}
