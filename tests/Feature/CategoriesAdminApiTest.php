<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoriesAdminApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_crud_categories()
    {
        $admin = User::factory()->create(['role'=>'ADMIN']);
        Sanctum::actingAs($admin);

        // create
        $res = $this->postJson('/api/v1/categories', ['name'=>'Viennoiseries'])->assertCreated();
        $id  = $res->json('data.id');

        // update
        $this->putJson("/api/v1/categories/{$id}", ['name'=>'Viennoiseries Fraîches'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Viennoiseries Fraîches');

        // delete
        $this->deleteJson("/api/v1/categories/{$id}")
            ->assertOk();

        $this->assertDatabaseMissing('categories', ['id'=>$id]);
    }

    public function test_non_admin_cannot_crud_categories()
    {
        $user = User::factory()->create(['role'=>'CLIENT']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/categories', ['name'=>'X'])->assertForbidden();
    }
}
