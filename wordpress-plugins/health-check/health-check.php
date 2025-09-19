<?php
/**
 * Plugin Name: Saraiva Vision Health Check
 * Plugin URI: https://saraivavision.com.br/
 * Description: Health check endpoint for WordPress container - OpenAPI 3.0.3 compliant
 * Version: 1.0.0
 * Author: Saraiva Vision Development Team
 * Author URI: https://saraivavision.com.br/
 * License: MIT
 * Text Domain: saraiva-vision
 */

// Prevent direct file access
if (!defined('ABSPATH')) {
    exit;
}

// Add health check endpoint to REST API
add_action('rest_api_init', function () {
    register_rest_route('saraiva-vision/v1', '/health', array(
        'methods' => 'GET',
        'callback' => 'saraiva_vision_health_check',
        'permission_callback' => '__return_true',
        'args' => array(
            'detailed' => array(
                'default' => false,
                'validate_callback' => function($param) {
                    return is_bool($param) || $param === 'true' || $param === 'false';
                }
            )
        )
    ));
});

function saraiva_vision_health_check($request) {
    $detailed = $request->get_param('detailed') === true || $request->get_param('detailed') === 'true';

    // Check WordPress database connection
    global $wpdb;
    $db_connected = $wpdb->check_connection();

    // Check if required plugins are active
    $required_plugins = array(
        'akismet/akismet.php' => false,
        'jetpack/jetpack.php' => false
    );

    foreach ($required_plugins as $plugin => $active) {
        if (is_plugin_active($plugin)) {
            $required_plugins[$plugin] = true;
        }
    }

    // Get theme information
    $theme = wp_get_theme();
    $theme_info = array(
        'name' => $theme->get('Name'),
        'version' => $theme->get('Version'),
        'status' => $theme->get('Status'),
        'author' => $theme->get('Author')
    );

    // Get post counts
    $post_counts = array(
        'posts' => wp_count_posts()->publish,
        'pages' => wp_count_posts('page')->publish,
        'media' => wp_count_posts('attachment')->inherit
    );

    // Check file system permissions
    $upload_dir = wp_upload_dir();
    $writable = is_writable($upload_dir['basedir']);

    // Check memory usage
    $memory_limit = ini_get('memory_limit');
    $memory_usage = function_exists('memory_get_usage') ? memory_get_usage(true) : 0;
    $memory_peak = function_exists('memory_get_peak_usage') ? memory_get_peak_usage(true) : 0;

    $health_data = array(
        'status' => $db_connected ? 'healthy' : 'unhealthy',
        'timestamp' => current_time('mysql'),
        'timestamp_iso' => gmdate('c'),
        'uptime' => time() - get_option('saraiva_vision_start_time', time()),
        'version' => get_bloginfo('version'),
        'environment' => WP_DEBUG ? 'development' : 'production',
        'service' => 'wordpress',
        'server' => 'Saraiva Vision WordPress',
        'checks' => array(
            'database' => $db_connected ? 'connected' : 'disconnected',
            'filesystem' => $writable ? 'writable' : 'read_only',
            'memory' => array(
                'limit' => $memory_limit,
                'usage' => size_format($memory_usage),
                'peak' => size_format($memory_peak),
                'usage_bytes' => $memory_usage,
                'peak_bytes' => $memory_peak
            ),
            'plugins' => $required_plugins,
            'theme' => $theme_info,
            'posts' => $post_counts
        ),
        'endpoints' => array(
            'health' => '/wp-json/saraiva-vision/v1/health',
            'posts' => '/wp-json/wp/v2/posts',
            'pages' => '/wp-json/wp/v2/pages',
            'media' => '/wp-json/wp/v2/media',
            'categories' => '/wp-json/wp/v2/categories',
            'comments' => '/wp-json/wp/v2/comments'
        ),
        'openapi' => array(
            'version' => '3.0.3',
            'title' => 'Saraiva Vision WordPress Health Check',
            'description' => 'Health monitoring endpoint for Saraiva Vision WordPress service'
        )
    );

    if ($detailed) {
        $health_data['detailed'] = array(
            'active_plugins' => get_option('active_plugins'),
            'site_options' => array(
                'siteurl' => get_option('siteurl'),
                'home' => get_option('home'),
                'blogname' => get_option('blogname'),
                'blogdescription' => get_option('blogdescription')
            ),
            'upload_dir' => $upload_dir,
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        );
    }

    return rest_ensure_response($health_data);
}

// Add CORS headers for health check endpoint
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    if (strpos($request->get_route(), '/saraiva-vision/v1/health') !== false) {
        $server->send_header('Access-Control-Allow-Origin', '*');
        $server->send_header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $server->send_header('Access-Control-Allow-Headers', 'Content-Type');
        $server->send_header('Cache-Control', 'no-cache, no-store, must-revalidate');
        $server->send_header('Pragma', 'no-cache');
        $server->send_header('Expires', '0');
    }
    return $served;
}, 10, 4);

// Store start time for uptime calculation
register_activation_hook(__FILE__, function() {
    add_option('saraiva_vision_start_time', time());
});

// Clean up on deactivation
register_deactivation_hook(__FILE__, function() {
    delete_option('saraiva_vision_start_time');
});