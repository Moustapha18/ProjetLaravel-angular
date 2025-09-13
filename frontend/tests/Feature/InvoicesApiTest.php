<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InvoicesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_generate_and_get_invoice_pdf()
    {
        Storage::fake('public'); // évite d’écrire réellement
        $cat = Category::factory()->create();
        $p   = Product::factory()->create(['category_id'=>$cat->id,'price_cents'=>700,'stock'=>10]);

        $client = User::factory()->create(['role'=>'CLIENT']);
        $order = $client->orders()->create(['total_cents'=>1400,'status'=>'EN_PREPARATION','paid'=>true,'address'=>'Dakar']);
        $order->items()->create(['product_id'=>$p->id,'qty'=>2,'unit_price_cents'=>700,'line_total_cents'=>1400]);

        Sanctum::actingAs($client);

        $this->get("/api/v1/orders/{$order->id}/invoice")
            ->assertOk(); // Stream PDF (content-type application/pdf via DomPDF)
    }
}
