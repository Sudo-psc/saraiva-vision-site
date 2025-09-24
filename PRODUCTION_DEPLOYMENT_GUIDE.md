# Production Deployment Guide

This guide provides comprehensive instructions for deploying the Saraiva Vision website to production with full readiness verification.

## Overview

The production deployment process includes:
- **VPS Component**: WordPress headless CMS with Docker
- **Vercel Component**: Next.js frontend and API routes
- **Security Auditing**: Comprehensive security assessment
- **Performance Optimization**: Performance analysis and optimization
- **SSL Management**: Certificate verification and renewal
- **Backup Testing**: Backup and recovery procedure validation

## Prerequisites

### System Requirements
- Node.js 18+ 
- Docker and Docker Compose (for VPS)
- Vercel CLI
- Access to VPS server (Ubuntu 22.04 recommended)
- Domain names configured:
  - `saraivavision.com.br` (main site)
  - `cms.saraivavision.com.br` (WordPress CMS)

### Environment Variables

Create `.env` file with the following variables:

```bash
# WordPress Configuration
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
WP_REVALIDATE_SECRET=your_secure_revalidate_secret
WP_WEBHOOK_SECRET=your_secure_webhook_secret

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email & SMS Configuration
RESEND_API_KEY=re_your_resend_api_key
DOCTOR_EMAIL=philipe_cruz@outlook.com
ZENVIA_API_TOKEN=your_zenvia_token
ZENVIA_FROM_NUMBER=+5511999999999

# External Services
SPOTIFY_RSS_URL=https://anchor.fm/s/your-podcast/podcast/rss
OPENAI_API_KEY=sk-your_openai_key
POSTHOG_KEY=phc_your_posthog_key

# VPS Configuration (for WordPress)
MYSQL_PASSWORD=secure_mysql_password
MYSQL_ROOT_PASSWORD=secure_root_password
JWT_SECRET_KEY=your_jwt_secret_key

# System Configuration
TIMEZONE=America/Sao_Paulo
NODE_ENV=production
```

## Deployment Process

### Option 1: Full Automated Deployment

Run the complete production deployment process:

```bash
npm run production:deploy
```

This will execute all steps:
1. Pre-deployment checks
2. Security audit
3. Performance analysis
4. SSL certificate verification
5. Backup system testing
6. Production readiness check
7. Deployment to Vercel and VPS
8. Post-deployment verification

### Option 2: Fast Deployment (Skip Some Checks)

For faster deployment (skips backup and performance tests):

```bash
npm run production:deploy:fast
```

### Option 3: Manual Step-by-Step Deployment

#### Step 1: Pre-deployment Checks

```bash
npm run production:check
```

Verifies:
- Required files and configurations
- Environment variables
- API endpoint functionality
- VPS and Vercel configurations

#### Step 2: Security Audit

```bash
npm run production:security
```

Checks for:
- Environment variable security
- API endpoint security
- Database security
- SSL/TLS configuration
- Container security
- File permissions
- Network security

#### Step 3: Performance Analysis

```bash
npm run production:performance
```

Analyzes:
- Vercel function performance
- VPS performance
- Database optimization
- Frontend performance
- Generates optimization recommendations

#### Step 4: SSL Certificate Management

```bash
npm run production:ssl check
```

Additional SSL commands:
```bash
npm run production:ssl setup    # Setup auto-renewal
npm run production:ssl renew    # Force renewal
npm run production:ssl test     # Test renewal process
npm run production:ssl report   # Generate SSL report
```

#### Step 5: Backup System Testing

```bash
npm run production:backup
```

Tests:
- WordPress file backup
- Database backup
- Backup compression
- Recovery procedures
- Backup retention policies

#### Step 6: Deploy to Vercel

```bash
npm run vercel:deploy
```

#### Step 7: Deploy to VPS (WordPress)

```bash
cd vps-wordpress
./deploy.sh
```

## VPS Setup (First Time Only)

### 1. Initial VPS Configuration

```bash
# Copy VPS files to server
scp -r vps-wordpress/ user@your-vps-ip:/opt/

# SSH to VPS
ssh user@your-vps-ip

# Run setup script
cd /opt/vps-wordpress
sudo ./setup-vps.sh
```

### 2. SSL Certificate Setup

```bash
# Setup SSL certificates
sudo ./setup-ssl.sh
```

### 3. WordPress Deployment

