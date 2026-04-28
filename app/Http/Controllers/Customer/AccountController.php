<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class AccountController extends Controller
{
    public function credentials(Request $request)
    {
        $user   = auth()->user();
        $wallet = Wallet::where('user_id', $user->id)
            ->where('is_onboarded', true)
            ->first();

        if (!$wallet) {
            return response()->json(['error' => 'Not onboarded'], 404);
        }

        // Secret chỉ show 1 lần
        $secretPlain = null;
        if ($wallet->secret_plain) {
            $secretPlain = Crypt::decryptString($wallet->secret_plain);
            $wallet->update(['secret_plain' => null]); // xoá sau khi show
        }

        return response()->json([
            'api_key'            => $wallet->api_key,
            'secret_key'         => $secretPlain, // null nếu đã show rồi
            'account_id'         => $wallet->subaccount_address,
            'wallet_address'     => $wallet->address,
        ]);
    }

    // Regenerate credentials nếu user muốn reset
    public function regenerateCredentials(Request $request)
    {
        $user   = auth()->user();
        $wallet = Wallet::where('user_id', $user->id)
            ->where('is_onboarded', true)
            ->first();
        if (!$wallet) {
            return response()->json(['error' => 'Not onboarded'], 404);
        }

        $apiKey    = 'dcbl_' . bin2hex(random_bytes(12));
        $secretRaw = 'sk_'   . bin2hex(random_bytes(16));
        $wallet->update([
            'api_key'      => $apiKey,
            'secret_key'   => hash('sha256', $secretRaw),
            'secret_plain' => Crypt::encryptString($secretRaw),
        ]);

        return response()->json([
            'api_key'    => $apiKey,
            'secret_key' => $secretRaw, // show 1 lần duy nhất
            'account_id' => $wallet->subaccount_address,
        ]);
    }
}
