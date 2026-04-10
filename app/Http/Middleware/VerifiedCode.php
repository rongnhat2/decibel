<?php

namespace App\Http\Middleware;

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

        if (!$user->is_verified) {
            return redirect()->route('customer.verify-code');
        }

        return $next($request);
    }
}
