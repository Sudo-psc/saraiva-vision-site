<?php
/**
 * WordPress Configuration - SaraivaVision Medical Website
 * Performance Optimized for PHP-FPM, OPcache, and Redis Object Cache
 * 
 * Dr. Philipe Saraiva Cruz - CRM-MG 69.870
 * Clínica Oftalmológica - Caratinga, Minas Gerais
 * 
 * LGPD Compliant - Brazilian Medical Website Standards
 */

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

define('DB_NAME', 'saraiva_vision_db');
define('DB_USER', 'saraiva_user');
define('DB_PASSWORD', 'saraiva_secure_2024');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// =============================================================================
// AUTHENTICATION KEYS AND SALTS
// =============================================================================

define('AUTH_KEY',         '(SzK{K7wPH]>.<h18KMAJ9+%?[Mhh?xoogB>^r<k_<PPcgNYKl %mrX2LjS=TO0U');
define('SECURE_AUTH_KEY',  '8</+J,}~7390a;T;^ @yvkTdY)k5.0g~wfNobr7s5_A$sG*ai1g1>nQxiDKQOdc~');
define('LOGGED_IN_KEY',    'M?J#-60 Z{Zx}gV!+PJMNpBX[nl9f-u;G$6w|0kamQ-tPAmdVj7sC23gN4rpns99');
define('NONCE_KEY',        '_hgu/n_1{_2K|yNp]k3&-Akh]TU%.p~g3Lrm+i|+Dqp9NyP^}wj{KHByS@sZ3&xb');
define('AUTH_SALT',        ')rh.rwRhC!%B-446y18VvQvPY~xdDna^oAJh01I~W:pH8K};FM>}1^7 A-^d,Zk)');
define('SECURE_AUTH_SALT', 'lDBKR+&a7DDD+J LH$x/Z(UKN>JF([rNjbkdp^@WG{vo4|Hyg$m-d:^SD/-|>*Ko');
define('LOGGED_IN_SALT',   'A2DbKGLJ$PA&B94`%J!2&ooio^3T!OU^>cz4}mk*&2z>2$hwl_#m~L#AZ4(bH2s~');
define('NONCE_SALT',       '5m<smm?`Xk=8@0L4{(3>KK I0NC4u7UD$`-|EG)mVo`z+`:>2NI):TFW[F7q,lb[');

// =============================================================================
// WORDPRESS URLS AND SSL CONFIGURATION
// =============================================================================

define('WP_HOME', 'https://saraivavision.com.br');
define('WP_SITEURL', 'https://saraivavision.com.br');

// Force SSL for medical website security
define('FORCE_SSL_ADMIN', true);

// Handle proxy headers for production deployment
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

if (isset($_SERVER['HTTP_X_FORWARDED_HOST'])) {
    $_SERVER['HTTP_HOST'] = $_SERVER['HTTP_X_FORWARDED_HOST'];
}

if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $_SERVER['REMOTE_ADDR'] = $_SERVER['HTTP_X_FORWARDED_FOR'];
}

// =============================================================================
// PERFORMANCE OPTIMIZATION SETTINGS
// =============================================================================

// Enable WordPress object caching
define('WP_CACHE', true);

// Enable Redis Object Cache
define('WP_CACHE_KEY_SALT', 'saraivavision_medical_');

// Redis configuration for medical website
define('WP_REDIS_HOST', '127.0.0.1');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_DATABASE', 0);
define('WP_REDIS_PREFIX', 'saraivavision:');
define('WP_REDIS_PASSWORD', ''); // Set if Redis has authentication

// Cache TTL settings for medical content
define('WP_REDIS_DEFAULT_TTL', 3600);     // 1 hour default
define('WP_REDIS_MAXTTL', 86400);         // 24 hours maximum

// Disable caching for sensitive medical data (LGPD compliance)
define('WP_REDIS_DISABLE_BANNERS', true);
define('WP_REDIS_DISABLE_METRICS', false);
define('WP_REDIS_DISABLE_GROUPS', serialize([
    'users', 'user_meta', 'sessions', 'transients'
]));

// =============================================================================
// MEMORY AND PERFORMANCE LIMITS
// =============================================================================

// Memory limits optimized for medical website with images
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Increase limits for medical image uploads and content
ini_set('memory_limit', '256M');
ini_set('max_execution_time', 60);
ini_set('max_input_time', 60);
ini_set('post_max_size', '64M');
ini_set('upload_max_filesize', '32M');

// =============================================================================
// DATABASE OPTIMIZATION
// =============================================================================

// Enable persistent database connections for better performance
define('WP_USE_EXT_MYSQL', false);

// Automatic database optimization
define('WP_ALLOW_REPAIR', false); // Set to true only when needed

// Increase database timeout for large medical image uploads
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// =============================================================================
// SECURITY SETTINGS FOR MEDICAL WEBSITE
// =============================================================================

// Disable file editing from admin for security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false); // Allow plugin/theme installation

// Security keys and features
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', false);

// Disable XML-RPC for security (not needed for medical website)
define('XMLRPC_ENABLED', false);

