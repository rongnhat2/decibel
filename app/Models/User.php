<?php

namespace App\Models;


use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;  // ← phải có dòng này

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens;

    protected $fillable = ['status'];


    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function wallets()
    {
        return $this->hasMany(Wallet::class);
    }
}
