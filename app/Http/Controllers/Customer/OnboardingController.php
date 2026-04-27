<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class OnboardingController extends Controller
{
    // POST /api/onboarding/bot-key
    // Tạo bot keypair, lưu DB, trả về bot_address cho frontend
    public function getBotKey(Request $request)
    {
        $request->validate([
            'wallet_address' => 'required|string',
        ]);

        $wallet = Wallet::where('address', $request->wallet_address)->first();

        if (!$wallet) {
            return response()->json(['error' => 'Wallet không tồn tại'], 404);
        }

        // Nếu đã có bot_address rồi thì trả về luôn
        if ($wallet->bot_address) {
            return response()->json([
                'bot_key_address' => $wallet->bot_address,
            ]);
        }

        // Generate Aptos keypair mới cho bot
        $keypair = $this->generateAptosKeypair();

        // Lưu DB — private key encrypt trước khi lưu
        $wallet->update([
            'bot_address' => $keypair['address'],
            'bot_private_key' => Crypt::encryptString($keypair['private_key']),
        ]);

        return response()->json([
            'bot_key_address' => $keypair['address'],
        ]);
    }

    // POST /api/onboarding/progress
    // Lưu tiến độ sau mỗi tx
    public function saveProgress(Request $request)
    {
        $request->validate([
            'wallet_address' => 'required|string',
            'step' => 'required|integer',
        ]);

        $wallet = Wallet::where('address', $request->wallet_address)->first();

        if (!$wallet) {
            return response()->json(['error' => 'Wallet không tồn tại'], 404);
        }

        $txHashes = $wallet->tx_hashes ?? [];

        switch ($request->step) {
            case 1:
                // Tx1 xong — lưu subaccount_address
                $request->validate([
                    'subaccount_address' => 'required|string',
                    'tx_hash' => 'required|string',
                ]);

                $txHashes['create_subaccount'] = $request->tx_hash;

                $wallet->update([
                    'subaccount_address' => $request->subaccount_address,
                    'onboarding_step' => 1,
                    'tx_hashes' => $txHashes,
                ]);
                break;

            case 2:
                // Tx2 xong — approve builder fee
                $request->validate(['tx_hash' => 'required|string']);

                $txHashes['approve_builder_fee'] = $request->tx_hash;

                $wallet->update([
                    'onboarding_step' => 2,
                    'tx_hashes' => $txHashes,
                ]);
                break;

            case 3:
                // Tx3 xong — delegate trading, onboarding hoàn tất
                $request->validate(['tx_hash' => 'required|string']);

                $txHashes['delegate_trading'] = $request->tx_hash;

                $wallet->update([
                    'onboarding_step' => 3,
                    'is_onboarded' => true,
                    'tx_hashes' => $txHashes,
                ]);
                break;
        }

        return response()->json(['success' => true, 'step' => $request->step]);
    }

    // Generate Aptos keypair dùng OpenSSL Ed25519
    private function generateAptosKeypair(): array
    {
        // Generate Ed25519 keypair
        $keypair = sodium_crypto_sign_keypair();
        $privateKey = sodium_crypto_sign_secretkey($keypair);
        $publicKey = sodium_crypto_sign_publickey($keypair);

        // Aptos address = hash của public key
        $address = '0x' . hash('sha3-256', $publicKey);

        return [
            'address' => $address,
            'private_key' => '0x' . bin2hex($privateKey),
            'public_key' => '0x' . bin2hex($publicKey),
        ];
    }
}
