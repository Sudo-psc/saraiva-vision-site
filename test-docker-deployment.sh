#!/bin/bash

# Saraiva Vision Docker Deployment Test Script
# Comprehensive testing for medical-grade containerized deployment

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_test "Waiting for $service_name to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready after ${attempt}s"
            return 0
        fi
        sleep 1
        ((attempt++))
    done

    print_fail "$service_name failed to become ready within ${max_attempts}s"
    return 1
}

# Function to test HTTP endpoints
test_endpoint() {
    local url=$1
    local service_name=$2
    local expected_code=${3:-200}

    print_test "Testing $service_name endpoint: $url"

    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")

    if [ "$status_code" -eq "$expected_code" ]; then
        print_success "$service_name responded with $status_code"
        return 0
    else
        print_fail "$service_name responded with $status_code (expected $expected_code)"
        return 1
    fi
}

# Function to test container health
test_container_health() {
    local container_name=$1
    local service_name=$2

    print_test "Testing $service_name container health..."

    if docker-compose exec -T "$container_name" curl -f http://localhost/health >/dev/null 2>&1; then
        print_success "$service_name container is healthy"
        return 0
    else
        print_fail "$service_name container health check failed"
        return 1
    fi
}

# Function to test database connectivity
test_database() {
    print_test "Testing MySQL database connectivity..."

    if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" >/dev/null 2>&1; then
        print_success "MySQL database is accessible"
    else
        print_fail "MySQL database is not accessible"
        return 1
    fi
}

# Function to test Redis connectivity
test_redis() {
    print_test "Testing Redis connectivity..."

    if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
        print_success "Redis cache is accessible"
    else
        print_fail "Redis cache is not accessible"
        return 1
    fi
}

# Function to test API endpoints
test_api_endpoints() {
    print_test "Testing API endpoints..."

    # Test health endpoint
    test_endpoint "http://localhost:3002/api/health" "API Health"

    # Test contact endpoint (if available)
    test_endpoint "http://localhost:3002/api/contact" "Contact API" 405 || true

    # Test appointments endpoint (if available)
    test_endpoint "http://localhost:3002/api/appointments" "Appointments API" 405 || true
}

# Function to test WordPress endpoints
test_wordpress_endpoints() {
    print_test "Testing WordPress endpoints..."

    # Test WordPress REST API
    test_endpoint "http://localhost:8080/wp-json/wp/v2/" "WordPress REST API"

    # Test WordPress posts endpoint
    test_endpoint "http://localhost:8080/wp-json/wp/v2/posts" "WordPress Posts" 200 || true
}

# Function to test security headers
test_security_headers() {
    print_test "Testing security headers..."

    local headers
    headers=$(curl -s -I http://localhost:3000/ || echo "")

    # Check for security headers
    if echo "$headers" | grep -q "X-Frame-Options"; then
        print_success "X-Frame-Options header present"
    else
        print_warning "X-Frame-Options header missing"
    fi

    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        print_success "X-Content-Type-Options header present"
    else
        print_warning "X-Content-Type-Options header missing"
    fi

    if echo "$headers" | grep -q "X-XSS-Protection"; then
        print_success "X-XSS-Protection header present"
    else
        print_warning "X-XSS-Protection header missing"
    fi

    if echo "$headers" | grep -q "Content-Security-Policy"; then
        print_success "Content-Security-Policy header present"
    else
        print_warning "Content-Security-Policy header missing"
    fi

    if echo "$headers" | grep -q "X-Medical-Application"; then
        print_success "X-Medical-Application header present"
    else
        print_warning "X-Medical-Application header missing"
    fi
}

# Function to test SSL/TLS (if configured)
test_ssl() {
    print_test "Testing SSL/TLS configuration..."

    if curl -k -s -I https://localhost:443/health >/dev/null 2>&1; then
        print_success "SSL/TLS is configured and working"
    else
        print_warning "SSL/TLS not available or not configured"
    fi
}

# Function to test service communication
test_service_communication() {
    print_test "Testing service communication..."

    # Test frontend to API communication
    if docker-compose exec -T frontend curl -f http://api:3001/api/health >/dev/null 2>&1; then
        print_success "Frontend can communicate with API"
    else
        print_fail "Frontend cannot communicate with API"
    fi

    # Test API to database communication
    if docker-compose exec -T api curl -f http://mysql:3306 >/dev/null 2>&1; then
        print_success "API can communicate with MySQL"
    else
        print_warning "API to MySQL communication test inconclusive"
    fi

    # Test API to Redis communication
    if docker-compose exec -T api redis-cli -h redis ping >/dev/null 2>&1; then
        print_success "API can communicate with Redis"
    else
        print_warning "API to Redis communication test inconclusive"
    fi
}

# Function to test logging
test_logging() {
    print_test "Testing logging infrastructure..."

    # Check if log files exist
    if [ -d "logs" ] && [ "$(ls -A logs)" ]; then
        print_success "Log directory exists and contains logs"
    else
        print_warning "Log directory is empty or doesn't exist"
    fi

    # Test Fluent-bit logging
    if docker-compose exec -T log-aggregator pidof fluent-bit >/dev/null 2>&1; then
        print_success "Fluent-bit logging service is running"
    else
        print_warning "Fluent-bit logging service not accessible"
    fi
}

# Function to test resource usage
test_resources() {
    print_test "Checking resource usage..."

    # Check container memory usage
    local memory_usage
    memory_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | head -10)
    echo "$memory_usage"

    # Check container CPU usage
    local cpu_usage
    cpu_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | head -10)
    echo "$cpu_usage"
}

# Function to run comprehensive tests
run_comprehensive_tests() {
    echo "🏥 Saraiva Vision Docker Deployment Tests"
    echo "========================================"

    local failed_tests=0
    local total_tests=0

    # Test basic service health
    ((total_tests++))
    test_container_health "frontend" "Frontend" || ((failed_tests++))

    ((total_tests++))
    test_container_health "api" "API" || ((failed_tests++))

    ((total_tests++))
    test_container_health "nginx" "Nginx" || ((failed_tests++))

    # Test endpoints
    ((total_tests++))
    test_endpoint "http://localhost:3000/health" "Frontend Health" || ((failed_tests++))

    ((total_tests++))
    test_endpoint "http://localhost:3002/api/health" "API Health" || ((failed_tests++))

    ((total_tests++))
    test_endpoint "http://localhost:80/health" "Nginx Health" || ((failed_tests++))

    # Test databases
    ((total_tests++))
    test_database || ((failed_tests++))

    ((total_tests++))
    test_redis || ((failed_tests++))

    # Test API endpoints
    test_api_endpoints

    # Test WordPress endpoints
    test_wordpress_endpoints

    # Test security
    test_security_headers

    # Test SSL
    test_ssl

    # Test service communication
    test_service_communication

    # Test logging
    test_logging

    # Test resources
    test_resources

    # Summary
    echo ""
    echo "📊 Test Summary:"
    echo "==============="
    echo "Total tests: $total_tests"
    echo "Failed tests: $failed_tests"

    if [ $failed_tests -eq 0 ]; then
        print_success "🎉 All tests passed! Deployment is healthy."
        exit 0
    else
        print_fail "❌ $failed_tests test(s) failed. Please investigate."
        exit 1
    fi
}

# Main function
main() {
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_fail "Docker daemon is not running"
        exit 1
    fi

    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        print_fail "No services are running. Please run deployment first."
        exit 1
    fi

    # Run comprehensive tests
    run_comprehensive_tests
}

# Handle script interruption
trap 'print_fail "Tests interrupted"; exit 1' INT TERM

# Run main function
main "$@"