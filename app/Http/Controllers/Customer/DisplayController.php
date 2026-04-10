<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DisplayController extends Controller
{
    //
    public function index()
    {
        return view('customer.index');
    }

    public function login()
    {
        return view('customer.login');
    }
    public function verifyCode()
    {
        return view('customer.verify-code');
    }
}
