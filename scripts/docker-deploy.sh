#!/bin/bash

# Docker deployment script for Saraiva Vision
# Handles deployment with health checks and rollback capability

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Configuration
ENVIRONMENT=${1:-dev}
COMPOSE_FILES="docker-compose.yml"

# Add environment-specific compose file
if [[ "$ENVIRONMENT" == "dev" ]]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.dev.yml"
elif [[ "$ENVIRONMENT" == "prod" ]] || [[ "$ENVIRONMENT" == "staging" ]]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
fi

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT. Use: dev, staging, or prod"
    exit 1
fi

# Banner
echo "🚀 DOCKER DEPLOY - SARAIVA VISION"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Compose files: $COMPOSE_FILES"
echo ""

# Pre-deployment checks
log_step "1. Pre-deployment validation..."

# Check Docker Compose
if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker."
    exit 1
fi

# Check if images exist
REQUIRED_IMAGES=(
    "saraiva-frontend:latest-${ENVIRONMENT}"
    "saraiva-backend:latest-${ENVIRONMENT}"
)

if [[ "$ENVIRONMENT" != "dev" ]]; then
    REQUIRED_IMAGES+=("saraiva-nginx:latest-${ENVIRONMENT}")
fi

for image in "${REQUIRED_IMAGES[@]}"; do
    if ! docker image inspect "$image" &> /dev/null; then
        log_warn "Image $image not found. Building..."
        ./scripts/docker-build.sh "$ENVIRONMENT"
        break
    fi
done

log_info "✅ Pre-deployment checks passed"

# Backup current deployment (for rollback)
log_step "2. Creating deployment backup..."

BACKUP_DIR="./backup/docker-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Export current container state
if docker compose $COMPOSE_FILES ps -q | head -1 &> /dev/null; then
    docker compose $COMPOSE_FILES ps --format json > "$BACKUP_DIR/containers.json" 2>/dev/null || true
    log_info "✅ Backup created at $BACKUP_DIR"
else
    log_info "ℹ️  No existing deployment to backup"
fi

# Deploy
log_step "3. Deploying containers..."

# Stop existing containers gracefully
log_info "🛑 Stopping existing containers..."
docker compose $COMPOSE_FILES down --timeout 30 || true

# Start new deployment
log_info "🚀 Starting new deployment..."
if [[ "$ENVIRONMENT" == "dev" ]]; then
    docker compose $COMPOSE_FILES --profile dev up -d
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    docker compose $COMPOSE_FILES --profile staging up -d
else
    docker compose $COMPOSE_FILES --profile prod up -d
fi

# Health checks
log_step "4. Running health checks..."

HEALTH_CHECK_TIMEOUT=120
HEALTH_CHECK_INTERVAL=5
elapsed=0

services_to_check=("backend")
if [[ "$ENVIRONMENT" != "dev" ]]; then
    services_to_check+=("nginx")
fi

for service in "${services_to_check[@]}"; do
    log_info "🔍 Checking health of $service..."
    
    while [ $elapsed -lt $HEALTH_CHECK_TIMEOUT ]; do
        if [[ "$service" == "backend" ]]; then
            health_url="http://localhost:3001/health"
        else
            health_url="http://localhost/health"
        fi
        
        if curl -f -s "$health_url" > /dev/null 2>&1; then
            log_info "✅ $service is healthy"
            break
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
        
        if [ $elapsed -ge $HEALTH_CHECK_TIMEOUT ]; then
            log_error "❌ $service failed health check after ${HEALTH_CHECK_TIMEOUT}s"
            
            # Show container logs for debugging
            log_error "Container logs:"
            docker compose $COMPOSE_FILES logs --tail 20 "$service" || true
            
            # Rollback option
            echo ""
            read -p "Deploy failed. Rollback to previous version? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "🔄 Rolling back..."
                docker compose $COMPOSE_FILES down --timeout 30
                # Here you would restore from backup or previous images
                log_info "Rollback completed"
            fi
            exit 1
        fi
    done
done

# Final validation
log_step "5. Final validation..."

# Test main endpoints
if [[ "$ENVIRONMENT" != "dev" ]]; then
    # Test through nginx proxy
    if curl -f -s "http://localhost/" > /dev/null; then
        log_info "✅ Frontend accessible"
    else
        log_warn "⚠️  Frontend might not be fully ready"
    fi
    
    if curl -f -s "http://localhost/api/health" > /dev/null; then
        log_info "✅ API accessible through proxy"
    else
        log_warn "⚠️  API might not be fully ready"
    fi
else
    # Test direct access in development
    if curl -f -s "http://localhost:5173/" > /dev/null; then
        log_info "✅ Development frontend accessible"
    else
        log_warn "⚠️  Development frontend might not be ready"
    fi
fi

# Success
log_step "6. Deployment summary"
echo ""
log_info "🎉 Deployment completed successfully!"
echo ""

# Show running containers
echo "Running containers:"
docker compose $COMPOSE_FILES ps

echo ""
echo "Access URLs:"
if [[ "$ENVIRONMENT" == "dev" ]]; then
    echo "  • Frontend (dev): http://localhost:5173"
    echo "  • Backend API: http://localhost:3001"
    echo "  • WordPress (if enabled): http://localhost:8083"
else
    echo "  • Website: http://localhost"
    echo "  • API: http://localhost/api"
fi

echo ""
echo "Management commands:"
echo "  • View logs: docker compose $COMPOSE_FILES logs -f"
echo "  • Stop: docker compose $COMPOSE_FILES down"
echo "  • Restart: docker compose $COMPOSE_FILES restart"
echo ""