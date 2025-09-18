# Quick Start: Docker Containerization

## Overview
This guide helps you quickly verify the Docker containerization implementation for the Saraiva Vision medical website. Follow these steps to validate that all services work correctly in containerized form.

## Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- 4GB RAM available
- 10GB disk space

### Verification Commands
```bash
# Verify Docker installation
docker --version
docker compose version

# Check available resources
docker system df
free -h
```

## Development Environment Setup

### 1. Clone and Navigate
```bash
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
cd saraivavision-site-v2
git checkout 004-docker-containerization
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.docker

# Edit Docker-specific environment variables
nano .env.docker
```

Required variables:
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3001
GOOGLE_MAPS_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### 3. Start Development Environment
```bash
# Build and start all services
docker compose -f docker-compose.dev.yml up --build

# Verify all services are healthy
docker compose -f docker-compose.dev.yml ps
```

Expected output:
```
NAME                STATUS              PORTS
saraivavision-frontend   Up (healthy)       0.0.0.0:3002->3002/tcp
saraivavision-api        Up (healthy)
saraivavision-wordpress  Up (healthy)
saraivavision-nginx      Up (healthy)       0.0.0.0:80->80/tcp
```

### 4. Verify Services

#### Frontend (React)
```bash
# Check frontend health
curl http://localhost:3002/health

# Verify hot reload works
echo "// Test comment" >> src/App.jsx
# Browser should auto-refresh
```

#### API (Node.js)
```bash
# Check API health
curl http://localhost:3001/api/health

# Test API endpoints
curl http://localhost:3001/api/reviews
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

#### WordPress (PHP-FPM)
```bash
# Check WordPress health
curl http://localhost:8083/wp-json/wp/v2/posts

# Access WordPress admin
open http://localhost:8083/wp-admin
```

#### Nginx (Reverse Proxy)
```bash
# Check Nginx health
curl http://localhost/health

# Verify proxy routing
curl http://localhost/api/health  # Should proxy to API
curl http://localhost/wp-json/wp/v2/posts  # Should proxy to WordPress
```

## Production Environment Setup

### 1. Production Configuration
```bash
# Copy production environment template
cp .env.example .env.production

# Configure production variables
nano .env.production
```

Required production variables:
```env
NODE_ENV=production
DOMAIN=saraivavision.com.br
SSL_EMAIL=admin@saraivavision.com.br
GOOGLE_MAPS_API_KEY=production_key
SUPABASE_URL=production_url
SUPABASE_ANON_KEY=production_key
```

### 2. SSL Certificate Setup
```bash
# Ensure SSL certificates exist
sudo ls -la /etc/letsencrypt/live/saraivavision.com.br/

# If certificates don't exist, generate them first
sudo certbot certonly --standalone -d saraivavision.com.br
```

### 3. Start Production Environment
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# Verify production deployment
docker compose -f docker-compose.prod.yml ps
```

### 4. Production Health Checks
```bash
# SSL verification
curl -I https://saraivavision.com.br/health

# Performance test
curl -w "@curl-format.txt" -o /dev/null -s https://saraivavision.com.br/

# Security headers check
curl -I https://saraivavision.com.br/ | grep -E "(X-|Content-Security|Strict-Transport)"
```

## Validation Checklist

### ✅ Development Environment
- [ ] All containers start successfully
- [ ] Frontend accessible at http://localhost:3002
- [ ] API responds at http://localhost:3001/api/health
- [ ] WordPress admin accessible at http://localhost:8083/wp-admin
- [ ] Hot reload works for React development
- [ ] Source code changes reflect immediately
- [ ] All npm scripts work within containers

### ✅ Production Environment
- [ ] All containers start with production configuration
- [ ] HTTPS works with valid SSL certificates
- [ ] All API endpoints respond correctly
- [ ] WordPress integration works via API proxy
- [ ] Static assets serve efficiently
- [ ] Security headers present in responses
- [ ] Performance meets baseline requirements

### ✅ Service Integration
- [ ] Frontend can call API endpoints
- [ ] API can proxy WordPress requests
- [ ] WordPress serves content via API
- [ ] Nginx properly routes all requests
- [ ] Health checks pass for all services
- [ ] Container logs show no errors

### ✅ Data Persistence
- [ ] WordPress database persists across restarts
- [ ] User uploads persist in WordPress
- [ ] Container logs are accessible
- [ ] SSL certificates mount correctly

## Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check container logs
docker compose -f docker-compose.dev.yml logs [service-name]

# Check resource usage
docker system df
docker stats

# Verify configuration
docker compose -f docker-compose.dev.yml config
```

#### Health Check Failures
```bash
# Manual health check
docker exec saraivavision-api curl http://localhost:3001/api/health

# Check service dependencies
docker compose -f docker-compose.dev.yml top

# Verify network connectivity
docker network ls
docker network inspect saraivavision_internal
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats --no-stream

# Check container resource limits
docker inspect saraivavision-frontend | grep -A 10 "Resources"

# Verify memory/CPU allocation
docker system events --filter container=saraivavision-api
```

#### SSL Certificate Issues
```bash
# Verify certificate files
sudo ls -la /etc/letsencrypt/live/saraivavision.com.br/

# Check certificate expiration
sudo openssl x509 -in /etc/letsencrypt/live/saraivavision.com.br/cert.pem -text -noout | grep "Not After"

# Test certificate mounting
docker exec saraivavision-nginx ls -la /etc/letsencrypt/live/saraivavision.com.br/
```

### Debug Commands

#### Container Inspection
```bash
# Get container details
docker inspect [container-name]

# Execute shell in container
docker exec -it [container-name] /bin/sh

# View container processes
docker exec [container-name] ps aux
```

#### Network Debugging
```bash
# Test inter-container communication
docker exec saraivavision-frontend ping api
docker exec saraivavision-nginx curl http://api:3001/api/health

# Check port bindings
docker port saraivavision-nginx
```

#### Log Analysis
```bash
# Follow logs in real-time
docker compose -f docker-compose.dev.yml logs -f

# Get logs for specific timeframe
docker logs --since="1h" saraivavision-api

# Export logs for analysis
docker logs saraivavision-nginx 2>&1 | grep ERROR
```

## Performance Verification

### Load Testing
```bash
# Install testing tools
npm install -g autocannon

# Test frontend performance
autocannon -c 10 -d 30s http://localhost:3002

# Test API performance
autocannon -c 10 -d 30s http://localhost:3001/api/health

# Test full stack
autocannon -c 5 -d 30s http://localhost
```

### Resource Monitoring
```bash
# Monitor resource usage over time
watch docker stats

# Check disk usage
docker system df

# Monitor container health
watch 'docker compose -f docker-compose.dev.yml ps'
```

## Next Steps

After successful validation:

1. **Development Workflow**: Update team documentation for Docker-based development
2. **CI/CD Integration**: Configure GitHub Actions for containerized builds
3. **Production Deployment**: Plan rolling deployment strategy
4. **Monitoring Setup**: Implement container monitoring and alerting
5. **Backup Strategy**: Adapt backup procedures for containerized data

## Success Criteria Met

When all checklist items pass, the containerization implementation is ready for:
- ✅ Team adoption for development
- ✅ Production deployment preparation
- ✅ CI/CD pipeline integration
- ✅ Performance optimization
- ✅ Monitoring and observability setup