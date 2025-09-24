# Saraiva Vision Docker Deployment Guide

This document provides comprehensive instructions for deploying the Saraiva Vision medical website using Docker containers with full HIPAA/LGPD compliance.

## Architecture Overview

The Saraiva Vision Docker deployment consists of 7 services:

### Service Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │      API        │    │   WordPress     │
│   (React/Vite)  │    │   (Node.js)     │    │     (CMS)       │
│   Port: 3000    │    │   Port: 3002    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Nginx      │
                    │  (Reverse Proxy)│
                    │   Port: 80/443  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     MySQL       │    │     Redis       │    │ Health Monitor  │
│   (Database)    │    │    (Cache)      │    │  (Monitoring)   │
│   Port: 3306    │    │   Port: 6379    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Log Aggregator│
                    │  (Fluent-bit)   │
                    │   (Audit Trail) │
                    └─────────────────┘
```

### Service Details

| Service | Container | Port | Purpose | Health Check |
|---------|-----------|------|---------|--------------|
| Frontend | saraiva-frontend | 3000 | React/Vite application | `/health` |
| API | saraiva-api | 3002 | Node.js backend | `/api/health` |
| WordPress | saraiva-wordpress | 8080 | Content management | `/wp-json/wp/v2/` |
| Nginx | saraiva-nginx | 80/443 | Reverse proxy | `/health` |
| MySQL | saraiva-mysql | 3306 | Database | `mysqladmin ping` |
| Redis | saraiva-redis | 6379 | Cache | `redis-cli ping` |
| Health Monitor | saraiva-health-monitor | 3000 | System monitoring | `/monitor-health` |
| Log Aggregator | saraiva-logs | - | Medical audit trail | Process check |

## Prerequisites

### System Requirements
- **Operating System**: Linux Ubuntu 20.04+ or Docker Desktop
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 20GB free space
- **Network**: Internet access for Docker image downloads

### Software Requirements
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For repository management

### Environment Variables

Create a `.env` file with the following required variables:

```bash
# Frontend Configuration
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_MEDICAL_MODE=true

# Backend Configuration
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
RESEND_API_KEY=your-resend-api-key

# Database Configuration
MYSQL_ROOT_PASSWORD=secure-root-password
MYSQL_DATABASE=saraiva_vision
MYSQL_USER=saraiva_user
MYSQL_PASSWORD=secure-user-password

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=secure-redis-password

# Monitoring Configuration
ALERT_WEBHOOK_URL=https://your-webhook-url
MONITOR_INTERVAL=60
MEDICAL_SYSTEM_MODE=true

# Logging Configuration
ELASTICSEARCH_PASSWORD=your-elasticsearch-password
ALERT_WEBHOOK_TOKEN=your-webhook-token
SLACK_WEBHOOK=your-slack-webhook
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
DATADOG_API_KEY=your-datadog-api-key
```

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/saraiva-vision.git
cd saraiva-vision
```

### 2. Set Up Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Deploy the Application
```bash
# Automated deployment with health checks
./deploy-docker.sh
```

### 4. Test the Deployment
```bash
# Run comprehensive tests
./test-docker-deployment.sh
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3002
- **WordPress**: http://localhost:8080
- **Nginx Proxy**: http://localhost:80

## Detailed Deployment Steps

### Step 1: Environment Setup
```bash
# Create necessary directories
mkdir -p logs/{nginx,api,mysql,redis,wordpress,health-monitor}
mkdir -p mysql/{conf,init}
mkdir -p redis
mkdir -p monitoring
mkdir -p fluent-bit
mkdir -p nginx/{sites-available,sites-enabled}
```

### Step 2: Build and Start Services
```bash
# Build all services
docker-compose build --no-cache

# Start services
docker-compose up -d

# Check service status
docker-compose ps
```

### Step 3: Health Verification
```bash
# Check individual service health
docker-compose exec frontend curl -f http://localhost/health
docker-compose exec api curl -f http://localhost:3002/api/health
docker-compose exec nginx curl -f http://localhost/health
```

### Step 4: Database Initialization
```bash
# Connect to MySQL
docker-compose exec mysql mysql -u root -p

# Verify Redis
docker-compose exec redis redis-cli ping
```

## Service Management

### Starting Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend api
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop without removing containers
docker-compose stop
```

### Restarting Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart frontend
```

### Viewing Logs
```bash
# View all logs
docker-compose logs

# View logs for specific service
docker-compose logs -f frontend

# View recent logs
docker-compose logs --tail=50 frontend
```

## Health Monitoring

### Health Check Endpoints
- **Frontend**: `GET /health` - Returns 200 if healthy
- **API**: `GET /api/health` - Returns service status
- **Nginx**: `GET /health` - Returns proxy status
- **Database**: MySQL ping test
- **Cache**: Redis ping test

### Monitoring Service
The health monitor service:
- Checks all services every 60 seconds
- Sends alerts to configured webhooks
- Logs health status for audit trail
- Provides comprehensive system overview

### Health Monitor API
```bash
# Get system health status
curl http://localhost:3000/monitor-health

