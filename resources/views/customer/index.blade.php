@extends('customer.layout')
@section('content')
    <div class="row g-4">
        <div class="col-12">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                    <h4 class="mb-1">Trading Account Dashboard</h4>
                    <p class="text-body mb-0">Manage your wallet, keys, and balance in one place.</p>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="d-flex flex-column gap-3">
                        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <div class="text-body">Wallet Address</div>
                            <div class="d-flex align-items-center gap-2">
                                <code id="wallet-address" class="mb-0">0xacc3...965d</code>
                                <button type="button" class="btn btn-sm btn-light" id="copy-wallet-address">
                                    <i class="fi fi-rr-copy me-1"></i>Copy
                                </button>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <div class="text-body">API Key</div>
                            <div class="d-flex align-items-center gap-2">
                                <code id="dashboard-api-key" class="mb-0">xxxxxxxx...</code>
                                <button type="button" class="btn btn-sm btn-light" id="copy-api-key">
                                    <i class="fi fi-rr-copy me-1"></i>Copy
                                </button>
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-between gap-2 flex-wrap">
                            <div class="text-body">Secret Key</div>
                            <div class="d-flex align-items-center gap-2">
                                <code id="dashboard-secret-key" class="mb-0">••••••••</code>
                                <button type="button" class="btn btn-sm btn-light" id="toggle-secret-key">
                                    <i class="fi fi-rr-eye me-1"></i>Show
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-transparent border-0 pb-0">
                    <h5 class="mb-0">Balance</h5>
                </div>
                <div class="card-body p-4 pt-3">
                    <div class="d-flex flex-column gap-3">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-body">APT</span>
                            <span class="fw-semibold" id="apt-balance">10.0000</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-start">
                            <span class="text-body">usDCBL</span>
                            <div class="text-end">
                                <div class="fw-semibold" id="balance-usdcbl">0.00</div>
                                <small class="text-muted">(after deposit to Decibel)</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <div class="d-flex flex-wrap gap-2 mb-4">
                        <button class="btn btn-primary" id="btn-deposit">Nạp tiền</button>
                        <button class="btn btn-outline-primary" id="btn-withdraw">Rút tiền</button>
                    </div>

                    <h6 class="mb-3">Lịch sử giao dịch</h6>
                    <div class="border-top pt-3 text-body">
                        <p class="mb-0 text-muted" id="empty-transaction-history">Chưa có giao dịch nào</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection
@section('scripts')
    <!-- <script src="{{ asset('js/index.js') }}"></script> -->
    <script src="{{ asset('js/disconnect.js') }}"></script>
    <script src="{{ asset('js/get-balance.js') }}"></script>
@endsection