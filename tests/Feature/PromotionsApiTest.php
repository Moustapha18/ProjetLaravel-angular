<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PromotionsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Important : s'assure que la DB est migrée à chaque test
        $this->artisan('migrate', ['--force' => true]);
    }

    private function actingAsAdmin(): User
    {
        $admin = User::factory()->create([
            'role' => 'ADMIN',
            'email' => 'admin-test@demo.sn',
        ]);
        Sanctum::actingAs($admin);
        return $admin;
    }

    private function actingAsClient(): User
    {
        $client = User::factory()->create([
            'role' => 'CLIENT',
            'email' => 'client-test@demo.sn',
        ]);
        Sanctum::actingAs($client);
        return $client;
    }

    public function test_admin_can_list_promotions(): void
    {
        $this->actingAsAdmin();

        $cat = Category::factory()->create();
        Promotion::factory()->create(['scope' => 'CATEGORY', 'scope_id' => $cat->id, 'type' => 'PERCENT', 'value' => 10]);

        $res = $this->getJson('/api/v1/promotions');
        $res->assertStatus(200)->assertJsonStructure(['data']);
        $this->assertGreaterThanOrEqual(1, count($res->json('data')));
    }

    public function test_client_cannot_access_promotions_routes(): void
    {
        $this->actingAsClient();

        $res = $this->getJson('/api/v1/promotions');
        // Les routes sont protégées par middleware can:admin → 403
        $res->assertStatus(403);
    }

    public function test_admin_can_create_promotion_for_category(): void
    {
        $this->actingAsAdmin();

        $cat = Category::factory()->create();

        $payload = [
            'type'      => 'PERCENT',
            'value'     => 15,
            'scope'     => 'CATEGORY',
            'scope_id'  => $cat->id,
            'starts_at' => null,
            'ends_at'   => null,
            'is_active' => true,
        ];

        $res = $this->postJson('/api/v1/promotions', $payload);
        $res->assertStatus(200)
            ->assertJsonPath('data.type', 'PERCENT')
            ->assertJsonPath('data.value', 15.0)
            ->assertJsonPath('data.scope', 'CATEGORY')
            ->assertJsonPath('data.scope_id', $cat->id);

        $this->assertDatabaseHas('promotions', [
            'scope' => 'CATEGORY',
            'scope_id' => $cat->id,
            'type' => 'PERCENT',
            'value' => 15,
        ]);
    }

    public function test_admin_can_create_promotion_for_product(): void
    {
        $this->actingAsAdmin();

        $product = Product::factory()->create();

        $payload = [
            'type'      => 'FIXED',
            'value'     => 0.5,
            'scope'     => 'PRODUCT',
            'scope_id'  => $product->id,
            'is_active' => true,
        ];

        $res = $this->postJson('/api/v1/promotions', $payload);
        $res->assertStatus(200)
            ->assertJsonPath('data.type', 'FIXED')
            ->assertJsonPath('data.value', 0.5)
            ->assertJsonPath('data.scope', 'PRODUCT')
            ->assertJsonPath('data.scope_id', $product->id);
    }

    public function test_validation_rejects_percent_over_100(): void
    {
        $this->actingAsAdmin();

        $cat = Category::factory()->create();

        $payload = [
            'type'      => 'PERCENT',
            'value'     => 150,
            'scope'     => 'CATEGORY',
            'scope_id'  => $cat->id,
        ];

        $res = $this->postJson('/api/v1/promotions', $payload);
        $res->assertStatus(422)->assertJsonStructure(['message', 'errors' => ['value']]);
    }

    public function test_admin_can_update_and_delete_promotion(): void
    {
        $this->actingAsAdmin();

        $cat = Category::factory()->create();
        $promo = Promotion::factory()->create([
            'scope' => 'CATEGORY',
            'scope_id' => $cat->id,
            'type' => 'PERCENT',
            'value' => 10,
            'is_active' => true,
        ]);

        // Update
        $resU = $this->putJson('/api/v1/promotions/'.$promo->id, [
            'value' => 20,
        ]);
        $resU->assertStatus(200)->assertJsonPath('data.value', 20.0);
        $this->assertDatabaseHas('promotions', ['id' => $promo->id, 'value' => 20]);

        // Delete
        $resD = $this->deleteJson('/api/v1/promotions/'.$promo->id);
        $resD->assertStatus(200);
        $this->assertDatabaseMissing('promotions', ['id' => $promo->id]);
    }
}
