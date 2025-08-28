<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_requires_auth_and_returns_user()
    {
        $this->getJson('/api/v1/me')->assertStatus(401);

        $u = User::factory()->create();
        Sanctum::actingAs($u);

        $this->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('data.id', $u->id);
    }
}
