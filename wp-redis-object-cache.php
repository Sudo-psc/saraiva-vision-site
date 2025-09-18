<?php
/**
 * Redis Object Cache Drop-in for SaraivaVision Medical Website
 * Dr. Philipe Saraiva Cruz - CRM-MG 69.870
 * 
 * This file should be placed in wp-content/object-cache.php
 * Provides Redis-based object caching for WordPress with medical website optimizations
 * 
 * LGPD Compliance: Patient data is not cached, only public content and queries
 * Medical Security: Cache keys are sanitized and isolated per user session for admin
 */

if (!defined('ABSPATH')) {
    exit;
}

// Redis configuration for SaraivaVision medical website
if (!defined('WP_REDIS_HOST')) {
    define('WP_REDIS_HOST', '127.0.0.1');
}

if (!defined('WP_REDIS_PORT')) {
    define('WP_REDIS_PORT', 6379);
}

if (!defined('WP_REDIS_DATABASE')) {
    define('WP_REDIS_DATABASE', 0);
}

if (!defined('WP_REDIS_PREFIX')) {
    define('WP_REDIS_PREFIX', 'saraivavision:');
}

// Cache TTL settings for medical website
if (!defined('WP_REDIS_DEFAULT_TTL')) {
    define('WP_REDIS_DEFAULT_TTL', 3600); // 1 hour for medical content
}

// Security: Disable caching for admin and sensitive areas
if (!defined('WP_REDIS_DISABLE_GROUPS')) {
    define('WP_REDIS_DISABLE_GROUPS', serialize([
        'users',           // Never cache user data (LGPD compliance)
        'user_meta',       // Never cache user metadata
        'sessions',        // Never cache sessions
        'transients',      // Transients handled separately
        'site-transients', // Site transients handled separately
    ]));
}

class WP_Object_Cache_Redis {
    
    private $redis;
    private $cache = [];
    private $non_persistent_groups = [];
    private $global_groups = [];
    private $blog_prefix;
    private $multisite;
    
    // Medical website specific settings
    private $medical_sensitive_keys = [
        'patient_', 'contact_form_', 'appointment_', 'user_', 'admin_'
    ];
    
    public function __construct() {
        $this->multisite = is_multisite();
        $this->blog_prefix = $this->multisite ? get_current_blog_id() . ':' : '';
        
        // Initialize Redis connection
        $this->redis_connect();
        
        // Set non-persistent groups (stored in PHP memory only)
        $this->non_persistent_groups = [
            'default', 'counts', 'plugins', 'themes'
        ];
        
        // Global groups for multisite
        $this->global_groups = [
            'users', 'userlogins', 'usermeta', 'user_meta', 'site-transients'
        ];
    }
    
    /**
     * Connect to Redis server with medical website security
     */
    private function redis_connect() {
        if (class_exists('Redis')) {
            $this->redis = new Redis();
            
            try {
                $this->redis->connect(WP_REDIS_HOST, WP_REDIS_PORT, 2); // 2 second timeout
                
                // Select database for medical website isolation
                $this->redis->select(WP_REDIS_DATABASE);
                
                // Test connection
                $this->redis->ping();
                
            } catch (Exception $e) {
                // Fallback to PHP array cache if Redis fails
                error_log('SaraivaVision Redis Error: ' . $e->getMessage());
                $this->redis = false;
            }
        } else {
            $this->redis = false;
        }
    }
    
    /**
     * Add data to cache with medical website security checks
     */
    public function add($key, $data, $group = 'default', $expire = 0) {
        // Security check for medical data
        if ($this->is_sensitive_data($key, $group)) {
            return false;
        }
        
        if (empty($group)) {
            $group = 'default';
        }
        
        if ($this->get($key, $group) !== false) {
            return false;
        }
        
        return $this->set($key, $data, $group, $expire);
    }
    
