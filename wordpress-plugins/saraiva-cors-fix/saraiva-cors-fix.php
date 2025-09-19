<?php
/**
 * WordPress CORS Configuration for Saraiva Vision Clinic
 * Medical website compliance - handles www/non-www origins safely
 *
 * This plugin ensures WordPress REST API accepts requests from both:
 * - https://saraivavision.com.br
 * - https://www.saraivavision.com.br
 *
 * Medical compliance: Specific origins only, no wildcard for security
 */

// Add CORS headers for WordPress REST API
add_action('rest_api_init', function() {
    // Remove default WordPress CORS to avoid conflicts
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');

    // Add our custom CORS headers
    add_filter('rest_pre_serve_request', 'saraiva_custom_cors_headers', 15, 4);
});

function saraiva_custom_cors_headers($served, $result, $request, $server) {
    // Allowed origins for Saraiva Vision Clinic
    $allowed_origins = [
        'https://saraivavision.com.br',
        'https://www.saraivavision.com.br'
    ];

    // Get the origin from request
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

    // Check if origin is allowed
    if (in_array($origin, $allowed_origins)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    } else {
        // Default to main domain for clinic
        header('Access-Control-Allow-Origin: https://saraivavision.com.br');
    }

    // Medical-grade CORS configuration
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With, Accept, Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // 24 hours cache
    header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link');

    // Medical data protection headers
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');

    // Handle preflight OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('HTTP/1.1 200 OK');
        exit;
    }

    return $served;
}

// Set WordPress site URLs to canonical domain (non-www)
add_action('init', function() {
    if (is_admin()) {
        return; // Don't redirect admin area
    }

    // Ensure WordPress uses canonical URLs
    if (!defined('WP_SITEURL')) {
        define('WP_SITEURL', 'https://saraivavision.com.br');
    }
    if (!defined('WP_HOME')) {
        define('WP_HOME', 'https://saraivavision.com.br');
    }
});

// Add medical website specific headers for all responses
add_action('send_headers', function() {
    // LGPD compliance header
    header('X-Privacy-Policy: https://saraivavision.com.br/privacy');

    // Medical data classification
    header('X-Content-Classification: medical-public');

    // Cache control for medical content
    if (is_admin() || wp_doing_ajax()) {
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');
    }
});

// Log CORS issues for debugging (medical compliance audit trail)
add_action('wp_loaded', function() {
    if (defined('WP_DEBUG') && WP_DEBUG && isset($_SERVER['HTTP_ORIGIN'])) {
        error_log('CORS Request from: ' . $_SERVER['HTTP_ORIGIN'] . ' to ' . $_SERVER['REQUEST_URI']);
    }
});

?>
