<?php
/**
 * WordPress CORS Fix for REST API
 * Add this to wp-content/themes/[active-theme]/functions.php
 * or create as a mu-plugin in wp-content/mu-plugins/
 */

// Enable CORS for REST API
function saraiva_vision_enable_cors() {
    // Remove any existing CORS headers
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    
    // Add our custom CORS headers
    add_filter('rest_pre_serve_request', function($value) {
        // Get the origin
        $origin = get_http_origin();
        
        // List of allowed origins
        $allowed_origins = array(
            'https://saraivavision.com.br',
            'https://www.saraivavision.com.br',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        );
        
        // If origin is in allowed list or we want to allow all
        if (in_array($origin, $allowed_origins) || true) { // Set to true to allow all origins
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With, Accept, Origin');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
            header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link');
        }
        
        return $value;
    });
}
add_action('rest_api_init', 'saraiva_vision_enable_cors', 15);

// Handle OPTIONS requests
function saraiva_vision_handle_options_request() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With, Accept, Origin');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        header('Content-Length: 0');
        header('Content-Type: text/plain');
        exit(0);
    }
}
add_action('init', 'saraiva_vision_handle_options_request', 1);

// Ensure REST API is accessible
function saraiva_vision_rest_api_init() {
    // Force enable REST API
    add_filter('rest_enabled', '__return_true');
    add_filter('rest_jsonp_enabled', '__return_true');
    
    // Allow REST API for all users (including non-logged in)
    add_filter('rest_authentication_errors', function($result) {
        // If a previous authentication check was successful, respect that
        if (true === $result || is_wp_error($result)) {
            return $result;
        }
        
        // No authentication required for read operations
        if ('GET' === $_SERVER['REQUEST_METHOD']) {
            return true;
        }
        
        return $result;
    });
}
add_action('init', 'saraiva_vision_rest_api_init');

// Fix REST API URL for proxy setup
function saraiva_vision_fix_rest_url($url) {
    // If we're being accessed via the proxy, fix the URL
    if (strpos($_SERVER['HTTP_HOST'], 'saraivavision.com.br') !== false) {
        $url = str_replace('http://127.0.0.1:8083', 'https://saraivavision.com.br', $url);
        $url = str_replace('http://localhost:8083', 'https://saraivavision.com.br', $url);
    }
    return $url;
}
add_filter('rest_url', 'saraiva_vision_fix_rest_url', 10, 1);

// Add custom REST API endpoints for testing
function saraiva_vision_register_test_routes() {
    register_rest_route('saraiva-vision/v1', '/test', array(
        'methods' => 'GET',
        'callback' => function() {
            return array(
                'status' => 'ok',
                'message' => 'REST API is working!',
                'timestamp' => current_time('mysql'),
                'site_url' => get_site_url(),
                'rest_url' => get_rest_url()
            );
        },
        'permission_callback' => '__return_true' // Public access
    ));
    
    register_rest_route('saraiva-vision/v1', '/posts', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $args = array(
                'post_type' => 'post',
                'post_status' => 'publish',
                'posts_per_page' => $request->get_param('per_page') ?: 10,
                'paged' => $request->get_param('page') ?: 1
            );
            
            $posts = get_posts($args);
            $formatted_posts = array();
            
            foreach($posts as $post) {
                $formatted_posts[] = array(
                    'id' => $post->ID,
                    'title' => $post->post_title,
                    'slug' => $post->post_name,
                    'excerpt' => wp_trim_words($post->post_content, 30),
                    'date' => $post->post_date,
                    'link' => get_permalink($post->ID),
                    'featured_image' => get_the_post_thumbnail_url($post->ID, 'medium')
                );
            }
            
            return $formatted_posts;
        },
        'permission_callback' => '__return_true' // Public access
    ));
}
add_action('rest_api_init', 'saraiva_vision_register_test_routes');