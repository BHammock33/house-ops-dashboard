<?php

namespace App\Http\Controllers;

use App\Models\HomebaseState;
use Illuminate\Http\Request;

class HomebaseStateController extends Controller
{
    public function show(Request $request)
    {
        $row = HomebaseState::where('user_id', $request->user()->id)->first();

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

        HomebaseState::updateOrCreate(
            ['user_id' => $request->user()->id],
            ['state' => $state]
        );

        return response()->json(['ok' => true]);
    }
}
