<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomebaseStateController;
use App\Models\User;

Route::get('/', function () {
    return redirect('/house-ops');
});

Route::get('/house-ops', function (Request $request) {
    $authUser = $request->user();

    $users = $authUser->is_admin
        ? User::select('id', 'name', 'email')->orderBy('name')->get()
        : User::whereKey($authUser->id)->get();

    $requestedUserId = (int) $request->query('user_id');
    $viewUser = $users->firstWhere('id', $requestedUserId) ?? $authUser;

    return view('house-ops', [
        'authUser' => $authUser,
        'viewUser' => $viewUser,
        'users' => $users,
    ]);
})->middleware('auth')->name('house-ops');

Route::get('/ping', fn () => 'pong');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::middleware('auth')->group(function () {
    Route::get('/house-ops/state', [HomebaseStateController::class, 'show']);
    Route::put('/house-ops/state', [HomebaseStateController::class, 'update']);
});
require __DIR__.'/auth.php';
