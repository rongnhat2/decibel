<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;

class DisplayController extends Controller
{
    //
    public function index()
    {
        $wallet = \App\Models\Wallet::where('is_onboarded', 1)->first();
        echo "SUBACCOUNT_ADDR=" . $wallet->subaccount_address . "\n";
        echo "BOT_ADDRESS=" . $wallet->bot_address . "\n";
        echo "BOT_PRIVATE_KEY=" . \Illuminate\Support\Facades\Crypt::decryptString($wallet->bot_private_key) . "\n";
        dd(1);
        return view('customer.index');
    }

    public function login()
    {
        return view('customer.login');
    }
    public function verifyCode()
    {
        return view('customer.verify-code');
    }
    public function onboarding()
    {
        $user = auth()->user();
        if (!$user) {
            return redirect()->route('customer.login');
        }

        $wallet = Wallet::where('user_id', $user->id)->first();
        if (!$wallet) {
            return redirect()->route('customer.login');
        }

        if ($wallet->is_onboarded) {
            return redirect()->route('customer.index');
        }

        return view('customer.onboarding', [
            'wallet' => $wallet,
            'onboardingStep' => (int) $wallet->onboarding_step,
            'isOnboarded' => (bool) $wallet->is_onboarded,
        ]);
    }
}
