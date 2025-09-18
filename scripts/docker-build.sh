#!/bin/bash

# Docker build script for Saraiva Vision
# Builds all services with proper tagging

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
GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "local")
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION="2.0.0"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT. Use: dev, staging, or prod"
    exit 1
fi

# Banner
echo "🐳 DOCKER BUILD - SARAIVA VISION"
echo "================================="
echo "Environment: $ENVIRONMENT"
echo "Git SHA: $GIT_SHA"
echo "Version: $VERSION"
echo ""

# Pre-build checks
log_step "1. Pre-build validation..."

# Check Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker not found. Please install Docker."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running."
    exit 1
fi

# Check .env files
if [[ "$ENVIRONMENT" == "prod" ]] && [[ ! -f ".env.production" ]]; then
    log_warn "Production .env file not found. Using defaults."
fi

log_info "✅ Pre-build checks passed"

# Build images
log_step "2. Building Docker images..."

export DOCKER_BUILDKIT=1

# Build frontend
log_info "📦 Building frontend image..."
docker build \
    --file infra/docker/frontend/Dockerfile \
    --target production \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg VERSION="$VERSION" \
    --build-arg GIT_SHA="$GIT_SHA" \
    --tag "saraiva-frontend:${VERSION}-${GIT_SHA}-${ENVIRONMENT}" \
    --tag "saraiva-frontend:latest-${ENVIRONMENT}" \
    .

# Build backend
log_info "📦 Building backend image..."
docker build \
    --file infra/docker/backend/Dockerfile \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg VERSION="$VERSION" \
    --build-arg GIT_SHA="$GIT_SHA" \
    --tag "saraiva-backend:${VERSION}-${GIT_SHA}-${ENVIRONMENT}" \
    --tag "saraiva-backend:latest-${ENVIRONMENT}" \
    .

# Build nginx proxy
log_info "📦 Building nginx proxy image..."
docker build \
    --file infra/docker/nginx/Dockerfile \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg VERSION="$VERSION" \
    --build-arg GIT_SHA="$GIT_SHA" \
    --tag "saraiva-nginx:${VERSION}-${GIT_SHA}-${ENVIRONMENT}" \
    --tag "saraiva-nginx:latest-${ENVIRONMENT}" \
    .

# Validation
log_step "3. Validating builds..."

IMAGES=(
    "saraiva-frontend:latest-${ENVIRONMENT}"
    "saraiva-backend:latest-${ENVIRONMENT}"
    "saraiva-nginx:latest-${ENVIRONMENT}"
)

for image in "${IMAGES[@]}"; do
    if docker image inspect "$image" &> /dev/null; then
        log_info "✅ $image built successfully"
    else
        log_error "❌ Failed to build $image"
        exit 1
    fi
done

# Summary
log_step "4. Build summary"
echo ""
log_info "🎉 All images built successfully!"
echo ""
echo "Built images:"
for image in "${IMAGES[@]}"; do
    echo "  • $image"
done
echo ""
echo "Next steps:"
echo "  • Development: docker compose --profile dev up"
echo "  • Staging: docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile staging up"  
echo "  • Production: docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d"
echo ""