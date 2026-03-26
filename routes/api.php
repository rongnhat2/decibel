<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/auth/nonce', 'Customer\WalletController@nonce')->name('customer.nonce');
Route::post('/auth/verify', 'Customer\WalletController@verify')->name('customer.verify');
// Routes cần auth
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $r) {
        $user = $r->user();
        $wallet = $user->wallets()->first();
        return response()->json([
            'user_id' => $user->id,
            'address' => $wallet ? $wallet->address : null,
        ]);
    });
});
