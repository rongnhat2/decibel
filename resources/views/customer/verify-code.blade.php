<!DOCTYPE html>
<html lang="en">

<head>

    <base href="../">

    <!-- begin::Decibel Meta Basic -->
    <meta charset="utf-8">
    <meta name="theme-color" content="#5955D1">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Decibel">
    <meta name="format-detection" content="telephone=no">
    <meta name="keywords"
        content="Decibel, Onchain Trading, Aptos, Crypto Trading, Cross Collateral, Multi Collateral, Spot Trading, Perps, Vaults, Strategy">
    <meta name="description"
        content="Decibel is a fully onchain trading engine built on Aptos. It combines spot, perps, and vault-based strategies into one platform with cross and multicollateral.">
    <!-- end::Decibel Meta Basic -->

    <!-- begin::Decibel Meta Social -->
    <meta property="og:url" content="#">
    <meta property="og:site_name" content="Decibel | Onchain Trading Engine">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_US">
    <meta property="og:title" content="Decibel | Onchain Trading Engine on Aptos">
    <meta property="og:description"
        content="Decibel is a fully onchain trading engine built on Aptos. It combines spot, perps, and vault-based strategies into one platform with cross and multicollateral.">
    <meta property="og:image" content="#">
    <!-- end::Decibel Meta Social -->

    <!-- begin::Decibel Meta Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:url" content="#">
    <meta name="twitter:creator" content="@Decibel">
    <meta name="twitter:title" content="Decibel | Onchain Trading Engine on Aptos">
    <meta name="twitter:description"
        content="Decibel is a fully onchain trading engine built on Aptos. It combines spot, perps, and vault-based strategies into one platform with cross and multicollateral.">
    <!-- end::Decibel Meta Twitter -->

    <!-- begin::Decibel Website Page Title -->
    <title>Decibel | Onchain Trading Engine on Aptos</title>
    <!-- end::Decibel Website Page Title -->

    <!-- begin::Decibel Mobile Specific -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- end::Decibel Mobile Specific -->

    <!-- begin::Decibel Favicon Tags -->
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <!-- end::Decibel Favicon Tags -->

    <!-- begin::Decibel Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
        rel="stylesheet">
    <!-- end::Decibel Google Fonts -->

    <!-- begin::Decibel Required Stylesheet -->
    <link rel="stylesheet" href="assets/libs/flaticon/css/all/all.css">
    <link rel="stylesheet" href="assets/libs/lucide/lucide.css">
    <link rel="stylesheet" href="assets/libs/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="assets/libs/simplebar/simplebar.css">
    <link rel="stylesheet" href="assets/libs/node-waves/waves.css">
    <link rel="stylesheet" href="assets/libs/bootstrap-select/css/bootstrap-select.min.css">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <!-- end::Decibel Required Stylesheet -->

    <!-- begin::Decibel CSS Stylesheet -->
    <link rel="stylesheet" href="assets/css/styles.css">
    <!-- end::Decibel CSS Stylesheet -->

</head>

<body>

    <div class="page-layout">

        <div class="auth-frame-wrapper">
            <div class="row g-0 h-100">
                <div class="col-xl-8 col-lg-7 col-md-6">
                    <div class="auth-frame p-0 position-relative overflow-hidden" style="background: none;">
                        <video autoplay loop muted playsinline class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                            style="z-index:0;">
                            <source src="assets/waves.mp4" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-5 col-md-6 align-self-center">
                    <div class="p-4 p-sm-5 maxw-450px m-auto">
                        <div class="mb-4 text-center">
                            <a href="index.html" aria-label="NexLink logo">
                                <img class="visible-light" src="assets/images/logo.svg" alt="NexLink logo">
                            </a>
                        </div>
                        <div class="text-center mb-5">
                            <h5 class="mb-1">Welcome to Decibel</h5>
                            <p>Decibel is a fully onchain trading engine built on Aptos. It combines spot, perps, and vault-based
                                strategies into one platform with cross and multicollateral.</p>
                        </div>
                        <div action="authentication/new-password-frame.html">
                            <div class="mb-4">
                                <label class="form-label" for="resetEmail">Enter the code</label>
                                <input id="invite-code-input" type="text" class="form-control" id="resetEmail" placeholder="Enter the code">
                            </div>
                            <p id="code-status"></p>
                            <div class="clearfix">
                                <button id="btn-submit-code" type="submit" value="Submit" class="btn btn-primary waves-effect waves-light w-100 mb-3">Verify Code</button>
                                <a href="#" id="btn-disconnect" class="btn btn-light waves-effect waves-light w-100"> Logout </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- begin::Decibel Page Scripts -->
    <script src="assets/libs/global/global.min.js"></script>
    <script src="assets/js/appSettings.js"></script>
    <script src="assets/js/main.js"></script>
    <script src="{{ asset('js/disconnect.js') }}"></script>
    <script src="{{ asset('js/verify-code.js') }}"></script>


</body>

</html>