#!/bin/bash

# Docker Health Check Validation Script
# Validates that all containerized services are healthy and responding correctly

set -euo pipefail

# Configuration
COMPOSE_FILE_DEV="${COMPOSE_FILE_DEV:-docker-compose.dev.yml}"
COMPOSE_FILE_PROD="${COMPOSE_FILE_PROD:-docker-compose.prod.yml}"
TIMEOUT="${TIMEOUT:-30}"
RETRY_INTERVAL="${RETRY_INTERVAL:-5}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}[VERBOSE]${NC} $1"
    fi
}

# Usage information
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Docker Health Check Validation Script

OPTIONS:
    -f, --compose-file FILE     Docker Compose file to use (default: docker-compose.dev.yml)
    -t, --timeout SECONDS       Health check timeout in seconds (default: 30)
    -i, --interval SECONDS      Retry interval in seconds (default: 5)
    -v, --verbose               Enable verbose logging
    -h, --help                  Show this help message

EXAMPLES:
    $0                          Check development environment
    $0 -f docker-compose.prod.yml  Check production environment
    $0 -t 60 -v                 Check with 60s timeout and verbose logging

ENVIRONMENT VARIABLES:
    COMPOSE_FILE_DEV            Development compose file (default: docker-compose.dev.yml)
    COMPOSE_FILE_PROD           Production compose file (default: docker-compose.prod.yml)
    TIMEOUT                     Health check timeout (default: 30)
    RETRY_INTERVAL              Retry interval (default: 5)
    VERBOSE                     Enable verbose logging (default: false)
EOF
}

# Parse command line arguments
parse_args() {
    local compose_file=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--compose-file)
                compose_file="$2"
                shift 2
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            -i|--interval)
                RETRY_INTERVAL="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE="true"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done

    # Set compose file based on argument or detect environment
    if [[ -n "$compose_file" ]]; then
        COMPOSE_FILE="$compose_file"
    elif [[ -f "$COMPOSE_FILE_PROD" ]]; then
        COMPOSE_FILE="$COMPOSE_FILE_PROD"
        log_info "Using production compose file: $COMPOSE_FILE"
    else
        COMPOSE_FILE="$COMPOSE_FILE_DEV"
        log_info "Using development compose file: $COMPOSE_FILE"
    fi
}

# Check if Docker and Docker Compose are available
check_docker_requirements() {
    log_info "Checking Docker requirements..."

    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
        log_error "Docker Compose is not available"
        exit 1
    fi

    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    log_success "Docker requirements met"
}

# Get list of services from compose file
get_services() {
    log_verbose "Getting services from $COMPOSE_FILE"
    docker compose -f "$COMPOSE_FILE" config --services
}

# Check if a service is running
is_service_running() {
    local service="$1"
    local status
    status=$(docker compose -f "$COMPOSE_FILE" ps --format json "$service" 2>/dev/null | jq -r '.[0].State // "unknown"' 2>/dev/null || echo "unknown")
    [[ "$status" == "running" ]]
}

# Check service health status
get_service_health() {
    local service="$1"
    local health
    health=$(docker compose -f "$COMPOSE_FILE" ps --format json "$service" 2>/dev/null | jq -r '.[0].Health // "unknown"' 2>/dev/null || echo "unknown")
    echo "$health"
}

# Wait for service to be healthy
wait_for_service_health() {
    local service="$1"
    local max_attempts=$((TIMEOUT / RETRY_INTERVAL))
    local attempt=1

    log_info "Waiting for $service to be healthy (timeout: ${TIMEOUT}s)"

    while [[ $attempt -le $max_attempts ]]; do
        if is_service_running "$service"; then
            local health
            health=$(get_service_health "$service")

            case "$health" in
                "healthy")
                    log_success "$service is healthy"
                    return 0
                    ;;
                "unhealthy")
                    log_error "$service is unhealthy"
                    return 1
                    ;;
                "starting"|"unknown")
                    log_verbose "$service health status: $health (attempt $attempt/$max_attempts)"
                    ;;
                *)
                    log_warning "$service health status unknown: $health"
                    ;;
            esac
        else
            log_verbose "$service is not running (attempt $attempt/$max_attempts)"
        fi

        if [[ $attempt -lt $max_attempts ]]; then
            sleep "$RETRY_INTERVAL"
        fi
        ((attempt++))
    done

    log_error "$service failed to become healthy within ${TIMEOUT}s"
    return 1
}

