@extends('customer.layout')
@section('content')
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="builder-address" content="{{ config('decibel.builder_address') }}">

<div class="row justify-content-center mt-4">
    <div class="col-12 col-xl-7 col-lg-9">
        <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
                <div class="mb-4">
                    <h4 class="mb-1">Thiet lap tai khoan</h4>
                    <p class="text-body mb-0">
                        Can 3 buoc xac nhan tren Petra wallet de hoan tat onboarding.
                    </p>
                </div>

                <div class="d-flex flex-column gap-3 mb-4" id="onboarding-steps"
                    data-initial-step="{{ (int) ($onboardingStep ?? 0) }}"
                    data-is-onboarded="{{ ($isOnboarded ?? false) ? '1' : '0' }}"
                    data-wallet-address="{{ $wallet->address ?? '' }}">
                    <div class="d-flex align-items-center justify-content-between p-3 rounded border step-item"
                        data-step="1">
                        <div class="d-flex align-items-center gap-3">
                            <span class="step-icon text-muted" id="step-icon-1">
                                <i class="fi fi-rr-circle"></i>
                            </span>
                            <span class="step-label text-secondary" id="step-label-1">Buoc 1: Tao Trading Account</span>
                        </div>
                        <div class="small text-muted" id="step-status-1">pending</div>
                    </div>

                    <div class="d-flex align-items-center justify-content-between p-3 rounded border step-item"
                        data-step="2">
                        <div class="d-flex align-items-center gap-3">
                            <span class="step-icon text-muted" id="step-icon-2">
                                <i class="fi fi-rr-circle"></i>
                            </span>
                            <span class="step-label text-secondary" id="step-label-2">Buoc 2: Approve Builder Fee</span>
                        </div>
                        <div class="small text-muted" id="step-status-2">pending</div>
                    </div>

                    <div class="d-flex align-items-center justify-content-between p-3 rounded border step-item"
                        data-step="3">
                        <div class="d-flex align-items-center gap-3">
                            <span class="step-icon text-muted" id="step-icon-3">
                                <i class="fi fi-rr-circle"></i>
                            </span>
                            <span class="step-label text-secondary" id="step-label-3">Buoc 3: Uy quyen Bot
                                Trading</span>
                        </div>
                        <div class="small text-muted" id="step-status-3">pending</div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button id="btn-start-onboarding" class="btn btn-primary">
                        Bat dau thiet lap
                    </button>
                    <button id="btn-retry-onboarding" class="btn btn-outline-danger d-none">
                        Thu lai
                    </button>
                </div>

                <p class="mt-3 mb-1 text-body" id="onboarding-status-text">
                    San sang bat dau onboarding.
                </p>
                <p class="mb-0 text-danger d-none" id="onboarding-error-text"></p>
            </div>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="{{ asset('js/onboarding.js') }}"></script>
@endsection