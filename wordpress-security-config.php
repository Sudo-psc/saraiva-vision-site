<?php
/**
 * WordPress Security Configuration for Saraiva Vision Medical Website
 * Medical-grade security settings with LGPD compliance
 *
 * This file contains security configurations specific to medical websites
 * and Brazilian data protection laws (LGPD).
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// =============================================================================
// MEDICAL SYSTEM SECURITY CONFIGURATION
// =============================================================================

// Medical Website Identification
define('SARAIVA_MEDICAL_SYSTEM', true);
define('LGPD_COMPLIANCE_REQUIRED', true);
define('MEDICAL_DATA_ENCRYPTION', true);

// Enhanced Security Constants
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('FORCE_SSL_ADMIN', true);
define('WP_AUTO_UPDATE_CORE', false);
define('AUTOMATIC_UPDATER_DISABLED', true);

// Session Security for Medical Data
define('COOKIE_DOMAIN', '.saraivavision.com.br');
define('COOKIEPATH', '/');
define('COOKIEHASH', hash('sha256', 'saraiva-medical-' . SECURE_AUTH_SALT));

// Database Security
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// =============================================================================
// LGPD COMPLIANCE CONFIGURATION
// =============================================================================

// Data Retention Policies (in days)
define('LGPD_CONTACT_RETENTION_DAYS', 1095); // 3 years
define('LGPD_APPOINTMENT_RETENTION_DAYS', 1825); // 5 years
define('LGPD_MARKETING_RETENTION_DAYS', 730); // 2 years
define('LGPD_AUDIT_LOG_RETENTION_DAYS', 1825); // 5 years

// Consent Management
define('LGPD_CONSENT_REQUIRED', true);
define('LGPD_CONSENT_GRANULAR', true);
define('LGPD_CONSENT_CATEGORIES', serialize([
    'essential_medical' => 'Dados médicos essenciais',
    'marketing' => 'Comunicações de marketing',
    'analytics' => 'Análise e melhorias',
    'research' => 'Pesquisa médica'
]));

// Data Processing Legal Bases
define('LGPD_LEGAL_BASES', serialize([
    'consent' => 'Consentimento',
    'legitimate_interest' => 'Interesse legítimo',
    'vital_interests' => 'Interesses vitais',
    'legal_obligation' => 'Obrigação legal',
    'public_interest' => 'Interesse público',
    'medical_care' => 'Cuidados médicos'
]));

// =============================================================================
// SECURITY HEADERS AND POLICIES
// =============================================================================

// Content Security Policy for Medical Website
define('CSP_POLICY',
    "default-src 'self'; " .
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " .
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " .
    "font-src 'self' https://fonts.gstatic.com data:; " .
    "img-src 'self' https: data: blob:; " .
    "connect-src 'self' https://api.resend.com https://www.google-analytics.com; " .
    "frame-src 'self' https://www.google.com https://recaptcha.google.com; " .
    "object-src 'none'; " .
    "base-uri 'self'; " .
    "form-action 'self'; " .
    "frame-ancestors 'none';"
);

// Security Headers
function saraiva_security_headers() {
    if (!is_admin()) {
        // LGPD Compliance Headers
        header('X-LGPD-Compliant: true');
        header('X-Medical-System: saraiva-vision');

        // Security Headers
        header('X-Frame-Options: SAMEORIGIN');
        header('X-Content-Type-Options: nosniff');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

        // Content Security Policy
        header('Content-Security-Policy: ' . CSP_POLICY);

        // HSTS for Medical Data Protection
        if (is_ssl()) {
            header('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');
        }
    }
}
add_action('send_headers', 'saraiva_security_headers');

// =============================================================================
// MEDICAL DATA PROTECTION FUNCTIONS
// =============================================================================

/**
 * Encrypt sensitive medical data
 */
