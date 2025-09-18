# Docker Healthcheck Example Usage

## Quick Start Example

This example demonstrates the complete Docker healthcheck implementation for Saraiva Vision medical clinic website.

### 1. Start Services in Production Mode

```bash
# Start all services with production healthcheck settings
make up

# Expected output:
[+] Running 5/5
 ✔ Container saraiva-mysql      Healthy
 ✔ Container saraiva-wordpress  Healthy
 ✔ Container saraiva-api        Healthy
 ✔ Container saraiva-frontend   Healthy
 ✔ Container saraiva-nginx      Started
```

### 2. Monitor Health Status

```bash
# Check container health status
make health-check

# Expected output:
Checking Docker container health status...
NAME                  IMAGE                         STATUS          PORTS
saraiva-mysql         mysql:8.0                     Up (healthy)    3306/tcp
saraiva-wordpress     wordpress:6.6-php8.3-apache  Up (healthy)    0.0.0.0:8083->80/tcp
saraiva-api           saraiva-api                   Up (healthy)    3001/tcp
saraiva-frontend      saraiva-frontend              Up (healthy)    80/tcp
saraiva-nginx         saraiva-nginx                 Up (healthy)    0.0.0.0:8082->80/tcp

Individual service health:
/saraiva-mysql: healthy
/saraiva-wordpress: healthy
/saraiva-api: healthy
/saraiva-frontend: healthy
/saraiva-nginx: healthy
```

### 3. Test All Health Endpoints

```bash
# Run comprehensive health tests
make health-test

# Expected output:
🏥 Testing Saraiva Vision Docker Health Checks
=================================================
URL: http://localhost:8082
Timeout: 300s

1. Waiting for services to be ready...
Waiting for Nginx proxy to be healthy... ✓
Waiting for Frontend to be healthy... ✓
Waiting for API to be healthy... ✓
Waiting for WordPress to be healthy... ✓

2. Testing health endpoints...
Testing Nginx health endpoint... ✓
Testing Frontend health endpoint... ✓
Testing API health endpoint... ✓

3. Checking Docker container health status...
Checking Docker container saraiva-nginx... ✓ healthy
Checking Docker container saraiva-frontend... ✓ healthy
Checking Docker container saraiva-api... ✓ healthy
Checking Docker container saraiva-wordpress... ✓ healthy
Checking Docker container saraiva-mysql... ✓ healthy

4. Testing medical clinic specific endpoints...
Testing WordPress API posts endpoint... ✓
Testing homepage accessibility... ✓

🎉 All Docker health checks passed!

Health check URLs:
  - Nginx:     http://localhost:8082/health
  - Frontend:  http://localhost:8082/health.json
  - API:       http://localhost:8082/api/health
  - WordPress: http://localhost:8082/wp-json/wp/v2/

Service URLs:
  - Main site: http://localhost:8082/
  - Admin:     http://localhost:8082:8084 (phpMyAdmin, use profile: admin)
```

### 4. Individual Health Endpoint Examples

#### API Health Response
```bash
curl http://localhost:8082/api/health
```

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

#### Frontend Health Response
```bash
curl http://localhost:8082/health.json
```

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

#### Nginx Health Response
```bash
curl http://localhost:8082/health
```

```json
{
  "status": "healthy",
  "service": "nginx-proxy",
  "timestamp": "2024-01-15T10:30:00+00:00"
}
```

### 5. Development Mode (Faster Health Checks)

```bash
# Start with faster health checks for development
make up-staging

# This uses 10-second intervals instead of 30-second intervals
# Services start up faster but use more resources for monitoring
```

### 6. Troubleshooting Example

If a service fails health checks:

```bash
# Check logs for failing service
docker compose logs api

# Example output for API issues:
saraiva-api | Error: Cannot connect to database
saraiva-api | API server listening on http://localhost:3001
saraiva-api | Health check failed: database connection error

# Restart the failing service
docker compose restart api

# Monitor health recovery
watch -n 2 'make health-check'
```

### 7. Service Dependency Chain Example

The services start in this order due to health dependencies:

1. **MySQL Database** (no dependencies)
2. **WordPress** (waits for MySQL healthy)
3. **API Server** (independent, starts parallel to WordPress)
4. **Frontend** (independent, starts parallel to others)
5. **Nginx Proxy** (waits for API, Frontend, and WordPress all healthy)

```bash
# You can see this in action:
docker compose up -d --no-deps mysql
# Wait for MySQL to be healthy...

docker compose up -d --no-deps wordpress
# WordPress waits for MySQL health before starting...

docker compose up -d --no-deps api frontend
# These start independently...

docker compose up -d nginx
# Nginx waits for all services to be healthy...
```

### 8. Clean Up

```bash
# Stop all services
make down

# Remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Summary

This Docker healthcheck implementation provides:

✅ **Reliable Service Startup**: Services wait for dependencies to be healthy  
✅ **Health Monitoring**: All services provide health status endpoints  
✅ **Medical Compliance**: Healthcare-safe error handling and logging  
✅ **Development Efficiency**: Fast staging mode for development  
✅ **Production Ready**: Robust health checks for production deployment  
✅ **Comprehensive Testing**: Full test suite validates all health endpoints  

The implementation ensures that the Saraiva Vision medical clinic website runs reliably with proper service health monitoring and dependency management.