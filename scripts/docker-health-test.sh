#!/usr/bin/env bash
set -Eeuo pipefail

# Docker Health Check Test Script for Saraiva Vision
# Tests all health endpoints after services are up

URL="${1:-http://localhost:8082}"
TIMEOUT="${2:-300}"  # 5 minutes timeout

echo "🏥 Testing Saraiva Vision Docker Health Checks"
echo "================================================="
echo "URL: $URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to wait for service
wait_for_service() {
    local service_url="$1"
    local service_name="$2"
    local max_attempts=$((TIMEOUT / 5))
    local attempt=1
    
    echo -n "Waiting for $service_name to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -sf "$service_url" > /dev/null 2>&1; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        echo -n "."
        sleep 5
        ((attempt++))
    done
    
    echo -e " ${RED}✗ TIMEOUT${NC}"
    return 1
}

# Function to test health endpoint
test_health_endpoint() {
    local endpoint="$1"
    local service_name="$2"
    local expected_status="${3:-healthy}"
    
    echo -n "Testing $service_name health endpoint..."
    
    local response
    local http_code
    
    response=$(curl -s "$endpoint")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
    
    if [ "$http_code" != "200" ]; then
        echo -e " ${RED}✗ HTTP $http_code${NC}"
        return 1
    fi
    
    # Check if response contains expected status
    if echo "$response" | grep -q "\"status\":\"$expected_status\""; then
        echo -e " ${GREEN}✓${NC}"
        return 0
    else
        echo -e " ${RED}✗ Unexpected status${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to check Docker container health
check_container_health() {
    local container_name="$1"
    
    echo -n "Checking Docker container $container_name..."
    
    local health_status
    health_status=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null || echo "not_found")
    
    case "$health_status" in
        "healthy")
            echo -e " ${GREEN}✓ healthy${NC}"
            return 0
            ;;
        "unhealthy")
            echo -e " ${RED}✗ unhealthy${NC}"
            return 1
            ;;
        "starting")
            echo -e " ${YELLOW}⚠ starting${NC}"
            return 1
            ;;
        "not_found")
            echo -e " ${YELLOW}⚠ not running${NC}"
            return 1
            ;;
        *)
            echo -e " ${RED}✗ unknown status: $health_status${NC}"
            return 1
            ;;
    esac
}

# Test sequence
echo "1. Waiting for services to be ready..."
wait_for_service "$URL/health" "Nginx proxy" || exit 1
wait_for_service "$URL/health.json" "Frontend" || exit 1
wait_for_service "$URL/api/health" "API" || exit 1
wait_for_service "$URL/wp-json/wp/v2/" "WordPress" || exit 1

echo ""
echo "2. Testing health endpoints..."
test_health_endpoint "$URL/health" "Nginx" || exit 1
test_health_endpoint "$URL/health.json" "Frontend" || exit 1
test_health_endpoint "$URL/api/health" "API" || exit 1

echo ""
echo "3. Checking Docker container health status..."
check_container_health "saraiva-nginx" || exit 1
check_container_health "saraiva-frontend" || exit 1
check_container_health "saraiva-api" || exit 1
check_container_health "saraiva-wordpress" || exit 1
check_container_health "saraiva-mysql" || exit 1

echo ""
echo "4. Testing medical clinic specific endpoints..."
echo -n "Testing WordPress API posts endpoint..."
if curl -sf "$URL/wp-json/wp/v2/posts" > /dev/null; then
    echo -e " ${GREEN}✓${NC}"
else
    echo -e " ${YELLOW}⚠ No posts yet (normal for new installation)${NC}"
fi

echo -n "Testing homepage accessibility..."
if curl -sf "$URL/" | grep -q "Saraiva\|Clínica"; then
    echo -e " ${GREEN}✓${NC}"
else
    echo -e " ${YELLOW}⚠ Clinic content not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All Docker health checks passed!${NC}"
echo ""
echo "Health check URLs:"
echo "  - Nginx:     $URL/health"
echo "  - Frontend:  $URL/health.json"
echo "  - API:       $URL/api/health"
echo "  - WordPress: $URL/wp-json/wp/v2/"
echo ""
echo "Service URLs:"
echo "  - Main site: $URL/"
echo "  - Admin:     $URL:8084 (phpMyAdmin, use profile: admin)"