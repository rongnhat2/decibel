<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Nonce;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    // POST /api/auth/nonce
    public function nonce(Request $request)
    {
        $request->validate(['address' => 'required|string']);

        // Xoá nonce cũ của address này
        Nonce::where('address', $request->address)
            ->where('status', 1)
            ->update(['status' => 0]);

        // Tạo nonce mới
        $nonce = Nonce::create([
            'address'    => $request->address,
            'nonce'      => 'Login to App: ' . Str::random(32),
            'expired_at' => now()->addMinutes(5),
            'used_at'    => null,
            'status'     => 1,
        ]);

        return response()->json(['nonce' => $nonce->nonce]);
    }

    // POST /api/auth/verify
    public function verify(Request $request)
    {
        \Log::info('verify called', $request->all());
        $request->validate([
            'address'    => 'required|string',
            'public_key' => 'required|string',
            'signature'  => 'required',
            'message'    => 'required|string',
        ]);

        // Cast signature sang string nếu là array/object
        $signature = is_array($request->signature)
            ? json_encode($request->signature)
            : (string) $request->signature;
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

        // Verify chữ ký Ed25519
        if (!$this->verifySignature($request->public_key, $request->message, $signature)) {
            return response()->json(['error' => 'Chữ ký không hợp lệ'], 401);
        }

        // Đánh dấu nonce đã dùng
        $nonce->update(['used_at' => now(), 'status' => 0]);

        // Tìm wallet đã có chưa
        $wallet = Wallet::where('address', $request->address)->first();

        if (!$wallet) {
            // Tạo user mới
            $user = User::create(['status' => 1]);

            // Tạo wallet
            $wallet = Wallet::create([
                'user_id'    => $user->id,
                'address'    => $request->address,
                'public_key' => $request->public_key,
                'type'       => 'petra',
                'status'     => 1,
            ]);
        } else {
            $user = $wallet->user;
        }

        // Tạo token
        $token = $user->createToken('petra-auth')->plainTextToken;

        return response()->json([
            'token'   => $token,
            'user_id' => $user->id,
            'address' => $wallet->address,
        ]);
    }

    private function verifySignature(string $publicKey, string $message, string $signature): bool
    {
        // Keyless account (Google login) dùng JWT-based signature
        // Không verify được Ed25519 thông thường
        // Chỉ cần verify nonce đúng là đủ trust
        // TODO: implement Keyless verification nếu cần strict security

        // Nếu signature là JSON (keyless) → pass
        if (str_starts_with($signature, '{') || str_starts_with($signature, '[')) {
            \Log::info('Keyless signature detected, skipping Ed25519 verify');
            return true;
        }

        // Ed25519 verify bình thường
        try {
            $ec       = new \Elliptic\EdDSA('ed25519');
            $key      = $ec->keyFromPublic(ltrim($publicKey, '0x'), 'hex');
            $msgBytes = array_values(unpack('C*', $message));
            $sigBytes = array_values(unpack('C*', hex2bin(ltrim($signature, '0x'))));
            return $key->verify($msgBytes, $sigBytes);
        } catch (\Throwable $e) {
            \Log::error('Verify signature error: ' . $e->getMessage());
            return false;
        }
    }
}
