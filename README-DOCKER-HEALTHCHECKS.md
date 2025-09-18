# Docker Healthchecks - Saraiva Vision Medical Clinic

## Overview

This document describes the comprehensive Docker healthcheck implementation for the Saraiva Vision medical clinic website. All services include proper health monitoring to ensure reliable operation and compliance with medical data handling requirements.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                     │
│                   (Port 8082, /health)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
      ┌───────────────┼───────────────┐
      │               │               │
┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ Frontend  │  │    API    │  │WordPress  │
│/health.json│  │/api/health│  │/wp-json/  │
└───────────┘  └───────────┘  └─────┬─────┘
                                     │
                               ┌─────▼─────┐
                               │  MySQL    │
                               │(mysqladmin│
                               │   ping)   │
                               └───────────┘
```

## Services and Health Endpoints

### 1. Nginx Reverse Proxy
- **Container**: `saraiva-nginx`
- **Port**: 8082
- **Health**: `GET /health`
- **Response**: JSON with nginx status and timestamp
- **Dependencies**: frontend, api, wordpress (all healthy)

### 2. Frontend (React App)
- **Container**: `saraiva-frontend`
- **Health**: `GET /health.json`
- **Response**: Static JSON with build info and status
- **Dependencies**: None

### 3. API Server (Node.js)
- **Container**: `saraiva-api`
- **Port**: 3001 (internal)
- **Health**: `GET /api/health`
- **Response**: JSON with service metrics, uptime, memory usage
- **Dependencies**: None

### 4. WordPress CMS
- **Container**: `saraiva-wordpress`
- **Health**: `GET /wp-json/wp/v2/`
- **Response**: WordPress REST API root
- **Dependencies**: MySQL database (healthy)

### 5. MySQL Database
- **Container**: `saraiva-mysql`
- **Health**: `mysqladmin ping`
- **Response**: Connection status
- **Dependencies**: None

## Quick Start

### Start All Services
```bash
# Production (slower, more reliable health checks)
make up

# Staging (faster health checks for development)
make up-staging

# With admin interface (phpMyAdmin)
docker compose --profile admin up -d
```

### Check Health Status
```bash
# Quick status check
make health-check

# Comprehensive health test
make health-test

# View logs
make docker-logs
```

### Access Points
- **Main Website**: http://localhost:8082/
- **Health Endpoints**:
  - Nginx: http://localhost:8082/health
  - Frontend: http://localhost:8082/health.json
  - API: http://localhost:8082/api/health
  - WordPress: http://localhost:8082/wp-json/wp/v2/
- **Admin**: http://localhost:8084/ (with `--profile admin`)

## Health Check Configuration

### Production Settings
```yaml
healthcheck:
  interval: 30s      # Check every 30 seconds
  timeout: 10s       # Timeout after 10 seconds
  retries: 3         # Retry 3 times before marking unhealthy
  start_period: 15s  # Grace period during startup
```

### Staging Settings (Faster)
```yaml
healthcheck:
  interval: 10s      # Check every 10 seconds
  timeout: 5s        # Timeout after 5 seconds
  retries: 3         # Retry 3 times before marking unhealthy
  start_period: 5s   # Shorter grace period
```

## Health Check Responses

### API Health Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "saraiva-vision-api",
  "version": "2.0.0",
  "uptime": 3600.25,
  "memory": {
    "rss": 48877568,
    "heapTotal": 5480448,
    "heapUsed": 4291384,
    "external": 2174597,
    "arrayBuffers": 16619
  },
  "checks": {
    "server": "ok",
    "rateLimit": "ok"
  }
}
```

### Frontend Health Response
```json
{
  "status": "healthy",
  "service": "saraiva-vision-frontend",
  "version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "description": "Clínica Saraiva Vision - Frontend Health Check",
  "checks": {
    "static_files": "ok",
    "build": "ok"
  }
}
```

