<?php

namespace App\Http\Middleware;

use App\Models\InviteCode;
use Closure;
use Illuminate\Http\Request;

class RedirectIfCodeVerified
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('customer.login');
        }

        $hasVerifiedCode = InviteCode::where('used_by', $user->id)->exists();
        if ($hasVerifiedCode) {
            return redirect()->route('customer.index');
        }

        return $next($request);
    }
}
