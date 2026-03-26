<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Nonce extends Model
{
    protected $fillable = [
        'address',
        'nonce',
        'expired_at',
        'used_at',
        'status'
    ];
}
