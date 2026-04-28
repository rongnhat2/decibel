<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        'user_id',
        'address',
        'public_key',
        'type',
        'status',
        'bot_address',      // ← thêm
        'bot_private_key',  // ← thêm
        'subaccount_address', // ← thêm
        'onboarding_step',  // ← thêm
        'is_onboarded',     // ← thêm
        'tx_hashes',        // ← thêm
        'api_key',          // ← thêm
        'secret_key',       // ← thêm
        'secret_plain',     // ← thêm
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
