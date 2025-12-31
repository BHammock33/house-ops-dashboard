<?php

namespace Tests\Feature;

use App\Models\HomebaseState;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomebaseStateTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_loads_their_own_state(): void
    {
        $user = User::factory()->create();
        HomebaseState::create([
            'user_id' => $user->id,
            'state' => ['note' => 'mine'],
        ]);

        $response = $this->actingAs($user)->getJson('/house-ops/state');

        $response->assertOk()->assertJson([
            'state' => ['note' => 'mine'],
        ]);
    }

    public function test_non_admin_cannot_view_another_users_state(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $response = $this->actingAs($user)->getJson("/house-ops/state?user_id={$otherUser->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_view_and_update_another_users_state(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $otherUser = User::factory()->create();

        HomebaseState::create([
            'user_id' => $otherUser->id,
            'state' => ['note' => 'initial'],
        ]);

        $viewResponse = $this->actingAs($admin)->getJson("/house-ops/state?user_id={$otherUser->id}");

        $viewResponse->assertOk()->assertJson([
            'state' => ['note' => 'initial'],
        ]);

        $updatedState = ['note' => 'updated by admin'];

        $saveResponse = $this->actingAs($admin)->putJson("/house-ops/state?user_id={$otherUser->id}", [
            'state' => $updatedState,
        ]);

        $saveResponse->assertOk()->assertJson(['ok' => true]);

        $this->assertSame(
            $updatedState,
            HomebaseState::where('user_id', $otherUser->id)->first()->state
        );
    }

    public function test_admin_gets_not_found_for_missing_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->getJson('/house-ops/state?user_id=9999');

        $response->assertNotFound();
    }
}