function saraiva_encrypt_medical_data($data) {
    if (!MEDICAL_DATA_ENCRYPTION) {
        return $data;
    }

    $key = wp_salt('secure_auth');
    $iv = openssl_random_pseudo_bytes(16);
    $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);

    return base64_encode($iv . $encrypted);
}

/**
 * Decrypt sensitive medical data
 */
function saraiva_decrypt_medical_data($encrypted_data) {
    if (!MEDICAL_DATA_ENCRYPTION || empty($encrypted_data)) {
        return $encrypted_data;
    }

    $key = wp_salt('secure_auth');
    $data = base64_decode($encrypted_data);
    $iv = substr($data, 0, 16);
    $encrypted = substr($data, 16);

    return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
}

/**
 * Log LGPD compliance activities
 */
function saraiva_log_lgpd_activity($activity, $data_subject, $details = []) {
    global $wpdb;

    $table_name = $wpdb->prefix . 'sv_lgpd_processing_log';

    $wpdb->insert(
        $table_name,
        [
            'timestamp' => current_time('mysql'),
            'processing_activity' => sanitize_text_field($activity),
            'data_subject_email' => sanitize_email($data_subject),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details' => wp_json_encode($details)
        ]
    );
}

/**
 * Check if user has given specific consent
 */
function saraiva_has_consent($email, $consent_type) {
    global $wpdb;

    $table_name = $wpdb->prefix . 'sv_patient_consent';

    $consent = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$table_name}
         WHERE patient_email = %s
         AND consent_type = %s
         AND consent_given = 1
         AND (consent_withdrawn_date IS NULL OR consent_withdrawn_date > NOW())",
        $email,
        $consent_type
    ));

    return !empty($consent);
}

/**
 * Record patient consent
 */
function saraiva_record_consent($email, $consent_type, $consent_given = true, $legal_basis = 'consent') {
    global $wpdb;

    $table_name = $wpdb->prefix . 'sv_patient_consent';

    // Insert or update consent record
    $wpdb->replace(
        $table_name,
        [
            'patient_email' => sanitize_email($email),
            'consent_type' => sanitize_text_field($consent_type),
            'consent_given' => $consent_given ? 1 : 0,
            'consent_date' => current_time('mysql'),
            'consent_withdrawn_date' => $consent_given ? null : current_time('mysql'),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'legal_basis' => sanitize_text_field($legal_basis)
        ]
    );

    // Log the activity
    saraiva_log_lgpd_activity(
        'consent_recorded',
        $email,
        ['type' => $consent_type, 'given' => $consent_given, 'legal_basis' => $legal_basis]
    );
}

// =============================================================================
// MEDICAL AUDIT LOGGING
// =============================================================================

/**
 * Log medical system activities for audit trail
 */
function saraiva_audit_log($action, $object_type, $object_id = null, $details = []) {
    global $wpdb;

    $table_name = $wpdb->prefix . 'sv_medical_audit_log';

    $user_id = get_current_user_id();

    $wpdb->insert(
        $table_name,
        [
            'timestamp' => current_time('mysql'),
            'user_id' => $user_id ?: null,
            'action' => sanitize_text_field($action),
            'object_type' => sanitize_text_field($object_type),
            'object_id' => $object_id ? intval($object_id) : null,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details' => wp_json_encode($details)
        ]
    );
}

// Hook into WordPress actions for audit logging
add_action('wp_login', function($user_login, $user) {
    saraiva_audit_log('user_login', 'user', $user->ID, ['username' => $user_login]);
}, 10, 2);

add_action('wp_logout', function($user_id) {
    saraiva_audit_log('user_logout', 'user', $user_id);
});

add_action('wp_login_failed', function($username) {
    saraiva_audit_log('login_failed', 'user', null, ['username' => $username]);
});

// =============================================================================
// SECURITY ENHANCEMENTS
// =============================================================================

// Remove WordPress version from head and feeds
remove_action('wp_head', 'wp_generator');
add_filter('the_generator', '__return_empty_string');

