<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;

class OnboardingController extends Controller
{
    // POST /api/onboarding/bot-key
    // Tạo bot keypair, lưu DB, trả về bot_address cho frontend
    public function getBotKey(Request $request)
    {
        \Log::info('getBotKey called', ['wallet' => $request->wallet_address]);

        $wallet = Wallet::where('address', $request->wallet_address)->first();

        // Tạo bot keypair
        if (!$wallet->bot_address) {
            $keypair = $this->generateAptosKeypair();
            \Log::info('keypair generated', ['address' => $keypair['address']]);

            $wallet->update([
                'bot_address'     => $keypair['address'],
                'bot_private_key' => Crypt::encryptString($keypair['private_key']),
            ]);
            $wallet->refresh();
        }

        // Check + redeem subaccount
        $subaccounts = $this->checkSubaccounts($request->wallet_address);
        \Log::info('subaccounts', ['subaccounts' => $subaccounts]);

        if (empty($subaccounts)) {
            $result = $this->redeemReferralCode($request->wallet_address);
            \Log::info('redeem result', ['result' => $result]);

            $subaccountAddress = $result['subaccount_address']
                ?? $result['account']
                ?? null;

            $wallet->update(['subaccount_address' => $subaccountAddress]);
            $wallet->refresh();
        } else {
            $subaccountAddress = $subaccounts[0]['subaccount_address'];
            $wallet->update(['subaccount_address' => $subaccountAddress]);
            $wallet->refresh();
        }

        \Log::info('response', [
            'bot_key_address'    => $wallet->bot_address,
            'subaccount_address' => $wallet->subaccount_address,
        ]);

        return response()->json([
            'bot_key_address'    => $wallet->bot_address,
            'subaccount_address' => $wallet->subaccount_address,
        ]);
    }

    // POST /api/onboarding/progress
    // Lưu tiến độ sau mỗi tx
    public function saveProgress(Request $request)
    {
        $request->validate([
            'wallet_address' => 'required|string',
            'step'           => 'required|integer',
        ]);

        $wallet = Wallet::where('address', $request->wallet_address)->first();

        if (!$wallet) {
            return response()->json(['error' => 'Wallet không tồn tại'], 404);
        }

        // tx_hashes có thể là string JSON hoặc array
        $txHashes = $wallet->tx_hashes;
        if (is_string($txHashes)) {
            $txHashes = json_decode($txHashes, true) ?? [];
        }
        if (!is_array($txHashes)) {
            $txHashes = [];
        }

        switch ($request->step) {
            case 1:
                $txHashes['create_subaccount'] = $request->tx_hash;
                $wallet->update([
                    'subaccount_address' => $request->subaccount_address,
                    'onboarding_step'    => 1,
                    'tx_hashes'          => json_encode($txHashes),
                ]);
                break;

            case 2:
                $txHashes['approve_builder_fee'] = $request->tx_hash;
                $wallet->update([
                    'onboarding_step' => 2,
                    'tx_hashes'       => json_encode($txHashes),
                ]);
                break;

            case 3:
                $txHashes['delegate_trading'] = $request->tx_hash;
                $wallet->update([
                    'onboarding_step' => 3,
                    'is_onboarded'    => true,
                    'tx_hashes'       => json_encode($txHashes),
                ]);
                break;
        }

        return response()->json(['success' => true, 'step' => $request->step]);
    }

    // Generate Aptos keypair dùng OpenSSL Ed25519
    private function generateAptosKeypair(): array
    {
        $keypair    = sodium_crypto_sign_keypair();
        $privateKey = sodium_crypto_sign_secretkey($keypair);
        $publicKey  = sodium_crypto_sign_publickey($keypair);

        // Chỉ lấy 32 bytes đầu của private key (seed)
        // sodium trả về 64 bytes = seed (32) + public key (32)
        $seed = substr($privateKey, 0, 32);

        // AIP-80 format: 0x + hex
        $privateKeyHex = '0x' . bin2hex($seed);
        $publicKeyHex  = '0x' . bin2hex($publicKey);

        // Aptos address = sha3_256 của public key + 0x00 (single key scheme)
        $addressBytes = hash('sha3-256', $publicKey . "\x00", true);
        $address      = '0x' . bin2hex($addressBytes);

        return [
            'address'     => $address,
            'private_key' => $privateKeyHex,
            'public_key'  => $publicKeyHex,
        ];
    }

    private function checkSubaccounts(string $address): array
    {
        $res = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('decibel.token'),
            'Origin'        => config('decibel.origin'),
        ])->get(config('decibel.url') . '/api/v1/subaccounts', [
            'owner' => $address,
        ]);

        \Log::info('checkSubaccounts', [
            'status' => $res->status(),
            'body'   => $res->body(),
            'token'  => config('decibel.token') ? 'set' : 'null',
        ]);

        return $res->ok() ? $res->json() : [];
    }

    private function redeemReferralCode(string $address): array
    {
        $res = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.decibel.token'),
            'Origin'        => config('services.decibel.origin'),
        ])->post(config('services.decibel.url') . '/api/v1/referrals/redeem', [
            'referral_code' => config('services.decibel.builder_code'),
            'account'       => $address,
        ]);

        if (!$res->ok()) {
            // 409 = đã redeem rồi, không phải lỗi
            if ($res->status() === 409) return $res->json();
            throw new \Exception('Redeem failed: ' . $res->body());
        }

        return $res->json();
    }
}
