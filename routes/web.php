<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'Customer\DisplayController@index')
    ->name('customer.index')
    ->middleware(['auth.wallet', 'verified.code']); // ← cần cả 2

Route::get('/verify-code', 'Customer\DisplayController@verifyCode')
    ->name('customer.verify-code')
    ->middleware(['auth.wallet', 'unverified.code']); // đã verify thì về index

Route::get('/login', 'Customer\DisplayController@login')
    ->name('customer.login');

Route::get('/onboarding', 'Customer\DisplayController@onboarding')
    ->name('customer.onboarding')
    ->middleware('auth.wallet');