# Get service-specific health
curl http://localhost:3000/monitor-health?service=api
```

## Medical Compliance

### HIPAA Compliance Features
- **Data Encryption**: SSL/TLS for all communications
- **Access Control**: Role-based authentication
- **Audit Trail**: Comprehensive logging with Fluent-bit
- **Data Protection**: PHI classification in logs
- **Security Headers**: HIPAA-compliant HTTP headers

### LGPD Compliance Features
- **Data Consent**: Built-in consent management
- **Data Deletion**: User data removal capabilities
- **Access Logs**: Complete access audit trail
- **Data Protection**: Brazilian data protection standards

### Security Headers
```http
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
X-Medical-Application: Saraiva Vision
X-Compliance-Level: HIPAA/LGPD
X-Data-Classification: PHI
```

## Logging and Audit Trail

### Log Structure
```
logs/
├── nginx/           # Web server logs
├── api/             # Application logs
├── mysql/           # Database logs
├── redis/           # Cache logs
├── wordpress/       # CMS logs
└── health-monitor/  # Monitoring logs
```

### Fluent-bit Configuration
The log aggregator provides:
- **HIPAA-compliant logging**: All logs classified as PHI
- **Multiple outputs**: Elasticsearch, files, alerts
- **Real-time monitoring**: Live log aggregation
- **Audit trail**: Complete system activity log

### Log Access
```bash
# View real-time logs
docker-compose logs -f log-aggregator

# Access log files
docker-compose exec log-aggregator ls /var/log/saraiva/
```

## Backup and Recovery

### Database Backup
```bash
# Create MySQL backup
docker-compose exec mysql mysqldump -u root -p saraiva_vision > backup.sql

# Restore MySQL backup
docker-compose exec -T mysql mysql -u root -p saraiva_vision < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v saraiva-vision_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql-data.tar.gz -C /data .

# Restore volumes
docker run --rm -v saraiva-vision_mysql_data:/data -v $(pwd):/backup alpine tar xzf /backup/mysql-data.tar.gz -C /data
```

## Performance Optimization

### Container Resources
```yaml
# Memory limits per service
environment:
  - NODE_OPTIONS=--max-old-space-size=4096
```

### Database Optimization
- **Connection pooling**: Configured for high traffic
- **Index optimization**: Optimized for medical queries
- **Query cache**: Redis for frequent queries

### Frontend Optimization
- **Static caching**: Long-term cache for assets
- **Compression**: Gzip enabled
- **CDN ready**: Configured for CDN integration

## SSL/TLS Configuration

### Using Let's Encrypt
```bash
# Create SSL directory
mkdir -p /etc/letsencrypt

# Request certificate
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot
```

### SSL Configuration
```nginx
listen 443 ssl http2;
ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check Docker daemon
docker info

# Check port conflicts
docker ps -a

# View error logs
docker-compose logs
```

#### 2. Database Connection Issues
```bash
# Check MySQL logs
docker-compose logs mysql

# Test database connection
docker-compose exec mysql mysql -u root -p
```

#### 3. Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend

# Verify Nginx configuration
docker-compose exec nginx nginx -t
```

#### 4. High Resource Usage
```bash
# Monitor resource usage
docker stats

# Restart memory-intensive services
docker-compose restart frontend api
```

### Debug Commands
```bash
# Check container status
docker-compose ps

# View container processes
docker-compose top

# Access container shell
docker-compose exec frontend bash

# Check network connectivity
docker-compose exec frontend ping api
```

## Maintenance

### Regular Tasks
```bash
# Daily: Check logs
docker-compose logs --tail=100

# Weekly: Update containers
docker-compose pull
docker-compose up -d --force-recreate

# Monthly: Clean up
docker system prune -f
docker volume prune -f
```

### Updates
```bash
# Update Docker images
docker-compose pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

### Monitoring
```bash
# Real-time monitoring
docker stats

# Health check monitoring
watch -n 30 ./test-docker-deployment.sh

# Log monitoring
docker-compose logs -f --tail=100
```

## Security Best Practices

### Container Security
- **Non-root users**: All services run as non-root users
- **Read-only filesystems**: Where applicable
- **Resource limits**: Memory and CPU constraints
- **Network isolation**: Custom Docker network

### Data Security
- **Encryption**: SSL/TLS for all communications
- **Access control**: Role-based authentication
- **Audit logging**: Complete activity tracking
- **Backup encryption**: Encrypted backups

### Network Security
- **Firewall**: Only expose necessary ports
- **VPN**: Secure remote access
- **Rate limiting**: API rate limiting
- **CORS**: Proper CORS configuration

## Support

### Resources
- **Documentation**: This deployment guide
- **Health Checks**: Built-in monitoring
- **Logs**: Comprehensive logging system
- **Alerts**: Configurable webhook alerts

### Contact
For issues or questions:
- Check logs: `docker-compose logs`
- Run tests: `./test-docker-deployment.sh`
- Review health: `curl http://localhost:3000/monitor-health`

## License

This deployment configuration is part of the Saraiva Vision medical website project and is subject to the project's license terms.

---

**Note**: This deployment is designed for medical applications and includes HIPAA/LGPD compliance features. Ensure all environment variables are properly configured and security best practices are followed in production.