# Test HTTP endpoint
test_http_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    local service_name="${3:-service}"

    log_verbose "Testing HTTP endpoint: $url (expecting $expected_status)"

    local status_code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")

    if [[ "$status_code" == "$expected_status" ]]; then
        log_success "$service_name HTTP endpoint responded with $status_code"
        return 0
    else
        log_error "$service_name HTTP endpoint responded with $status_code (expected $expected_status)"
        return 1
    fi
}

# Validate service-specific endpoints
validate_service_endpoints() {
    local failed=0

    log_info "Validating service endpoints..."

    # Frontend health check (development only)
    if is_service_running "frontend"; then
        if ! test_http_endpoint "http://localhost:3002/health" "200" "Frontend"; then
            ((failed++))
        fi
    fi

    # API health check
    if is_service_running "api"; then
        if ! test_http_endpoint "http://localhost:3001/api/health" "200" "API"; then
            ((failed++))
        fi
    fi

    # WordPress health check (via proxy or direct)
    if is_service_running "wordpress"; then
        # Try via nginx proxy first, then direct
        if is_service_running "nginx"; then
            if ! test_http_endpoint "http://localhost/wp-json/wp/v2" "200" "WordPress (via Nginx)"; then
                if ! test_http_endpoint "http://localhost:8083/wp-json/wp/v2" "200" "WordPress (direct)"; then
                    ((failed++))
                fi
            fi
        else
            if ! test_http_endpoint "http://localhost:8083/wp-json/wp/v2" "200" "WordPress"; then
                ((failed++))
            fi
        fi
    fi

    # Nginx health check
    if is_service_running "nginx"; then
        if ! test_http_endpoint "http://localhost/health" "200" "Nginx"; then
            ((failed++))
        fi
    fi

    return $failed
}

# Get container logs for debugging
show_service_logs() {
    local service="$1"
    local lines="${2:-50}"

    log_info "Last $lines lines of logs for $service:"
    docker compose -f "$COMPOSE_FILE" logs --tail="$lines" "$service" 2>/dev/null || {
        log_warning "Could not retrieve logs for $service"
    }
}

# Main health check function
perform_health_check() {
    local services
    local failed_services=()
    local failed_endpoints=0

    log_info "Starting Docker health check validation"
    log_info "Compose file: $COMPOSE_FILE"
    log_info "Timeout: ${TIMEOUT}s, Retry interval: ${RETRY_INTERVAL}s"

    # Get services from compose file
    services=$(get_services)
    log_info "Services to check: $(echo "$services" | tr '\n' ' ')"

    # Check each service health
    log_info "Checking service health status..."
    for service in $services; do
        if ! wait_for_service_health "$service"; then
            failed_services+=("$service")
            if [[ "$VERBOSE" == "true" ]]; then
                show_service_logs "$service"
            fi
        fi
    done

    # Validate service endpoints
    validate_service_endpoints
    failed_endpoints=$?

    # Summary
    echo
    log_info "Health check summary:"

    if [[ ${#failed_services[@]} -eq 0 ]]; then
        log_success "All services are healthy"
    else
        log_error "Failed services: ${failed_services[*]}"
    fi

    if [[ $failed_endpoints -eq 0 ]]; then
        log_success "All endpoints are responding correctly"
    else
        log_error "$failed_endpoints endpoint(s) failed validation"
    fi

    # Return exit code
    local total_failures=$((${#failed_services[@]} + failed_endpoints))
    if [[ $total_failures -eq 0 ]]; then
        log_success "All health checks passed ✅"
        return 0
    else
        log_error "$total_failures health check(s) failed ❌"
        return 1
    fi
}

# Cleanup function
cleanup() {
    log_verbose "Cleaning up..."
}

# Signal handlers
trap cleanup EXIT INT TERM

# Main execution
main() {
    parse_args "$@"
    check_docker_requirements
    perform_health_check
}

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi