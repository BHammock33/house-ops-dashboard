<?php

namespace App\Http\Controllers;

use App\Models\HomebaseState;
use App\Models\User;
use Illuminate\Http\Request;

class HomebaseStateController extends Controller
{
    public function show(Request $request)
    {
        $targetUser = $this->resolveTargetUser($request);
        $row = HomebaseState::where('user_id', $targetUser->id)->first();

        return response()->json([
            'state' => $row?->state, // null means "use DEFAULT_STATE on the frontend"
        ]);
    }

    public function update(Request $request)
    {
        // Accept any valid JSON object/array. Keep it permissive since your frontend owns the schema.
        $state = $request->input('state');

        if (!is_array($state)) {
            return response()->json(['error' => 'Invalid state payload.'], 422);
        }

        $targetUser = $this->resolveTargetUser($request);

        HomebaseState::updateOrCreate(
            ['user_id' => $targetUser->id],
            ['state' => $state]
        );

        return response()->json(['ok' => true]);
    }

    private function resolveTargetUser(Request $request): User
    {
        $authUser = $request->user();
        $requestedId = $request->query('user_id');

        if ($requestedId === null || $requestedId === '' || (int) $requestedId === $authUser->id) {
            return $authUser;
        }

        if (! $authUser->is_admin) {
            abort(403, 'Only admins can view other users.');
        }

        $targetUser = User::find($request->integer('user_id'));

        if (! $targetUser) {
            abort(404, 'User not found.');
        }

        return $targetUser;
    }
}
