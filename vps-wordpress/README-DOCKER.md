# WordPress Headless CMS - Docker Configuration

This directory contains all the Docker configurations and scripts needed to deploy a production-ready WordPress headless CMS with Nginx, MySQL, and Redis.

## 📁 File Structure

```
vps-wordpress/
├── Dockerfile.wordpress          # Custom WordPress container with optimizations
├── Dockerfile.nginx              # Custom Nginx container with SSL support
├── docker-compose.yml            # Main Docker Compose configuration
├── docker-compose.override.yml   # Custom build overrides
├── docker-entrypoint.sh          # WordPress initialization script
├── nginx-entrypoint.sh           # Nginx initialization script
├── php.ini                       # PHP configuration optimizations
├── opcache.ini                   # OPcache configuration for performance
├── wp-config-extra.php           # WordPress custom configuration
├── nginx/
│   ├── nginx.conf                # Main Nginx configuration
│   ├── conf.d/
│   │   └── wordpress.conf        # WordPress-specific Nginx config
│   └── snippets/
│       ├── ssl-params.conf       # SSL optimization parameters
│       └── security-headers.conf # Security headers configuration
├── setup-ssl.sh                  # SSL certificate setup with Let's Encrypt
├── install-plugins.sh            # WordPress plugin installation script
├── deploy.sh                     # Main deployment script
└── .env.example                  # Environment variables template
```

## 🚀 Quick Start

### 1. Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

Required environment variables:
```bash
DOMAIN=cms.saraivavision.com.br
EMAIL=admin@saraivavision.com.br
MYSQL_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_secure_root_password
JWT_SECRET_KEY=your_jwt_secret_key
```

### 2. Set Permissions

```bash
# Make scripts executable
chmod +x *.sh
```

### 3. Deploy

```bash
# Full deployment
./deploy.sh
```

## 🐳 Docker Containers

### WordPress Container (Custom)

**Base Image:** `wordpress:6.5-php8.2-fpm`

**Custom Features:**
- PHP 8.2 with optimized extensions (GD, Redis, OPcache)
- WP-CLI pre-installed
- Custom PHP configuration for performance
- Health checks and monitoring
- Automatic plugin installation

**Key Extensions:**
- `redis` - Object caching
- `opcache` - PHP bytecode caching
- `gd` - Image processing with WebP support
- `exif` - Image metadata
- `bcmath` - Precision mathematics

### Nginx Container (Custom)

**Base Image:** `nginx:1.25-alpine`

**Custom Features:**
- SSL/TLS optimization
- Security headers
- Rate limiting
- Gzip compression
- Static file caching
- Health checks

**Security Features:**
- HSTS headers
- XSS protection
- Content type sniffing prevention
- Frame options
- CSP headers

### Database Container

**Base Image:** `mariadb:10.6`

**Optimizations:**
- InnoDB buffer pool optimization
- Query cache enabled
- Slow query logging
- Connection limits

### Redis Container

**Base Image:** `redis:6-alpine`

**Configuration:**
- Persistent storage with AOF
- Memory optimization
- LRU eviction policy
- Automatic saves

## ⚙️ Configuration Details

### PHP Configuration (`php.ini`)

```ini
memory_limit = 512M
max_execution_time = 300
upload_max_filesize = 64M
post_max_size = 64M
date.timezone = America/Sao_Paulo
```

### OPcache Configuration (`opcache.ini`)

```ini
opcache.memory_consumption = 256
opcache.max_accelerated_files = 10000
opcache.jit_buffer_size = 128M
opcache.jit = tracing
```

### Nginx Configuration

**Main Features:**
- HTTP/2 support
- SSL/TLS 1.2 and 1.3
- Gzip compression
- Rate limiting
- Security headers
- Static file optimization

**Rate Limiting:**
- Login endpoints: 5 requests/minute
- API endpoints: 10 requests/second
- General: 1 request/second

### WordPress Configuration (`wp-config-extra.php`)

**Custom Features:**
- Redis object cache integration
- GraphQL JWT authentication
- CORS headers for headless usage
- Custom post types (Services, Team Members, Testimonials)
- Security optimizations
- Performance enhancements

## 🔒 Security Features

### SSL/TLS Configuration
- Let's Encrypt automatic certificates
- Perfect Forward Secrecy
- OCSP stapling
- HSTS headers
- Strong cipher suites