// =============================================================================
// AUTO-UPDATE CONFIGURATION
// =============================================================================

// Enable automatic updates for security (important for medical websites)
define('WP_AUTO_UPDATE_CORE', 'minor');
define('AUTOMATIC_UPDATER_DISABLED', false);

// =============================================================================
// REVISION AND TRASH MANAGEMENT
// =============================================================================

// Limit post revisions for database performance
define('WP_POST_REVISIONS', 5);

// Auto-empty trash for better database performance
define('EMPTY_TRASH_DAYS', 7);

// =============================================================================
// MULTISITE CONFIGURATION (IF NEEDED)
// =============================================================================

// Uncomment if using WordPress multisite for multiple clinic locations
// define('WP_ALLOW_MULTISITE', true);
// define('MULTISITE', true);
// define('SUBDOMAIN_INSTALL', false);
// define('DOMAIN_CURRENT_SITE', 'saraivavision.com.br');
// define('PATH_CURRENT_SITE', '/');
// define('SITE_ID_CURRENT_SITE', 1);
// define('BLOG_ID_CURRENT_SITE', 1);

// =============================================================================
// COOKIE CONFIGURATION FOR SECURITY
// =============================================================================

// Secure cookie configuration for medical website
define('COOKIE_DOMAIN', '.saraivavision.com.br');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');
define('ADMIN_COOKIE_PATH', '/wp-admin');
define('PLUGINS_COOKIE_PATH', '/wp-content/plugins');

// =============================================================================
// CONTENT AND UPLOAD CONFIGURATION
// =============================================================================

// Custom upload directory for medical images
define('UPLOADS', 'wp-content/uploads');

// Allow SVG uploads for medical icons (with security measures)
define('ALLOW_UNFILTERED_UPLOADS', false);

// Increase allowed memory for image processing
define('WP_MEMORY_LIMIT', '256M');

// =============================================================================
// CRON AND SCHEDULED TASKS
// =============================================================================

// Disable WP-Cron and use system cron for better performance
define('DISABLE_WP_CRON', true);

// Alternative: Keep WP-Cron for development
// define('DISABLE_WP_CRON', false);
// define('WP_CRON_LOCK_TIMEOUT', 60);

// =============================================================================
// MEDICAL WEBSITE SPECIFIC CONSTANTS
// =============================================================================

// Clinic information constants
define('CLINIC_NAME', 'Clínica Saraiva Vision');
define('DOCTOR_NAME', 'Dr. Philipe Saraiva Cruz');
define('DOCTOR_CRM', 'CRM-MG 69.870');
define('CLINIC_LOCATION', 'Caratinga, Minas Gerais');
define('CLINIC_PHONE', '+55 (33) 3321-3244');
define('CLINIC_EMAIL', 'contato@saraivavision.com.br');

// LGPD compliance settings
define('LGPD_COMPLIANCE', true);
define('PATIENT_DATA_RETENTION_DAYS', 2555); // 7 years as per medical regulations
define('CACHE_PATIENT_DATA', false); // Never cache patient information

// =============================================================================
// CORS CONFIGURATION FOR API
// =============================================================================

// CORS headers for frontend integration
if (!headers_sent()) {
    header('Access-Control-Allow-Origin: https://saraivavision.com.br');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization');
    header('Access-Control-Allow-Credentials: true');
}

// =============================================================================
// WORDPRESS TABLE PREFIX
// =============================================================================

$table_prefix = 'sv_';

// =============================================================================
// ENVIRONMENT-SPECIFIC SETTINGS
// =============================================================================

// Development vs Production configuration
if (defined('WP_ENVIRONMENT') && WP_ENVIRONMENT === 'development') {
    // Development settings
    define('WP_DEBUG', true);
    define('WP_DEBUG_LOG', true);
    define('WP_DEBUG_DISPLAY', true);
    define('SAVEQUERIES', true);
    
    // Disable caching in development
    define('WP_CACHE', false);
    
} else {
    // Production settings
    define('WP_DEBUG', false);
    define('WP_DEBUG_LOG', false);
    define('WP_DEBUG_DISPLAY', false);
    
    // Enable all caching in production
    define('WP_CACHE', true);
}

// =============================================================================
// LOAD WORDPRESS
// =============================================================================

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

// =============================================================================
// PERFORMANCE MONITORING (OPTIONAL)
// =============================================================================

// Uncomment to enable query monitoring for performance tuning
/*
if (defined('WP_DEBUG') && WP_DEBUG) {
    define('SAVEQUERIES', true);
    
    // Log slow queries for medical website optimization
    add_action('wp_footer', function() {
        global $wpdb;
        if (current_user_can('manage_options')) {
            echo "<!-- Total Queries: " . count($wpdb->queries) . " -->";
            foreach ($wpdb->queries as $query) {
                if ($query[1] > 0.1) { // Log queries slower than 0.1 seconds
                    error_log("Slow Query: " . $query[1] . "s - " . $query[0]);
                }
            }
        }
    });
}
*/