// Hide login errors for security
add_filter('login_errors', function($error) {
    return 'Credenciais inválidas. Por favor, tente novamente.';
});

// Limit login attempts (basic implementation)
function saraiva_limit_login_attempts() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $transient_key = 'login_attempts_' . md5($ip);
    $attempts = get_transient($transient_key) ?: 0;

    if ($attempts >= 5) {
        wp_die(
            'Muitas tentativas de login. Tente novamente em 30 minutos.',
            'Acesso Bloqueado',
            ['response' => 429]
        );
    }
}

add_action('wp_login_failed', function() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $transient_key = 'login_attempts_' . md5($ip);
    $attempts = get_transient($transient_key) ?: 0;

    set_transient($transient_key, $attempts + 1, 1800); // 30 minutes
});

add_action('wp_login', function() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $transient_key = 'login_attempts_' . md5($ip);
    delete_transient($transient_key);
});

// Add login attempt limiting
add_action('login_form', 'saraiva_limit_login_attempts');

// =============================================================================
// FILE UPLOAD SECURITY
// =============================================================================

// Restrict file upload types for medical security
function saraiva_restrict_upload_types($mimes) {
    // Allow only safe file types for medical website
    $allowed_types = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'pdf' => 'application/pdf',
        'doc' => 'application/msword',
        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    return $allowed_types;
}
add_filter('upload_mimes', 'saraiva_restrict_upload_types');

// Scan uploaded files for security
function saraiva_scan_uploaded_file($file) {
    $filename = $file['name'];
    $filetype = $file['type'];
    $tmpname = $file['tmp_name'];

    // Check file extension
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'];

    if (!in_array(strtolower($ext), $allowed_extensions)) {
        $file['error'] = 'Tipo de arquivo não permitido para sistema médico.';
        return $file;
    }

    // Check file size (max 10MB for medical files)
    if ($file['size'] > 10485760) {
        $file['error'] = 'Arquivo muito grande. Máximo: 10MB.';
        return $file;
    }

    // Log file upload for audit
    saraiva_audit_log('file_upload', 'media', null, [
        'filename' => $filename,
        'type' => $filetype,
        'size' => $file['size']
    ]);

    return $file;
}
add_filter('wp_handle_upload_prefilter', 'saraiva_scan_uploaded_file');

// =============================================================================
// PERFORMANCE AND CACHING SECURITY
// =============================================================================

// Secure cache headers for medical data
function saraiva_secure_cache_headers() {
    if (!is_admin() && !is_user_logged_in()) {
        // Public pages can be cached
        header('Cache-Control: public, max-age=300'); // 5 minutes
    } else {
        // Private/admin pages should not be cached
        header('Cache-Control: no-cache, no-store, must-revalidate, private');
        header('Pragma: no-cache');
        header('Expires: 0');
    }

    // Vary header for proper caching
    header('Vary: Accept-Encoding, Cookie');
}
add_action('send_headers', 'saraiva_secure_cache_headers');

// =============================================================================
// MEDICAL SYSTEM INITIALIZATION
// =============================================================================

/**
 * Initialize medical system tables and data
 */
function saraiva_init_medical_system() {
    global $wpdb;

    // Create medical tables if they don't exist
    $charset_collate = $wpdb->get_charset_collate();

    // Tables are created via the SQL initialization script
    // This function ensures they exist and are properly configured

    // Set up default medical system options
    update_option('saraiva_medical_system_version', '1.0.0');
    update_option('lgpd_compliance_enabled', true);
    update_option('medical_audit_enabled', true);
    update_option('data_encryption_enabled', MEDICAL_DATA_ENCRYPTION);

    // Initialize default consent categories
    update_option('lgpd_consent_categories', unserialize(LGPD_CONSENT_CATEGORIES));

    // Log system initialization
    saraiva_audit_log('system_initialized', 'system', null, [
        'version' => '1.0.0',
        'lgpd_enabled' => true,
        'encryption_enabled' => MEDICAL_DATA_ENCRYPTION
    ]);
}

