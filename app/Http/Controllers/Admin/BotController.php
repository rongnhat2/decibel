<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class BotController extends Controller
{
    // Bot gọi endpoint này để lấy credentials
    public function getCredentials(Request $request)
    {
        $request->validate([
            'api_key'    => 'required|string',
            'secret_key' => 'required|string',
        ]);

        $wallet = Wallet::where('api_key', $request->api_key)
            ->where('is_onboarded', true)
            ->first();

        if (!$wallet) {
            return response()->json(['error' => 'Invalid API key'], 401);
        }

        // Verify secret
        if (!hash_equals($wallet->secret_key, hash('sha256', $request->secret_key))) {
            return response()->json(['error' => 'Invalid secret key'], 401);
        }

        return response()->json([
            'wallet_address'     => $wallet->address,
            'subaccount_address' => $wallet->subaccount_address,
            'bot_private_key'    => Crypt::decryptString($wallet->bot_private_key),
            'bot_address'        => $wallet->bot_address,  // ← thêm nếu chưa có
        ]);
    }
}
