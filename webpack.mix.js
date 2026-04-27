const mix = require("laravel-mix");

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js("resources/js/app.js", "public/js").postCss(
    "resources/css/app.css",
    "public/css",
    [
        //
    ],
);

mix.js("resources/js/petra.js", "public/js")
    .js("resources/js/disconnect.js", "public/js")
    .js("resources/js/verify-code.js", "public/js")
    .js("resources/js/get-balance.js", "public/js")
    .js("resources/js/index.js", "public/js")
    .js("resources/js/onboarding.js", "public/js"); // onboarding flow
