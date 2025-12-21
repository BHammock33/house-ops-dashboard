<?php

namespace App\Http\Controllers;

use App\Models\HouseOpsState;
use Illuminate\Http\Request;

class HouseOpsStateController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $row = HouseOpsState::where('user_id', $user->id)->first();

        // If no state saved yet, return null and the frontend can fall back to defaults.
        return response()->json($row?->state);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        // Grab full JSON body as an array
        $state = $request->json()->all();

        if (!is_array($state)) {
            return response()->json(['error' => 'Invalid JSON body'], 422);
        }

        HouseOpsState::updateOrCreate(
            ['user_id' => $user->id],
            ['state' => $state]
        );

        return response()->json(['ok' => true]);
    }
}