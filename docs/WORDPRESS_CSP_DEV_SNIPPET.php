<?php
/**
 * Dev-only CSP header for WordPress to allow local API access
 *
 * HOW TO USE:
 * - Option A (theme): paste this into your active theme's functions.php
 * - Option B (recommended): save as wp-content/mu-plugins/csp-dev.php
 *   (create the mu-plugins folder if missing). mu-plugins load automatically.
 *
 * SECURITY NOTES:
 * - This runs only when WP environment is 'development'.
 * - It ensures there is exactly one CSP header emitted.
 * - Do NOT ship localhost allowances to staging/production.
 */

add_action('send_headers', function () {
    // Determine environment safely (WP 5.5+)
    $is_dev = function_exists('wp_get_environment_type')
        && wp_get_environment_type() === 'development';

    // Adjust the local endpoints as needed for your dev stack
    $dev_connect = [
        "'self'",
        'http://localhost:8083', // WP REST API (dev)
    ];

    // Production-tight default (no localhost)
    $prod_connect = [
        "'self'",
        // 'https://cms.example.com', // add your production CMS origin if cross-origin
    ];

    $connectSrc = $is_dev ? $dev_connect : $prod_connect;

    // Build the policy – keep in sync with your site’s needs
    $policy = "default-src 'self'; " .
        "connect-src " . implode(' ', $connectSrc) . "; " .
        "img-src 'self' data: https:; " .
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " .
        "style-src 'self' 'unsafe-inline' https:; " .
        "frame-src https://www.google.com https://www.youtube.com; " .
        "font-src 'self' data: https:;";

    // Ensure exactly one CSP header (avoid duplicates/conflicts)
    header_remove('Content-Security-Policy');
    header("Content-Security-Policy: $policy");
}, 15);

/**
 * Optional: Dev-only CORS for REST API if you are NOT using the Vite proxy
 * Prefer the proxy to keep both CSP and CORS simple.
 */
add_action('rest_api_init', function () {
    if (!function_exists('wp_get_environment_type') || wp_get_environment_type() !== 'development') {
        return;
    }
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        header('Access-Control-Allow-Origin: http://localhost:3002'); // Vite dev server origin
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    }, 15);
});