### Application Security
- Rate limiting on sensitive endpoints
- Security headers (XSS, CSRF, etc.)
- File upload restrictions
- Hidden server information
- Malicious request blocking

### WordPress Security
- File editing disabled
- XML-RPC disabled
- Login attempt limiting
- Secure file permissions
- Database connection encryption

## 📊 Performance Optimizations

### Caching Strategy
- **Redis**: Object cache for WordPress
- **OPcache**: PHP bytecode caching
- **Nginx**: Static file caching
- **Browser**: Long-term asset caching

### Database Optimization
- InnoDB buffer pool tuning
- Query cache enabled
- Connection pooling
- Slow query monitoring

### Network Optimization
- HTTP/2 support
- Gzip compression
- Asset minification
- CDN-ready headers

## 🔧 Management Commands

### Container Management
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f [service]

# Restart services
docker-compose restart

# Update containers
docker-compose pull && docker-compose up -d
```

### WordPress Management
```bash
# WP-CLI commands
docker-compose exec wordpress wp --help --allow-root

# Install plugins
docker-compose exec wordpress wp plugin install [plugin] --allow-root

# Update WordPress
docker-compose exec wordpress wp core update --allow-root
```

### SSL Management
```bash
# Setup SSL
./setup-ssl.sh

# Renew certificates
./setup-ssl.sh renew

# Check certificate info
./setup-ssl.sh info
```

### Backup and Restore
```bash
# Create backup
./deploy.sh backup

# List backups
ls -la /opt/backups/wordpress/

# Restore from backup (manual process)
# See main README.md for detailed instructions
```

## 🔍 Monitoring and Logs

### Health Checks
- **WordPress**: `/wp-health`
- **Nginx**: `/nginx-health`
- **Database**: MySQL ping
- **Redis**: Redis ping

### Log Locations
- **WordPress**: `/var/log/wordpress/`
- **Nginx**: `/var/log/nginx/`
- **PHP**: `/var/log/php_errors.log`
- **MySQL**: `/var/log/mysql/`

### Monitoring Commands
```bash
# Check all services health
./deploy.sh health

# Monitor resource usage
docker stats

# Check disk usage
df -h
```

## 🐛 Troubleshooting

### Common Issues

1. **Containers won't start**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check disk space
   df -h
   
   # Restart Docker daemon
   sudo systemctl restart docker
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate status
   ./setup-ssl.sh info
   
   # Regenerate certificate
   ./setup-ssl.sh setup
   ```

3. **WordPress not accessible**
   ```bash
   # Check WordPress container
   docker-compose exec wordpress wp core is-installed --allow-root
   
   # Check database connection
   docker-compose exec db mysqladmin ping
   ```

4. **Performance issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Monitor slow queries
   docker-compose exec db tail -f /var/log/mysql/slow.log
   
   # Check Redis cache
   docker-compose exec redis redis-cli info stats
   ```

### Debug Mode

Enable debug mode by setting in `.env`:
```bash
WP_DEBUG=true
WP_DEBUG_LOG=true
```

## 🔄 Updates and Maintenance

### Regular Maintenance
- **Daily**: Automated backups
- **Weekly**: Security updates
- **Monthly**: WordPress core and plugin updates
- **Quarterly**: Full system review

### Update Process
```bash
# Update containers
docker-compose pull
docker-compose up -d

# Update WordPress core
docker-compose exec wordpress wp core update --allow-root

# Update plugins
docker-compose exec wordpress wp plugin update --all --allow-root
```

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer in front of multiple Nginx containers
- Shared storage for WordPress files
- External Redis cluster
- Database read replicas

### Vertical Scaling
- Increase container resource limits
- Optimize database configuration
- Tune PHP-FPM settings
- Adjust Nginx worker processes

## 🔗 Integration with Next.js

### Environment Variables for Next.js
```bash
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WP_REVALIDATE_SECRET=your_revalidate_secret
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
```

### Webhook Configuration
1. Install WP Webhooks plugin
2. Configure webhook URL: `https://saraivavision.com.br/api/wordpress-webhook`
3. Set webhook secret
4. Enable for post/page updates

---

This Docker configuration provides a production-ready, secure, and performant WordPress headless CMS that integrates seamlessly with your Next.js frontend on Vercel.