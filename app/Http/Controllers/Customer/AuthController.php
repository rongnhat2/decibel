<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use App\Models\Wallet;
use App\Models\User;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // POST /api/auth/nonce
    public function nonce(Request $request)
    {
        $request->validate(['address' => 'required|string']);

        // Tạo nonce mới, expire sau 5 phút
        $nonce = DB::table('nonces')->insertGetId([
            'address'    => $request->address,
            'nonce'      => 'Login: ' . Str::random(32),
            'expired_at' => now()->addMinutes(5),
            'used_at'    => null,
            'status'     => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $nonceRecord = DB::table('nonces')->find($nonce);

        return response()->json(['nonce' => $nonceRecord->nonce]);
    }

    // POST /api/auth/verify
    public function verify(Request $request)
    {
        $request->validate([
            'address'    => 'required|string',
            'signature'  => 'required|string',
            'public_key' => 'required|string',  // ← frontend gửi thêm public_key
            'message'    => 'required|string',
        ]);

        // Tìm nonce hợp lệ
        $nonceRecord = DB::table('nonces')
            ->where('address', $request->address)
            ->where('nonce', $request->message)
            ->where('status', 1)
            ->whereNull('used_at')
            ->where('expired_at', '>', now())  // chưa hết hạn
            ->first();

        if (!$nonceRecord) {
            return response()->json(['error' => 'Nonce không hợp lệ hoặc đã hết hạn'], 401);
        }

        // Verify chữ ký
        $isValid = $this->verifySignature(
            $request->public_key,   // dùng public_key để verify, không phải address
            $request->message,
            $request->signature
        );

        if (!$isValid) {
            return response()->json(['error' => 'Chữ ký không hợp lệ'], 401);
        }

        // Đánh dấu nonce đã dùng
        DB::table('nonces')->where('id', $nonceRecord->id)->update([
            'used_at'    => now(),
            'status'     => 0,
            'updated_at' => now(),
        ]);

        // Tạo user nếu chưa có
        $user = DB::table('users')->where('id', function ($q) use ($request) {
            $q->select('user_id')->from('wallets')
                ->where('address', $request->address)->limit(1);
        })->first();

        if (!$user) {
            $userId = DB::table('users')->insertGetId([
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Lưu wallet
            DB::table('wallets')->insert([
                'user_id'    => $userId,
                'address'    => $request->address,
                'public_key' => $request->public_key,
                'type'       => 'petra',
                'status'     => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $userId = $user->id;
        }

        // Tạo Sanctum token
        $userModel = \App\Models\User::find($userId);
        $token = $userModel->createToken('petra')->plainTextToken;

        return response()->json(['token' => $token]);
    }
}