```bash
# Create .env file with your configuration
cp .env.example .env
nano .env

# Deploy WordPress
./deploy.sh
```

## Monitoring and Maintenance

### Health Checks

The system includes several health check endpoints:

- `https://saraivavision.com.br/api/health` - Main site health
- `https://saraivavision.com.br/api/ping` - Simple ping test
- `https://cms.saraivavision.com.br/graphql` - WordPress GraphQL

### Automated Monitoring

The deployment sets up automated monitoring:

- **SSL Certificate Monitoring**: Daily checks for certificate expiry
- **Backup Monitoring**: Automated daily backups with retention
- **System Health**: Container health checks and restart policies
- **Performance Monitoring**: Vercel analytics and custom metrics

### Log Files

Important log files to monitor:

- `/var/log/wordpress/backup.log` - Backup operations
- `/var/log/ssl-monitor.log` - SSL certificate monitoring
- `/var/log/nginx/access.log` - Web server access logs
- `/var/log/nginx/error.log` - Web server error logs

### Maintenance Commands

```bash
# Check SSL certificate status
npm run production:ssl check

# Run backup manually
sudo /usr/local/bin/wordpress-backup.sh

# Check system health
npm run production:check

# Update security audit
npm run production:security
```

## Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues

```bash
# Check certificate status
npm run production:ssl check

# Renew certificates manually
npm run production:ssl renew

# Check nginx configuration
docker-compose exec nginx nginx -t
```

#### 2. WordPress Connection Issues

```bash
# Check WordPress containers
docker-compose ps

# View WordPress logs
docker-compose logs wordpress

# Restart WordPress services
docker-compose restart
```

#### 3. Vercel Deployment Issues

```bash
# Check Vercel status
vercel --version

# View deployment logs
vercel logs

# Redeploy
npm run vercel:deploy
```

#### 4. Database Issues

```bash
# Check database container
docker-compose exec db mysql -u wp -p

# View database logs
docker-compose logs db

# Backup database manually
docker-compose exec -T db mysqldump -u wp -p$MYSQL_PASSWORD wordpress > backup.sql
```

### Performance Issues

#### 1. Slow API Responses

```bash
# Run performance analysis
npm run production:performance

# Check function memory allocation in vercel.json
# Increase memory for slow functions
```

#### 2. WordPress Performance

```bash
# Check Redis cache
docker-compose exec redis redis-cli ping

# Monitor WordPress performance
docker-compose exec wordpress top
```

### Security Issues

```bash
# Run security audit
npm run production:security

# Check firewall status
sudo ufw status

# Review access logs
tail -f /var/log/nginx/access.log
```

## Rollback Procedures

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### VPS Rollback

```bash
# Restore from backup
cd /opt/backups/wordpress
tar -xzf wordpress-backup-YYYYMMDD_HHMMSS.tar.gz

# Restore database
docker-compose exec -T db mysql -u wp -p$MYSQL_PASSWORD wordpress < backup/wordpress-db.sql

# Restore files
docker run --rm -v wordpress_wp_data:/data -v $(pwd)/backup:/backup alpine sh -c "cd /data && tar -xzf /backup/wordpress-files.tar.gz"
```

## Security Best Practices

1. **Regular Updates**: Keep all dependencies and Docker images updated
2. **Access Control**: Use strong passwords and limit SSH access
3. **Monitoring**: Monitor logs for suspicious activity
4. **Backups**: Verify backup integrity regularly
5. **SSL**: Monitor certificate expiry and renewal
6. **Firewall**: Keep firewall rules restrictive
7. **Environment Variables**: Never commit secrets to version control

## Performance Optimization

1. **Caching**: Ensure Redis is properly configured
2. **CDN**: Use Vercel's CDN for static assets
3. **Database**: Optimize MySQL configuration
4. **Images**: Use WebP format and proper sizing
5. **Functions**: Optimize Vercel function memory allocation
6. **Monitoring**: Use performance monitoring tools

## Support and Documentation

- **Deployment Logs**: Check `deployment-*.log` files
- **Error Reports**: Review `deployment-report-*.json` files
- **Health Checks**: Use built-in health check endpoints
- **Monitoring**: Set up alerts for critical metrics

For additional support, refer to:
- Vercel Documentation: https://vercel.com/docs
- Docker Documentation: https://docs.docker.com
- WordPress Documentation: https://wordpress.org/support
- Supabase Documentation: https://supabase.com/docs