### Nginx Health Response  
```json
{
  "status": "healthy",
  "service": "nginx-proxy",
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

## Troubleshooting

### Service Startup Issues

1. **Check container status**:
   ```bash
   docker compose ps
   make health-check
   ```

2. **View logs for failing service**:
   ```bash
   docker compose logs <service-name>
   # Examples:
   docker compose logs nginx
   docker compose logs api
   docker compose logs wordpress
   ```

3. **Restart individual service**:
   ```bash
   docker compose restart <service-name>
   ```

### Health Check Failures

#### MySQL Connection Issues
```bash
# Check database connectivity
docker compose exec db mysqladmin ping -u saraiva_user -p

# Reset database if needed
docker compose down -v  # WARNING: Removes all data
docker compose up -d
```

#### WordPress Not Ready
```bash
# Check WordPress installation
curl -I http://localhost:8082/wp-json/wp/v2/

# Access WordPress setup (if needed)
curl http://localhost:8082/wp-admin/install.php
```

#### API Health Endpoint Issues
```bash
# Test API directly
curl http://localhost:8082/api/health

# Check API logs
docker compose logs api

# Restart API
docker compose restart api
```

### Performance Issues

#### Slow Health Checks
- Use staging configuration for development: `make up-staging`
- Reduce health check intervals in docker-compose.staging.yml

#### Resource Constraints
- Monitor container resources: `docker stats`
- Adjust resource limits in docker-compose.yml if needed

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd saraiva-vision-site

# Build and start services
make build-web
make up-staging
```

### 2. Wait for Services
```bash
# Wait for all services to be healthy
make health-test
```

### 3. Development
```bash
# View logs while developing
make docker-logs

# Check health periodically
make health-check
```

### 4. Testing
```bash
# Run health check tests
npm test tests/healthcheck.test.js

# Run smoke tests
./scripts/docker-health-test.sh
```

## Security Considerations

### Medical Data Compliance
- All containers run with non-root users where possible
- Sensitive environment variables are properly isolated
- Health endpoints don't expose sensitive information
- Rate limiting is implemented for API endpoints

### Network Security
- Services communicate over internal Docker network
- Only nginx proxy is exposed to host
- Database is completely internal
- WordPress admin is protected

### Container Security
- Base images are kept minimal (Alpine Linux)
- Security updates are applied during build
- Secrets are managed through environment variables
- File permissions are properly configured

## Monitoring and Alerts

### Health Check Monitoring
The health checks provide the foundation for external monitoring systems:

1. **HTTP Monitoring**: Monitor nginx health endpoint
2. **Container Health**: Use Docker health status
3. **Application Metrics**: API health provides performance data
4. **Database Monitoring**: MySQL health indicates DB status

### Integration with Monitoring Tools
```bash
# Prometheus health check endpoint
curl http://localhost:8082/health

# Docker health status for monitoring
docker inspect --format='{{.State.Health.Status}}' saraiva-nginx
```

## Files and Structure

```
├── docker-compose.yml              # Main composition
├── docker-compose.staging.yml      # Development overrides
├── infra/docker/
│   ├── frontend/Dockerfile         # Frontend container
│   ├── api/Dockerfile              # API server container
│   └── nginx/
│       ├── Dockerfile              # Nginx proxy container
│       └── nginx.conf              # Nginx configuration
├── public/health.json              # Frontend health endpoint
├── scripts/docker-health-test.sh   # Health test script
├── tests/healthcheck.test.js       # Health check tests
└── README-DOCKER-HEALTHCHECKS.md  # This file
```

## Changelog

### v2.0.0 - Docker Healthchecks Implementation
- ✅ Added `/api/health` endpoint to Node.js API
- ✅ Created static `/health.json` for frontend
- ✅ Implemented comprehensive Docker Compose with healthchecks
- ✅ Added service dependencies with `condition: service_healthy`
- ✅ Created optimized Dockerfiles for all services
- ✅ Added staging configuration for faster development
- ✅ Implemented comprehensive test suite
- ✅ Added health testing scripts and Makefile targets
- ✅ Updated documentation with health check details

## Support

For issues related to Docker healthchecks:

1. Check service logs: `make docker-logs`
2. Run health test: `make health-test`
3. Review this documentation
4. Check Docker Compose documentation
5. Contact development team

---

**Clínica Saraiva Vision**  
Dr. Philipe Saraiva Cruz - CRM-MG 69.870  
Caratinga, Minas Gerais