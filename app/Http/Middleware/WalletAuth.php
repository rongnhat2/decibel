<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use App\Models\InviteCode;
use Tymon\JWTAuth\Exceptions\JWTException;

class WalletAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->cookie('jwt_token');

        if (!$token) {
            return redirect()->route('customer.login');
        }

        try {
            $user = JWTAuth::setToken($token)->authenticate();

            if (!$user) {
                return $this->clearAndRedirect();
            }

            auth()->setUser($user);

        } catch (\Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {
            // Token hết hạn → thử refresh
            try {
                $newToken = JWTAuth::refresh($token);
                $user = JWTAuth::setToken($newToken)->authenticate();
                auth()->setUser($user);

                // Trả response với cookie mới
                $response = $next($request);
                return $response->withCookie(
                    cookie('jwt_token', $newToken, 60 * 24 * 7) // 7 ngày
                );

            } catch (\Exception $e) {
                return $this->clearAndRedirect();
            }

        } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
            return $this->clearAndRedirect();

        } catch (\Tymon\JWTAuth\Exceptions\JWTException $e) {
            return $this->clearAndRedirect();
        }
        return $next($request);
    }

    private function clearAndRedirect()
    {
        // Xoá cookie jwt_token
        return redirect()->route('customer.login')
            ->withCookie(cookie()->forget('jwt_token'));
    }
}
