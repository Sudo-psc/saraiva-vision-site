<?php
/**
 * Additional WordPress configuration for headless CMS
 * This file is included in wp-config.php
 */

// Redis Object Cache Configuration
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_TIMEOUT', 1);
define('WP_REDIS_READ_TIMEOUT', 1);
define('WP_REDIS_DATABASE', 0);
define('WP_REDIS_PREFIX', 'saraiva_vision_');

// GraphQL JWT Authentication
define('GRAPHQL_JWT_AUTH_SECRET_KEY', getenv('JWT_SECRET_KEY'));
define('GRAPHQL_JWT_AUTH_JWT_EXPIRE', WEEK_IN_SECONDS);

// Security enhancements
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false); // Allow plugin updates
define('AUTOMATIC_UPDATER_DISABLED', false);
define('WP_AUTO_UPDATE_CORE', 'minor');

// Performance optimizations
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');
define('EMPTY_TRASH_DAYS', 7);
define('WP_POST_REVISIONS', 5);
define('AUTOSAVE_INTERVAL', 300);

// Database optimizations
define('WP_ALLOW_REPAIR', false);

// CORS headers for GraphQL
if (!function_exists('add_cors_headers')) {
    function add_cors_headers() {
        $allowed_origins = [
            'https://saraivavision.com.br',
            'https://saraivavision-preview.vercel.app',
            'http://localhost:3000'
        ];
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
    
    add_action('init', 'add_cors_headers');
}

// Custom upload directory for better organization
if (!function_exists('custom_upload_directory')) {
    function custom_upload_directory($dir) {
        return array(
            'path'   => $dir['basedir'] . '/saraiva-vision',
            'url'    => $dir['baseurl'] . '/saraiva-vision',
            'subdir' => '/saraiva-vision',
        ) + $dir;
    }
}

// Optimize WordPress for headless usage
if (!function_exists('optimize_headless_wordpress')) {
    function optimize_headless_wordpress() {
        // Remove unnecessary WordPress features for headless
        remove_action('wp_head', 'wp_generator');
        remove_action('wp_head', 'wlwmanifest_link');
        remove_action('wp_head', 'rsd_link');
        remove_action('wp_head', 'wp_shortlink_wp_head');
        remove_action('wp_head', 'adjacent_posts_rel_link_wp_head');
        
        // Disable XML-RPC
        add_filter('xmlrpc_enabled', '__return_false');
        
        // Disable REST API for non-authenticated users (optional)
        // add_filter('rest_authentication_errors', function($result) {
        //     if (!empty($result)) {
        //         return $result;
        //     }
        //     if (!is_user_logged_in()) {
        //         return new WP_Error('rest_not_logged_in', 'You are not currently logged in.', array('status' => 401));
        //     }
        //     return $result;
        // });
    }
    
    add_action('init', 'optimize_headless_wordpress');
}

// Custom error logging
if (!function_exists('custom_error_handler')) {
    function custom_error_handler($errno, $errstr, $errfile, $errline) {
        if (!(error_reporting() & $errno)) {
            return false;
        }
        
        $error_message = "[" . date('Y-m-d H:i:s') . "] ";
        $error_message .= "Error: [$errno] $errstr in $errfile on line $errline\n";
        
        error_log($error_message, 3, '/var/log/wordpress/php-errors.log');
        
        return true;
    }
    
    set_error_handler('custom_error_handler');
}

// Health check endpoint
if (!function_exists('add_health_check_endpoint')) {
    function add_health_check_endpoint() {
        add_action('wp_ajax_nopriv_health_check', 'handle_health_check');
        add_action('wp_ajax_health_check', 'handle_health_check');
    }
    
    function handle_health_check() {
        $health_data = [
            'status' => 'healthy',
            'timestamp' => current_time('mysql'),
            'version' => get_bloginfo('version'),
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
            'memory_limit' => ini_get('memory_limit')
        ];
        
        wp_send_json($health_data);
    }
    
    add_action('init', 'add_health_check_endpoint');
}

// GraphQL query complexity limits
if (!function_exists('limit_graphql_query_complexity')) {
    function limit_graphql_query_complexity() {
        add_filter('graphql_query_analyzer_max_query_complexity', function() {
            return 1000; // Adjust based on your needs
        });
        
        add_filter('graphql_query_analyzer_max_query_depth', function() {
            return 15; // Adjust based on your needs
        });
    }
    
    add_action('init', 'limit_graphql_query_complexity');
}

// Custom post types for clinic content
if (!function_exists('register_clinic_post_types')) {
    function register_clinic_post_types() {
        // Services post type
        register_post_type('services', [
            'labels' => [
                'name' => 'Services',
                'singular_name' => 'Service',
                'menu_name' => 'Services',
                'add_new' => 'Add New Service',
                'add_new_item' => 'Add New Service',
                'edit_item' => 'Edit Service',
                'new_item' => 'New Service',
                'view_item' => 'View Service',
                'search_items' => 'Search Services',
                'not_found' => 'No services found',
                'not_found_in_trash' => 'No services found in trash'
            ],
            'public' => true,
            'has_archive' => true,
            'menu_icon' => 'dashicons-admin-tools',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'service',
            'graphql_plural_name' => 'services',
            'rewrite' => ['slug' => 'servicos']
        ]);
        
        // Team Members post type
        register_post_type('team_members', [
            'labels' => [
                'name' => 'Team Members',
                'singular_name' => 'Team Member',
                'menu_name' => 'Team',
                'add_new' => 'Add New Member',
                'add_new_item' => 'Add New Team Member',
                'edit_item' => 'Edit Team Member',
                'new_item' => 'New Team Member',
                'view_item' => 'View Team Member',
                'search_items' => 'Search Team Members',
                'not_found' => 'No team members found',
                'not_found_in_trash' => 'No team members found in trash'
            ],
            'public' => true,
            'has_archive' => true,
            'menu_icon' => 'dashicons-groups',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'teamMember',
            'graphql_plural_name' => 'teamMembers',
            'rewrite' => ['slug' => 'equipe']
        ]);
        
        // Testimonials post type
        register_post_type('testimonials', [
            'labels' => [
                'name' => 'Testimonials',
                'singular_name' => 'Testimonial',
                'menu_name' => 'Testimonials',
                'add_new' => 'Add New Testimonial',
                'add_new_item' => 'Add New Testimonial',
                'edit_item' => 'Edit Testimonial',
                'new_item' => 'New Testimonial',
                'view_item' => 'View Testimonial',
                'search_items' => 'Search Testimonials',
                'not_found' => 'No testimonials found',
                'not_found_in_trash' => 'No testimonials found in trash'
            ],
            'public' => true,
            'has_archive' => true,
            'menu_icon' => 'dashicons-format-quote',
            'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
            'show_in_rest' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'testimonial',
            'graphql_plural_name' => 'testimonials',
            'rewrite' => ['slug' => 'depoimentos']
        ]);
    }
    
    add_action('init', 'register_clinic_post_types');
}

// Flush rewrite rules on activation
if (!function_exists('flush_rewrite_rules_on_activation')) {
    function flush_rewrite_rules_on_activation() {
        register_clinic_post_types();
        flush_rewrite_rules();
    }
    
    register_activation_hook(__FILE__, 'flush_rewrite_rules_on_activation');
}