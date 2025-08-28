<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PromotionsAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_promotions()
    {
        $admin = User::factory()->create(['role'=>'ADMIN']);
        Sanctum::actingAs($admin);

        $cat = Category::factory()->create();

        // create
        $res = $this->postJson('/api/v1/promotions', [
            'type'=>'PERCENT', 'value'=>10,
            'scope'=>'CATEGORY', 'scope_id'=>$cat->id,
            'starts_at'=>now()->toISOString(), 'ends_at'=>now()->addDay()->toISOString(),
            'is_active'=>true,
        ])->assertCreated();

        $id = $res->json('data.id');

        // index + show
        $this->getJson('/api/v1/promotions')->assertOk();
        $this->getJson("/api/v1/promotions/{$id}")->assertOk();

        // update
        $this->putJson("/api/v1/promotions/{$id}", ['value'=>20])->assertOk()
            ->assertJsonPath('data.value', 20);

        // delete
        $this->deleteJson("/api/v1/promotions/{$id}")->assertOk();

        $this->assertDatabaseMissing('promotions', ['id'=>$id]);
    }
}
