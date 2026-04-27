<?php

namespace App\Http\Middleware;

use App\Models\InviteCode;
use App\Models\Wallet;
use Closure;
use Illuminate\Http\Request;

class VerifiedCode
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('customer.login');
        }

        $hasVerifiedCode = InviteCode::where('used_by', $user->id)->exists();
        if (!$hasVerifiedCode) {
            return redirect()->route('customer.verify-code');
        }


        // Kiểm tra onboarding
        $wallet = Wallet::where('user_id', $user->id)->first();
        if (!$wallet || !$wallet->is_onboarded) {
            return redirect()->route('customer.onboarding');
        }


        return $next($request);
    }
}
