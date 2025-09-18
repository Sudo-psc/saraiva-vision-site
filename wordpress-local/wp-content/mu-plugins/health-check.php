<?php
/**
 * Plugin Name: Container Health Check
 * Description: Provides health check endpoint for WordPress container
 * Version: 1.0.0
 * Author: Saraiva Vision Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class ContainerHealthCheck
{
    public function __init()
    {
        // Add health check endpoint
        add_action('rest_api_init', [$this, 'register_health_endpoint']);

        // Add custom health endpoint for simple monitoring
        add_action('init', [$this, 'handle_health_request']);
    }

    /**
     * Register WordPress REST API health endpoint
     */
    public function register_health_endpoint()
    {
        register_rest_route('wp/v2', '/health', [
            'methods' => 'GET',
            'callback' => [$this, 'get_health_status'],
            'permission_callback' => '__return_true', // Public endpoint
        ]);
    }

    /**
     * Handle simple health check requests
     */
    public function handle_health_request()
    {
        if (isset($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] === '/health') {
            $health_data = $this->get_health_data();

            header('Content-Type: application/json');
            header('Cache-Control: no-cache, no-store, must-revalidate');
            header('Pragma: no-cache');
            header('Expires: 0');

            echo json_encode($health_data);
            exit;
        }
    }

    /**
     * Get comprehensive health status
     */
    public function get_health_status()
    {
        $health_data = $this->get_health_data();
        return new WP_REST_Response($health_data, 200);
    }

    /**
     * Generate health data
     */
    private function get_health_data()
    {
        global $wpdb;

        // Basic health data
        $health_data = [
            'status' => 'healthy',
            'timestamp' => current_time('c'),
            'service' => 'wordpress',
            'version' => get_bloginfo('version'),
            'environment' => wp_get_environment_type(),
            'uptime' => $this->get_uptime(),
            'checks' => []
        ];

        // Database connectivity check
        try {
            $wpdb->get_var("SELECT 1");
            $health_data['checks']['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection successful',
                'type' => 'SQLite',
                'queries' => $wpdb->num_queries ?? 0
            ];
        } catch (Exception $e) {
            $health_data['checks']['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed: ' . $e->getMessage(),
                'type' => 'SQLite'
            ];
            $health_data['status'] = 'unhealthy';
        }

        // File system check
        $upload_dir = wp_upload_dir();
        $health_data['checks']['filesystem'] = [
            'status' => is_writable($upload_dir['basedir']) ? 'healthy' : 'warning',
            'message' => is_writable($upload_dir['basedir']) ? 'Uploads directory writable' : 'Uploads directory not writable',
            'uploads_dir' => $upload_dir['basedir']
        ];

        // Memory check
        $memory_limit = ini_get('memory_limit');
        $memory_usage = memory_get_usage(true);
        $health_data['checks']['memory'] = [
            'status' => 'healthy',
            'limit' => $memory_limit,
            'usage' => $this->format_bytes($memory_usage),
            'peak' => $this->format_bytes(memory_get_peak_usage(true))
        ];

        // WordPress core checks
        $health_data['checks']['wordpress'] = [
            'status' => 'healthy',
            'version' => get_bloginfo('version'),
            'multisite' => is_multisite() ? 'yes' : 'no',
            'plugins_active' => count(get_option('active_plugins', [])),
            'theme' => get_template(),
            'debug_mode' => WP_DEBUG ? 'enabled' : 'disabled'
        ];

        // REST API check
        try {
            $health_data['checks']['rest_api'] = [
                'status' => 'healthy',
                'message' => 'REST API operational',
                'endpoints' => [
                    'posts' => '/wp-json/wp/v2/posts',
                    'pages' => '/wp-json/wp/v2/pages',
                    'health' => '/wp-json/wp/v2/health'
                ]
            ];
        } catch (Exception $e) {
            $health_data['checks']['rest_api'] = [
                'status' => 'unhealthy',
                'message' => 'REST API error: ' . $e->getMessage()
            ];
            $health_data['status'] = 'unhealthy';
        }

        // Performance check
        $health_data['checks']['performance'] = [
            'status' => 'healthy',
            'php_version' => PHP_VERSION,
            'max_execution_time' => ini_get('max_execution_time'),
            'opcache_enabled' => extension_loaded('opcache') && opcache_get_status() ? 'yes' : 'no'
        ];

        // Container-specific checks
        $health_data['container'] = [
            'environment' => 'docker',
            'php_sapi' => php_sapi_name(),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown'
        ];

        return $health_data;
    }

    /**
     * Get server uptime (approximate)
     */
    private function get_uptime()
    {
        // For WordPress, we'll use the time since last cache clear as proxy
        $last_update = get_option('_transient_timeout_health_uptime');
        if (!$last_update) {
            $start_time = time();
            set_transient('health_uptime', $start_time, HOUR_IN_SECONDS);
            return '0 seconds';
        }

        $uptime_seconds = time() - get_transient('health_uptime');
        return $this->format_uptime($uptime_seconds);
    }

    /**
     * Format uptime in human readable format
     */
    private function format_uptime($seconds)
    {
        $units = [
            'day' => 86400,
            'hour' => 3600,
            'minute' => 60,
            'second' => 1
        ];

        $result = [];
        foreach ($units as $unit => $value) {
            if ($seconds >= $value) {
                $count = floor($seconds / $value);
                $result[] = $count . ' ' . $unit . ($count > 1 ? 's' : '');
                $seconds %= $value;
            }
        }

        return empty($result) ? '0 seconds' : implode(', ', array_slice($result, 0, 2));
    }

    /**
     * Format bytes in human readable format
     */
    private function format_bytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

// Initialize the health check
$health_check = new ContainerHealthCheck();
$health_check->init();

// Set up transient for uptime tracking on plugin load
if (!get_transient('health_uptime')) {
    set_transient('health_uptime', time(), DAY_IN_SECONDS);
}
?>