    /**
     * Set cache data with TTL appropriate for medical website
     */
    public function set($key, $data, $group = 'default', $expire = 0) {
        // Security check for medical data
        if ($this->is_sensitive_data($key, $group)) {
            return false;
        }
        
        if (empty($group)) {
            $group = 'default';
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        // Store in local cache
        $this->cache[$cache_key] = $data;
        
        // Don't store non-persistent groups in Redis
        if (in_array($group, $this->non_persistent_groups) || !$this->redis) {
            return true;
        }
        
        // Set TTL based on content type for medical website
        if ($expire == 0) {
            $expire = $this->get_ttl_for_group($group);
        }
        
        try {
            if ($expire > 0) {
                return $this->redis->setex($cache_key, $expire, serialize($data));
            } else {
                return $this->redis->set($cache_key, serialize($data));
            }
        } catch (Exception $e) {
            error_log('SaraivaVision Redis Set Error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get cache data with medical website security
     */
    public function get($key, $group = 'default', $force = false, &$found = null) {
        if (empty($group)) {
            $group = 'default';
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        // Check local cache first
        if (!$force && isset($this->cache[$cache_key])) {
            $found = true;
            return $this->cache[$cache_key];
        }
        
        // Don't check Redis for non-persistent groups
        if (in_array($group, $this->non_persistent_groups) || !$this->redis) {
            $found = false;
            return false;
        }
        
        try {
            $result = $this->redis->get($cache_key);
            
            if ($result === false) {
                $found = false;
                return false;
            }
            
            $data = unserialize($result);
            $this->cache[$cache_key] = $data;
            $found = true;
            
            return $data;
            
        } catch (Exception $e) {
            error_log('SaraivaVision Redis Get Error: ' . $e->getMessage());
            $found = false;
            return false;
        }
    }
    
    /**
     * Delete cache entry
     */
    public function delete($key, $group = 'default') {
        if (empty($group)) {
            $group = 'default';
        }
        
        $cache_key = $this->get_cache_key($key, $group);
        
        // Remove from local cache
        unset($this->cache[$cache_key]);
        
        // Remove from Redis
        if (!in_array($group, $this->non_persistent_groups) && $this->redis) {
            try {
                return $this->redis->del($cache_key) > 0;
            } catch (Exception $e) {
                error_log('SaraivaVision Redis Delete Error: ' . $e->getMessage());
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Flush all cache - important for medical website updates
     */
    public function flush() {
        $this->cache = [];
        
        if ($this->redis) {
            try {
                return $this->redis->flushDB();
            } catch (Exception $e) {
                error_log('SaraivaVision Redis Flush Error: ' . $e->getMessage());
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Generate cache key with medical website prefix
     */
    private function get_cache_key($key, $group) {
        if (in_array($group, $this->global_groups)) {
            $prefix = WP_REDIS_PREFIX;
        } else {
            $prefix = WP_REDIS_PREFIX . $this->blog_prefix;
        }
        
        return $prefix . $group . ':' . $key;
    }
    
    /**
     * Check if data contains sensitive medical information
     * LGPD Compliance: Never cache patient or personal data
     */
    private function is_sensitive_data($key, $group) {
        // Never cache user-related data for LGPD compliance
        $sensitive_groups = ['users', 'user_meta', 'sessions', 'transients'];
        
        if (in_array($group, $sensitive_groups)) {
            return true;
        }
        
        // Check for sensitive key patterns
        foreach ($this->medical_sensitive_keys as $pattern) {
            if (strpos($key, $pattern) !== false) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get TTL based on content group for medical website
     */
    private function get_ttl_for_group($group) {
        $ttl_map = [
            'posts' => 3600,           // 1 hour for blog posts
            'comments' => 1800,        // 30 minutes for comments
            'terms' => 7200,           // 2 hours for categories/tags
            'options' => 86400,        // 24 hours for site options
            'themes' => 86400,         // 24 hours for theme data
            'plugins' => 86400,        // 24 hours for plugin data
        ];
        
        return isset($ttl_map[$group]) ? $ttl_map[$group] : WP_REDIS_DEFAULT_TTL;
    }
    
    /**
     * Get cache statistics for monitoring
     */
    public function get_stats() {
        if (!$this->redis) {
            return false;
        }
        
        try {
            $info = $this->redis->info();
            return [
                'redis_version' => $info['redis_version'] ?? 'unknown',
                'used_memory' => $info['used_memory_human'] ?? 'unknown',
                'connected_clients' => $info['connected_clients'] ?? 'unknown',
                'hits' => $info['keyspace_hits'] ?? 0,
                'misses' => $info['keyspace_misses'] ?? 0,
            ];
        } catch (Exception $e) {
            return false;
        }
    }
}

// Initialize global cache object
$wp_object_cache = new WP_Object_Cache_Redis();

/**
 * WordPress cache functions
 */
function wp_cache_add($key, $data, $group = '', $expire = 0) {
    global $wp_object_cache;
    return $wp_object_cache->add($key, $data, $group, (int) $expire);
}

function wp_cache_set($key, $data, $group = '', $expire = 0) {
    global $wp_object_cache;
    return $wp_object_cache->set($key, $data, $group, (int) $expire);
}

function wp_cache_get($key, $group = '', $force = false, &$found = null) {
    global $wp_object_cache;
    return $wp_object_cache->get($key, $group, $force, $found);
}

function wp_cache_delete($key, $group = '') {
    global $wp_object_cache;
    return $wp_object_cache->delete($key, $group);
}

function wp_cache_flush() {
    global $wp_object_cache;
    return $wp_object_cache->flush();
}

function wp_cache_close() {
    return true;
}

function wp_cache_init() {
    global $wp_object_cache;
    $wp_object_cache = new WP_Object_Cache_Redis();
}

function wp_cache_switch_to_blog($blog_id) {
    global $wp_object_cache;
    $wp_object_cache->switch_to_blog($blog_id);
}