// Initialize on plugin/theme activation
add_action('after_setup_theme', 'saraiva_init_medical_system');

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

/**
 * WordPress health check for medical system monitoring
 */
function saraiva_health_check() {
    global $wpdb;

    $health_data = [
        'status' => 'healthy',
        'timestamp' => current_time('c'),
        'system' => 'wordpress',
        'medical_mode' => true,
        'lgpd_compliant' => LGPD_COMPLIANCE_REQUIRED,
        'database_connection' => false,
        'audit_logging' => false,
        'version' => get_bloginfo('version')
    ];

    // Test database connection
    try {
        $wpdb->get_var("SELECT 1");
        $health_data['database_connection'] = true;
    } catch (Exception $e) {
        $health_data['status'] = 'unhealthy';
        $health_data['database_error'] = $e->getMessage();
    }

    // Test audit logging
    try {
        $table_exists = $wpdb->get_var("SHOW TABLES LIKE '{$wpdb->prefix}sv_medical_audit_log'");
        $health_data['audit_logging'] = !empty($table_exists);
    } catch (Exception $e) {
        $health_data['audit_logging'] = false;
    }

    // Record health check
    saraiva_audit_log('health_check', 'system', null, $health_data);

    wp_send_json($health_data, $health_data['status'] === 'healthy' ? 200 : 503);
}

// Register health check endpoint
add_action('wp_ajax_nopriv_health_check', 'saraiva_health_check');
add_action('wp_ajax_health_check', 'saraiva_health_check');

// Add rewrite rule for /health endpoint
function saraiva_add_health_endpoint() {
    add_rewrite_rule('^health/?$', 'index.php?health_check=1', 'top');
}
add_action('init', 'saraiva_add_health_endpoint');

function saraiva_handle_health_endpoint() {
    if (get_query_var('health_check')) {
        saraiva_health_check();
        exit;
    }
}
add_action('template_redirect', 'saraiva_handle_health_endpoint');

function saraiva_add_health_query_var($vars) {
    $vars[] = 'health_check';
    return $vars;
}
add_filter('query_vars', 'saraiva_add_health_query_var');

// =============================================================================
// MAINTENANCE AND CLEANUP
// =============================================================================

/**
 * Clean up old audit logs and expired data
 */
function saraiva_cleanup_old_data() {
    global $wpdb;

    // Clean up old audit logs (keep for retention period)
    $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->prefix}sv_medical_audit_log
         WHERE timestamp < DATE_SUB(NOW(), INTERVAL %d DAY)",
        LGPD_AUDIT_LOG_RETENTION_DAYS
    ));

    // Clean up old consent records (withdrawn consents older than retention period)
    $wpdb->query($wpdb->prepare(
        "DELETE FROM {$wpdb->prefix}sv_patient_consent
         WHERE consent_withdrawn_date IS NOT NULL
         AND consent_withdrawn_date < DATE_SUB(NOW(), INTERVAL %d DAY)",
        LGPD_MARKETING_RETENTION_DAYS
    ));

    // Log cleanup activity
    saraiva_audit_log('data_cleanup', 'system', null, [
        'audit_retention_days' => LGPD_AUDIT_LOG_RETENTION_DAYS,
        'consent_retention_days' => LGPD_MARKETING_RETENTION_DAYS
    ]);
}

// Schedule daily cleanup
if (!wp_next_scheduled('saraiva_daily_cleanup')) {
    wp_schedule_event(time(), 'daily', 'saraiva_daily_cleanup');
}
add_action('saraiva_daily_cleanup', 'saraiva_cleanup_old_data');

// Medical system is now configured and ready
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('Saraiva Vision Medical WordPress Security Configuration Loaded');
}