<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Nonce;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class WalletController extends Controller
{
    // POST /api/auth/nonce
    public function nonce(Request $request)
    {
        $request->validate(['address' => 'required|string']);

        Nonce::where('address', $request->address)
            ->where('status', 1)
            ->update(['status' => 0]);

        $nonce = Nonce::create([
            'address' => $request->address,
            'nonce' => 'Login to App: ' . Str::random(32),
            'expired_at' => now()->addMinutes(5),
            'used_at' => null,
            'status' => 1,
        ]);

        return response()->json(['nonce' => $nonce->nonce]);
    }

    // POST /api/auth/verify
    public function verify(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'public_key' => 'required|string',
            'signature' => 'required',
            'message' => 'required|string',
        ]);

        // Tìm nonce hợp lệ
        $nonce = Nonce::where('address', $request->address)
            ->where('nonce', $request->message)
            ->where('status', 1)
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();

        if (!$nonce) {
            return response()->json(['error' => 'Nonce không hợp lệ hoặc hết hạn'], 401);
        }

        // Verify chữ ký
        $signature = is_array($request->signature)
            ? json_encode($request->signature)
            : (string) $request->signature;

        if (!$this->verifySignature($request->public_key, $request->message, $signature)) {
            return response()->json(['error' => 'Chữ ký không hợp lệ'], 401);
        }

        // Đánh dấu nonce đã dùng
        $nonce->update(['used_at' => now(), 'status' => 0]);

        // Tìm hoặc tạo user
        $wallet = Wallet::where('address', $request->address)->first();

        if (!$wallet) {
            $user = User::create(['status' => 1]);

            $wallet = Wallet::create([
                'user_id' => $user->id,
                'address' => $request->address,
                'public_key' => $request->public_key,
                'type' => 'petra',
                'status' => 1,
            ]);
        } else {
            $user = $wallet->user;
        }

        // Tạo JWT token
        $token = JWTAuth::fromUser($user);

        return response()->json([
            'token' => $token,
            'user_id' => $user->id,
            'address' => $wallet->address,
        ]);
    }

    private function verifySignature(string $publicKey, string $message, string $signature): bool
    {
        // Keyless (Google) → pass
        if (str_starts_with($signature, '{') || str_starts_with($signature, '[')) {
            return true;
        }

        // Ed25519
        try {
            $ec = new \Elliptic\EdDSA('ed25519');
            $key = $ec->keyFromPublic(ltrim($publicKey, '0x'), 'hex');
            $msgBytes = array_values(unpack('C*', $message));
            $sigBytes = array_values(unpack('C*', hex2bin(ltrim($signature, '0x'))));
            return $key->verify($msgBytes, $sigBytes);
        } catch (\Throwable $e) {
            \Log::error('Verify signature error: ' . $e->getMessage());
            return false;
        }
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'code'    => 'required|string',
            'user_id' => 'required|integer',
        ]);

        $invite = \App\Models\InviteCode::where('code', $request->code)
            ->where('status', 1)
            ->whereNull('used_by')
            ->first();

        if (!$invite) {
            return response()->json(['error' => 'Code invalid or already used'], 401);
        }

        // Đánh dấu code đã dùng
        $invite->update([
            'used_by' => $request->user_id,
            'used_at' => now(),
            'status'  => 0,
        ]);

        return response()->json(['success' => true]);
    }

    // Admin tạo code (dùng nội bộ)
    public function generateCode(Request $request)
    {
        $codes = [];
        $count = $request->input('count', 1);

        for ($i = 0; $i < $count; $i++) {
            $code = strtoupper(\Str::random(8)); // VD: A3KD92PX
            \App\Models\InviteCode::create([
                'code'       => $code,
                'status'     => 1,
            ]);
            $codes[] = $code;
        }

        return response()->json(['codes' => $codes]);
    }
}
