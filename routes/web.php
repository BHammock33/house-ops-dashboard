<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomebaseStateController;

Route::get('/', function () {
    return redirect('/house-ops');
});

Route::get('/house-ops', function () {
    return view('house-ops');
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
