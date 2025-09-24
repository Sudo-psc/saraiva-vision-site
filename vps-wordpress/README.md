# WordPress Headless CMS for Saraiva Vision

This directory contains the complete Docker-based setup for a headless WordPress CMS deployment on Ubuntu 22.04 VPS, configured specifically for Saraiva Vision ophthalmology clinic.

## Architecture Overview

- **WordPress 6.5** with PHP 8.2-FPM
- **MariaDB 10.6** for database
- **Redis 6** for object caching
- **Nginx** as reverse proxy with SSL termination
- **Let's Encrypt** for SSL certificates
- **Docker Compose** for orchestration

## Features

- ✅ Headless WordPress with GraphQL API
- ✅ Redis object caching for performance
- ✅ SSL/TLS encryption with auto-renewal
- ✅ Automated backups and monitoring
- ✅ Security hardening and rate limiting
- ✅ Custom post types for clinic content
- ✅ JWT authentication for API access
- ✅ CORS configuration for frontend integration

## Prerequisites

- Ubuntu 22.04 LTS VPS
- Domain name pointing to your server (cms.saraivavision.com.br)
- Root or sudo access
- At least 2GB RAM and 20GB storage

## Quick Start

### 1. Initial VPS Setup

```bash
# Clone or copy this directory to your VPS
scp -r vps-wordpress/ user@your-server:/tmp/

# SSH into your VPS
ssh user@your-server

# Move files to working directory
sudo mv /tmp/vps-wordpress /opt/wordpress-setup
cd /opt/wordpress-setup

# Make scripts executable
chmod +x *.sh

# Run VPS setup (installs Docker, configures firewall, etc.)
./setup-vps.sh

# Log out and back in for Docker group membership
exit
ssh user@your-server
```

### 2. Configure Environment

```bash
cd /opt/wordpress-setup

# Copy and edit environment file
cp .env.example .env
nano .env

# Update these values:
# - MYSQL_PASSWORD (will be auto-generated if not set)
# - MYSQL_ROOT_PASSWORD (will be auto-generated if not set)
# - JWT_SECRET_KEY (will be auto-generated if not set)
# - DOMAIN=cms.saraivavision.com.br
# - EMAIL=admin@saraivavision.com.br
```

### 3. Deploy WordPress

```bash
# Run complete deployment
./deploy.sh

# This will:
# - Set up directory structure
# - Generate secure passwords
# - Start Docker containers
# - Configure SSL certificates
# - Install and configure WordPress plugins
# - Set up monitoring and backups
```

### 4. Complete WordPress Setup

After deployment, visit `https://cms.saraivavision.com.br` to complete WordPress installation:

1. Choose language (Portuguese)
2. Create admin user account
3. Set site title: "Saraiva Vision CMS"
4. Configure permalink structure (Settings → Permalinks → Post name)

## Installed Plugins

The deployment automatically installs and configures:

- **WPGraphQL** - GraphQL API for headless functionality
- **WPGraphQL JWT Authentication** - Secure API authentication
- **Redis Cache** - Object caching for performance
- **WPGraphQL CORS** - Cross-origin request handling
- **Advanced Custom Fields** - Custom field management
- **WPGraphQL ACF** - ACF integration with GraphQL
- **WP Super Cache** - Page caching
- **Wordfence** - Security protection
- **UpdraftPlus** - Backup management

## Custom Post Types

The following custom post types are automatically created:

- **Services** (`/wp-admin/edit.php?post_type=services`)
  - Ophthalmology services and procedures
  - Fields: title, description, featured image

- **Team Members** (`/wp-admin/edit.php?post_type=team`)
  - Doctor and staff profiles
  - Fields: name, bio, photo, specializations

- **Testimonials** (`/wp-admin/edit.php?post_type=testimonials`)
  - Patient reviews and success stories
  - Fields: patient name, review text, rating

## GraphQL API Usage

### Endpoint
```
https://cms.saraivavision.com.br/graphql
```

### Authentication
```bash
# Get JWT token
curl -X POST https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation LoginUser($input: LoginInput!) { login(input: $input) { authToken user { id name email } } }",
    "variables": {
      "input": {
        "clientMutationId": "uniqueId",
        "username": "your-username",
        "password": "your-password"
      }
    }
  }'
```

### Sample Queries

```graphql
# Get all posts
query GetPosts {
  posts {
    nodes {
      id
      title
      content
      date
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}

# Get services
query GetServices {
  services {
    nodes {
      id
      title
      content
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}

# Get team members
query GetTeamMembers {
  teamMembers {
    nodes {
      id
      title
      content
      featuredImage {
        node {
          sourceUrl
        }
      }
    }
  }
}
```

## Management Commands

```bash
# Check service status
./deploy.sh health

# View live logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Stop services
./deploy.sh stop

# Start services
./deploy.sh start

# Create manual backup
./deploy.sh backup

# Check SSL certificate status
ssl-info.sh
```

## File Structure

