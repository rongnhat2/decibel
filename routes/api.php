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
Route::post('/auth/verify', 'Customer\WalletController@verify')->name('customer.verify'); // routes/api.php
Route::post('/auth/verify-code', 'Customer\WalletController@verifyCode');
// routes/api.php
Route::post('/admin/generate-codes', 'Customer\WalletController@generateCode');
// Routes cần auth

// Route::middleware('auth:api')->group(function () {
//     Route::get('/me', function () {
//         $user = auth()->user();
//         $wallet = $user->wallets()->first();
//         return response()->json([
//             'user_id' => $user->id,
//             'address' => $wallet ? $wallet->address : null,
//         ]);
//     });
// });
