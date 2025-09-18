# 🚀 SaraivaVision PHP-FPM Optimization - Quick Deployment Reference

**Dr. Philipe Saraiva Cruz - CRM-MG 69.870**

## ⚡ One-Command Installation

```bash
# Automated installation (recommended)
sudo ./install-php-optimizations.sh
```

## 📋 Manual Installation Checklist

### 1. Backup Current System
```bash
sudo mkdir -p /backup/saraivavision-$(date +%Y%m%d)
sudo cp /etc/php/8.3/fpm/php.ini /backup/saraivavision-$(date +%Y%m%d)/
sudo cp /var/www/html/wp-config.php /backup/saraivavision-$(date +%Y%m%d)/
```

### 2. Install Redis
```bash
sudo apt install redis-server
sudo cp redis-medical.conf /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### 3. Configure PHP-FPM
```bash
sudo cp php-fpm-saraivavision.conf /etc/php/8.3/fpm/pool.d/
sudo cp php-optimized.ini /etc/php/8.3/fpm/conf.d/99-optimized.ini
sudo systemctl restart php8.3-fpm
```

### 4. Install WordPress Cache
```bash
sudo cp wp-redis-object-cache.php /var/www/html/wp-content/object-cache.php
sudo chown www-data:www-data /var/www/html/wp-content/object-cache.php
```

## 🧪 Quick Validation

```bash
# Test Redis
redis-cli ping

# Test PHP-FPM
php-fpm8.3 -t

# Test website
curl http://localhost/

# Run benchmark
./benchmark-performance.sh
```

## 🔄 Quick Rollback

```bash
# Automated rollback
sudo ./rollback-php-optimizations.sh

# Manual rollback
sudo systemctl stop php8.3-fpm redis-server
sudo rm /etc/php/8.3/fpm/pool.d/saraivavision.conf
sudo rm /var/www/html/wp-content/object-cache.php
sudo systemctl start php8.3-fpm
```

## 📊 Performance Targets

- **WordPress API**: <70ms (30% improvement)
- **OPcache Hit Rate**: >95%
- **Redis Hit Rate**: >90% 
- **Memory Usage**: 20% reduction
- **Concurrent Users**: 100% increase

## 🏥 Medical Website Features

- ✅ **LGPD Compliant**: No patient data cached
- ✅ **Medical Security**: Enhanced security headers
- ✅ **Brazilian Compliance**: CFM medical standards
- ✅ **Performance**: Optimized for patient inquiries

## 📞 Support

**Issues?** Check `PHP_FPM_OPTIMIZATION_GUIDE.md` for complete troubleshooting guide.

---
**SaraivaVision Development Team** | **Clínica Dr. Philipe Saraiva Cruz**