<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'decibel' => [
        'url'     => env('DECIBEL_API_URL', 'https://api.mainnet.aptoslabs.com/decibel'),
        'token'   => env('DECIBEL_BEARER_TOKEN'),
        'origin'  => env('DECIBEL_ORIGIN', 'https://app.decibel.trade/trade'),
        'builder_code'    => env('DECIBEL_BUILDER_CODE'),
        'builder_address' => env('DECIBEL_BUILDER_ADDRESS'),
    ],

];
