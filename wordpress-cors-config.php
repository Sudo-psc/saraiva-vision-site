<?php
// WordPress CORS Configuration for Development
// Add this to wp-config.php or use as a plugin

// Enable CORS for all origins during development
if (!defined('WP_DEBUG') || WP_DEBUG) {
    add_action('init', function() {
        // Remove default CORS restrictions
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

        // Add permissive CORS headers for development
        add_action('rest_api_init', function() {
            remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
            add_filter('rest_pre_serve_request', function($value) {
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
                header('Access-Control-Allow-Headers: Content-Type, Authorization, X-WP-Nonce, X-Requested-With');
                header('Access-Control-Allow-Credentials: true');

                if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                    status_header(200);
                    exit;
                }

                return $value;
            });
        });
    });
}