```
/opt/wordpress-cms/                 # Main deployment directory
├── docker-compose.yml             # Docker services configuration
├── .env                           # Environment variables (sensitive)
├── nginx/                         # Nginx configuration
│   ├── nginx.conf                 # Main nginx config
│   └── conf.d/wordpress.conf      # WordPress site config
├── wp-config-extra.php            # Additional WordPress config
├── uploads.ini                    # PHP upload settings
└── *.sh                          # Management scripts

/opt/backups/wordpress/            # Backup storage
/var/log/wordpress/                # Application logs
/etc/letsencrypt/                  # SSL certificates
```

## Monitoring and Maintenance

### Automated Tasks

- **Health Monitoring**: Every 5 minutes
- **Backups**: Daily at 2:00 AM (kept for 7 days)
- **SSL Renewal**: Automatic via certbot
- **Log Rotation**: Weekly rotation, 52 weeks retention

### Manual Monitoring

```bash
# Check container status
cd /opt/wordpress-cms && docker-compose ps

# View resource usage
docker stats

# Check disk space
df -h

# View recent logs
tail -f /var/log/wordpress/monitor.log
tail -f /var/log/wordpress/backup.log
```

### Performance Optimization

The setup includes several performance optimizations:

- Redis object caching
- Nginx gzip compression
- Static file caching (7 days)
- PHP OPcache enabled
- Database query optimization
- Image optimization settings

## Security Features

- SSL/TLS encryption with HSTS
- Rate limiting on login and API endpoints
- Fail2Ban protection against brute force
- Security headers (XSS, CSRF, etc.)
- File upload restrictions
- WordPress security hardening
- Regular security updates

## Backup and Recovery

### Automatic Backups

Backups run daily and include:
- WordPress files (wp-content directory)
- Complete database dump
- Compressed archive storage

### Manual Backup

```bash
# Create immediate backup
/usr/local/bin/wordpress-backup.sh

# List available backups
ls -la /opt/backups/wordpress/
```

### Recovery Process

```bash
# Stop services
cd /opt/wordpress-cms && docker-compose down

# Extract backup
cd /opt/backups/wordpress
tar -xzf wordpress-backup-YYYYMMDD_HHMMSS.tar.gz

# Restore files
docker run --rm -v wordpress_wp_data:/data -v $(pwd)/YYYYMMDD_HHMMSS:/backup alpine sh -c "cd /data && tar -xzf /backup/wordpress-files.tar.gz"

# Restore database
cd /opt/wordpress-cms
docker-compose up -d db
docker-compose exec -T db mysql -u wp -p$MYSQL_PASSWORD wordpress < /opt/backups/wordpress/YYYYMMDD_HHMMSS/wordpress-db.sql

# Start all services
docker-compose up -d
```

## Troubleshooting

### Common Issues

1. **Containers won't start**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check disk space
   df -h
   
   # Restart Docker
   sudo systemctl restart docker
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate status
   ssl-info.sh
   
   # Manual renewal
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

3. **Database connection errors**
   ```bash
   # Check database container
   docker-compose exec db mysqladmin ping
   
   # Reset database password
   docker-compose exec db mysql -u root -p$MYSQL_ROOT_PASSWORD -e "ALTER USER 'wp'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
   ```

4. **GraphQL not working**
   ```bash
   # Check plugin status
   docker-compose exec wordpress wp plugin list --allow-root
   
   # Reactivate GraphQL plugins
   docker-compose exec wordpress wp plugin activate wp-graphql --allow-root
   docker-compose exec wordpress wp plugin activate wp-graphql-jwt-authentication --allow-root
   ```

### Log Locations

- **Application logs**: `/var/log/wordpress/`
- **Nginx logs**: `/var/log/nginx/`
- **Container logs**: `docker-compose logs [service]`
- **System logs**: `journalctl -u wordpress-cms.service`

## Integration with Next.js

### Environment Variables for Next.js

```bash
# WordPress Integration
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WP_REVALIDATE_SECRET=your_revalidate_secret_here

# JWT Authentication (for admin operations)
WORDPRESS_JWT_SECRET=your_jwt_secret_here
```

### Webhook Configuration

Set up WordPress webhooks to trigger Next.js revalidation:

1. Install "WP Webhooks" plugin
2. Configure webhook URL: `https://saraivavision.com.br/api/revalidate`
3. Set secret key for security
4. Trigger on post publish/update

## Support and Maintenance

### Regular Maintenance Tasks

- **Weekly**: Review logs and performance metrics
- **Monthly**: Update WordPress core and plugins
- **Quarterly**: Security audit and penetration testing
- **Annually**: SSL certificate renewal (automatic)

### Getting Help

For technical support:
1. Check logs for error messages
2. Review this documentation
3. Consult WordPress and Docker documentation
4. Contact system administrator

## License

This configuration is provided as-is for Saraiva Vision clinic. Modify as needed for your specific requirements.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Ubuntu 22.04 LTS, Docker 24.x, WordPress 6.5+