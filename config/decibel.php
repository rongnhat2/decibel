<?php
// config/decibel.php
return [
    'url'     => env('DECIBEL_API_URL', 'https://api.mainnet.aptoslabs.com/decibel'),
    'token'   => env('DECIBEL_BEARER_TOKEN'),
    'origin'  => env('DECIBEL_ORIGIN', 'https://app.decibel.trade/trade'),
    'builder_code'    => env('DECIBEL_BUILDER_CODE'),
    'builder_address' => env('DECIBEL_BUILDER_ADDRESS'),
];
