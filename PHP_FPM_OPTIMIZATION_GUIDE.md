# 🏥 SaraivaVision Medical Website - PHP-FPM Optimization Guide

**Dr. Philipe Saraiva Cruz - CRM-MG 69.870**  
**Clínica Oftalmológica - Caratinga, Minas Gerais**

## 📋 Overview

This guide documents the comprehensive PHP-FPM optimization implementation for the SaraivaVision medical website, including OPcache tuning, Redis Object Cache, and performance enhancements specifically designed for medical websites with LGPD compliance.

## 🎯 Optimization Goals

- **Performance**: Reduce WordPress API response times by 30-50%
- **Scalability**: Support 2x more concurrent users
- **Security**: Maintain medical website security standards
- **Compliance**: Ensure LGPD compliance for patient data
- **Reliability**: 99.9% uptime for medical clinic operations

## 📊 Before/After Performance Metrics

### Baseline Performance (Before Optimization)
- WordPress API Response: ~100ms
- Admin Panel Load: ~200ms
- PHP Memory per Process: ~32MB
- Concurrent Users Supported: ~10-15
- Cache Hit Rate: N/A (no object cache)

### Target Performance (After Optimization)
- WordPress API Response: <70ms (30% improvement)
- Admin Panel Load: <140ms (30% improvement)
- PHP Memory per Process: ~25MB (20% reduction)
- Concurrent Users Supported: ~20-30 (100% improvement)
- OPcache Hit Rate: >95%
- Redis Cache Hit Rate: >90%

## 🛠️ Implementation Components

### 1. PHP-FPM Pool Configuration

**File**: `php-fpm-saraivavision.conf`

```ini
[saraivavision]
; Optimized for medical website traffic patterns
pm = dynamic
pm.max_children = 20          ; Medical websites need stable performance
pm.start_servers = 5          ; Quick startup for patient inquiries
pm.min_spare_servers = 3      ; Always ready for urgent requests
pm.max_spare_servers = 8      ; Efficient resource usage
pm.max_requests = 1000        ; Prevent memory leaks with medical images

; Security for medical data
php_admin_value[memory_limit] = 256M
php_admin_value[expose_php] = Off
php_admin_flag[display_errors] = off
```

**Rationale**:
- `pm.max_children = 20`: Balanced for medical website traffic without overwhelming server
- `pm.max_requests = 1000`: Higher value prevents frequent restarts during image processing
- Memory limit of 256M accommodates medical images and WordPress overhead

### 2. OPcache Configuration

**File**: `php-optimized.ini`

```ini
[opcache]
opcache.enable=1
opcache.memory_consumption=256       ; Sufficient for WordPress + medical plugins
opcache.interned_strings_buffer=32  ; Optimized for WordPress string handling
opcache.max_accelerated_files=10000 ; WordPress + plugins + themes
opcache.validate_timestamps=1       ; Balance between performance and development
opcache.revalidate_freq=60          ; 60 seconds for medical website updates
opcache.jit_buffer_size=128M        ; PHP 8.3 JIT for better performance
opcache.jit=1255                    ; Optimized JIT settings for WordPress
```

**Medical Website Specific Benefits**:
- Faster loading of medical appointment forms
- Improved performance for image galleries (before/after photos)
- Better response times for patient inquiry forms
- Reduced server load during peak appointment booking times

### 3. Redis Object Cache

**File**: `wp-redis-object-cache.php`

```php
// LGPD Compliance - Never cache sensitive data
private $medical_sensitive_keys = [
    'patient_', 'contact_form_', 'appointment_', 'user_', 'admin_'
];

// TTL optimized for medical content
private function get_ttl_for_group($group) {
    $ttl_map = [
        'posts' => 3600,      // 1 hour for blog posts
        'options' => 86400,   // 24 hours for site options
        'terms' => 7200,      // 2 hours for medical categories
    ];
}
```

**LGPD Compliance Features**:
- Never caches user data or patient information
- Automatic exclusion of sensitive medical data
- Separate cache keys for public vs. administrative content
- Configurable TTL based on content sensitivity

### 4. WordPress Configuration Optimizations

**File**: `wp-config-performance-optimized.php`

```php
// Performance optimizations
define('WP_CACHE', true);
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Medical website constants
define('CLINIC_NAME', 'Clínica Saraiva Vision');
define('DOCTOR_NAME', 'Dr. Philipe Saraiva Cruz');
define('DOCTOR_CRM', 'CRM-MG 69.870');

// LGPD compliance
define('LGPD_COMPLIANCE', true);
define('CACHE_PATIENT_DATA', false);
```

## 📋 Installation Instructions

### Step 1: Backup Current Configuration

```bash
# Create backup directory
sudo mkdir -p /backup/saraivavision-$(date +%Y%m%d)

# Backup current configurations
sudo cp /etc/php/8.3/fpm/php.ini /backup/saraivavision-$(date +%Y%m%d)/
sudo cp /var/www/html/wp-config.php /backup/saraivavision-$(date +%Y%m%d)/
sudo cp /etc/nginx/nginx.conf /backup/saraivavision-$(date +%Y%m%d)/
```

### Step 2: Install Redis

```bash
# Install Redis server
sudo apt update
sudo apt install redis-server

# Configure Redis for medical website
sudo cp redis-medical.conf /etc/redis/redis.conf
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

### Step 3: Configure PHP-FPM

```bash
# Copy optimized PHP-FPM pool configuration
sudo cp php-fpm-saraivavision.conf /etc/php/8.3/fpm/pool.d/
sudo cp php-optimized.ini /etc/php/8.3/fpm/conf.d/99-optimized.ini

