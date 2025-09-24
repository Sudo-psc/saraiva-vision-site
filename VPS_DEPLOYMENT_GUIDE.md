# VPS Deployment Guide - Saraiva Vision

## Overview

This guide covers deploying the Saraiva Vision website to a VPS (Virtual Private Server) after removing Vercel integration. The application uses a hybrid architecture with the frontend deployed on the VPS and backend services containerized.

## Architecture

### Frontend (React/Vite)
- **Technology**: React 18.2.0 with Vite 7.1.3
- **Hosting**: VPS with Nginx as reverse proxy
- **Build**: Static files served by Nginx
- **Process**: Built locally → Deployed to VPS

### Backend Services
- **API**: Node.js custom server
- **CMS**: WordPress with PHP-FPM
- **Database**: MySQL
- **Cache**: Redis
- **Proxy**: Nginx for routing

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ or CentOS 7+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB SSD minimum
- **CPU**: 2 cores minimum
- **Network**: Static IP address

### Software Requirements
- Node.js 18.x+
- Docker & Docker Compose
- Nginx
- MySQL 8.0+
- Redis 6.0+

## Deployment Scripts

### Available Commands

```bash
# Development
npm run dev                    # Start development server (port 3002)
npm run build                  # Build for production
npm run preview                # Preview production build

# VPS Deployment
npm run deploy:vps             # Deploy frontend to VPS
npm run deploy:vps:backend     # Deploy backend containers
npm run deploy:vps:production # Full production deployment
npm run deploy:docker          # Start Docker containers
npm run deploy:docker:stop     # Stop Docker containers

# Nginx Management
npm run deploy:nginx:reload    # Reload Nginx configuration

# Health Checks
npm run deploy:health           # VPS health check
npm run deploy:backup           # Create backup

# Setup
npm run deploy:setup            # Initial VPS setup
```

## Deployment Process

### 1. Initial VPS Setup

```bash
# Run the setup script
npm run deploy:setup

# This script will:
# - Install required system packages
# - Setup Node.js and npm
# - Install Docker and Docker Compose
# - Configure Nginx
# - Setup firewall rules
# - Create deployment directories
# - Configure SSL certificates
```

### 2. Frontend Deployment

```bash
# Build the application
npm run build

# Deploy to VPS
npm run deploy:vps

# Or use the production script
npm run deploy:vps:production
```

### 3. Backend Deployment

```bash
# Deploy backend containers
npm run deploy:vps:backend

# Start all services
npm run deploy:docker

# Check service status
docker ps
```

## File Structure

```
saraiva-vision-site/
├── dist/                    # Built frontend files
├── api/                     # Backend API
├── docker-compose.yml       # Container orchestration
├── nginx.conf              # Nginx configuration
├── deploy-vps.sh           # VPS deployment script
├── deploy-vps-backend.sh   # Backend deployment script
├── deploy-prod.sh          # Production deployment script
└── scripts/                # Utility scripts
```

## Environment Configuration

### Frontend Environment Variables
Create `.env.production`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_HYPERTUNE_TOKEN=your_hypertune_token
```

### Backend Environment Variables
Create `.env.backend`:

```env
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
RESEND_API_KEY=your_resend_key
```

## Nginx Configuration

The Nginx configuration handles:
- SSL termination
- Static file serving
- API proxy routing
- Cache headers
- Security headers
- WordPress integration

### Key Nginx Features
- **HTTPS**: SSL certificate management
- **Static Files**: Efficient serving of built assets
- **API Routing**: Proxy to backend services
- **WordPress**: Integration with CMS
- **Caching**: Browser and server-side caching
- **Security**: Headers and rate limiting

## Docker Services

### Container Architecture
```yaml
services:
  api:          # Node.js backend
  wordpress:    # WordPress CMS
  mysql:        # Database
  redis:        # Cache
  nginx:        # Reverse proxy
```

### Service Management
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart api
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check overall health
npm run deploy:health

# Check specific services
docker-compose ps
curl -f https://your-domain.com/api/health
```

### Logs Management
```bash
# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View Docker logs
docker-compose logs -f api
docker-compose logs -f wordpress
```

### Backup Strategy
```bash
# Create backup
npm run deploy:backup

# Manual backup
mysqldump -u user -p database > backup.sql
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/html/
```

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Automatic chunk generation
- **Caching**: Browser and CDN caching
- **Images**: Optimized and lazy-loaded
- **Assets**: Minified and compressed

### Backend Optimization
- **Database**: Indexed queries and connection pooling
- **Cache**: Redis for frequently accessed data
- **API**: Efficient response handling
- **Static Files**: Nginx direct serving

## Security Considerations

### Frontend Security
- **HTTPS**: SSL/TLS encryption
- **Headers**: Security headers configured
- **CSP**: Content Security Policy
- **XSS**: Input sanitization

### Backend Security
- **API**: Rate limiting and authentication
- **Database**: Secure connections and backups
- **Files**: Proper permissions and access control
- **Network**: Firewall and restricted access

## Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Deployment Issues
```bash
# Check SSH connection
ssh user@your-vps-ip

# Check disk space
df -h

# Check service status
systemctl status nginx
docker-compose ps
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew
```

### Performance Issues
```bash
# Check resource usage
htop
free -h
df -h

# Check Nginx performance
sudo nginx -t
sudo systemctl reload nginx
```

## Rollback Procedure

### Quick Rollback
```bash
# Stop current deployment
npm run deploy:docker:stop

# Restore from backup
npm run deploy:backup --restore

# Restart services
npm run deploy:docker
```

### Git Rollback
```bash
# Reset to previous commit
git log --oneline
git reset --hard <commit-hash>

# Redeploy
npm run deploy:vps:production
```

## Scaling Considerations

### Vertical Scaling
- Increase VPS resources (CPU, RAM, Storage)
- Optimize database performance
- Implement caching strategies

### Horizontal Scaling
- Load balancer with multiple VPS instances
- Database replication
- CDN for static assets

## Support

For deployment issues:
1. Check this guide first
2. Review logs and error messages
3. Consult the troubleshooting section
4. Check system resources and service status

## Migration from Vercel

This deployment removes all Vercel dependencies:
- ✅ Removed `@vercel/analytics` and `@vercel/edge-config`
- ✅ Removed Vercel configuration files (`vercel.json`, `.vercelignore`)
- ✅ Updated Vite configuration for VPS deployment
- ✅ Removed Vercel-specific deployment scripts
- ✅ Updated build process for static file deployment
- ✅ Added VPS deployment scripts and documentation

The application is now optimized for VPS deployment with improved control over infrastructure, better performance, and reduced dependency on third-party services.