# Create log directories
sudo mkdir -p /var/log/php
sudo chown www-data:www-data /var/log/php

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

### Step 4: Configure WordPress

```bash
# Install Redis Object Cache
sudo cp wp-redis-object-cache.php /var/www/html/wp-content/object-cache.php
sudo chown www-data:www-data /var/www/html/wp-content/object-cache.php

# Update wp-config.php
sudo cp wp-config-performance-optimized.php /var/www/html/wp-config.php
sudo chown www-data:www-data /var/www/html/wp-config.php
```

### Step 5: Update Nginx Configuration

```bash
# Update Nginx to use PHP-FPM socket
# Edit /etc/nginx/sites-available/saraivavision
# Change from proxy_pass to fastcgi_pass unix:/run/php/php8.3-fpm-saraivavision.sock

sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Testing and Validation

### Performance Testing

```bash
# Run baseline benchmark
./benchmark-performance.sh

# Load testing with K6
k6 run --vus 20 --duration 60s performance-test.js

# Monitor PHP-FPM status
curl http://localhost/fpm-status

# Check OPcache status
php -r "var_dump(opcache_get_status());"

# Test Redis connectivity
redis-cli ping
```

### WordPress Functionality Testing

1. **Admin Panel Access**: Verify wp-admin loads correctly
2. **API Endpoints**: Test `/wp-json/wp/v2/posts` response
3. **File Uploads**: Test medical image uploads work properly
4. **Contact Forms**: Ensure patient inquiry forms function
5. **Cache Functionality**: Verify Redis cache is working

### Medical Website Specific Tests

1. **LGPD Compliance**: Confirm no patient data is cached
2. **Security Headers**: Verify medical website security headers
3. **SSL/HTTPS**: Ensure all admin traffic uses HTTPS
4. **Performance**: Confirm response times meet medical standards

## 📈 Monitoring and Maintenance

### Performance Monitoring

```bash
# Check PHP-FPM pool status
curl http://localhost/fpm-status?json

# Monitor Redis performance
redis-cli --latency

# OPcache hit rate monitoring
php -r "
$status = opcache_get_status();
echo 'Hit Rate: ' . $status['opcache_statistics']['opcache_hit_rate'] . '%\n';
"
```

### Log Monitoring

```bash
# PHP-FPM error logs
sudo tail -f /var/log/php/saraivavision-error.log

# Slow query log
sudo tail -f /var/log/php/saraivavision-slow.log

# Redis logs
sudo tail -f /var/log/redis/saraivavision-redis.log
```

### Maintenance Tasks

1. **Weekly**: Review PHP-FPM slow query logs
2. **Monthly**: Check OPcache hit rates and adjust if needed
3. **Quarterly**: Review Redis memory usage and optimize
4. **Semi-annually**: Full performance audit and optimization review

## 🚨 Troubleshooting

### Common Issues

**Issue**: WordPress admin slow after optimization
```bash
# Check PHP-FPM processes
sudo systemctl status php8.3-fpm
ps aux | grep php-fpm

# Verify socket permissions
ls -la /run/php/php8.3-fpm-saraivavision.sock
```

**Issue**: Redis connection errors
```bash
# Check Redis status
sudo systemctl status redis-server
redis-cli ping

# Verify Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

**Issue**: OPcache not working
```bash
# Check OPcache configuration
php -i | grep opcache

# Restart PHP-FPM to reload OPcache
sudo systemctl restart php8.3-fpm
```

### Performance Issues

**High Memory Usage**:
1. Check `pm.max_children` setting
2. Monitor individual process memory usage
3. Adjust `pm.max_requests` if needed

**Poor Cache Hit Rates**:
1. Review cache TTL settings
2. Check for cache-busting parameters
3. Verify Redis memory configuration

## 🔄 Rollback Procedures

### Quick Rollback

```bash
# Use the automated rollback script
./rollback-php-optimizations.sh
```

### Manual Rollback Steps

1. **Stop Services**:
   ```bash
   sudo systemctl stop php8.3-fpm
   sudo systemctl stop redis-server
   ```

2. **Restore Configurations**:
   ```bash
   sudo cp /backup/saraivavision-*/php.ini /etc/php/8.3/fpm/
   sudo cp /backup/saraivavision-*/wp-config.php /var/www/html/
   ```

3. **Remove Optimizations**:
   ```bash
   sudo rm /etc/php/8.3/fpm/pool.d/saraivavision.conf
   sudo rm /var/www/html/wp-content/object-cache.php
   ```

4. **Restart Services**:
   ```bash
   sudo systemctl start php8.3-fpm
   sudo systemctl reload nginx
   ```

## 📚 Additional Resources

- [WordPress Performance Optimization](https://wordpress.org/support/article/optimization/)
- [PHP-FPM Configuration](https://www.php.net/manual/en/install.fpm.configuration.php)
- [Redis Object Cache Plugin](https://wordpress.org/plugins/redis-cache/)
- [Medical Website Security Guidelines](https://www.cfm.org.br/)
- [LGPD Compliance for Websites](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

## 📞 Support

For technical support with this optimization:

**SaraivaVision Development Team**  
**Email**: dev@saraivavision.com.br  
**Phone**: +55 (33) 3321-3244  

---

**Document Version**: 1.0  
**Last Updated**: $(date +%Y-%m-%d)  
**Author**: SaraivaVision Development Team