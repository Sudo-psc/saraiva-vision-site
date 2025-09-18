#!/bin/bash

# Saraiva Vision - Log Troubleshooting Script
# Dr. Philipe Saraiva Cruz (CRM-MG 69.870) - Clínica Saraiva Vision
# 
# This script provides comprehensive log analysis and troubleshooting tools
# for the Saraiva Vision medical clinic website

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Header
print_header() {
    echo "=================================================================="
    echo "🏥 Saraiva Vision - Log Troubleshooting Tool"
    echo "Dr. Philipe Saraiva Cruz (CRM-MG 69.870)"
    echo "Clínica Oftalmológica - Caratinga, MG"
    echo "=================================================================="
    echo
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    log_success "Docker is running"
}

# Check services status
check_services() {
    log_info "Checking service status..."
    
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "Docker Compose Services:"
        docker compose -f "$DOCKER_COMPOSE_FILE" ps --format "table"
        echo
    else
        log_warn "Docker compose file not found at $DOCKER_COMPOSE_FILE"
    fi
    
    # Check individual containers
    local containers=("saraiva-nginx" "saraiva-api")
    for container in "${containers[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
            log_success "Container $container is running"
        else
            log_warn "Container $container is not running"
        fi
    done
}

# Show recent logs
show_recent_logs() {
    local service="${1:-all}"
    local lines="${2:-50}"
    
    log_info "Showing last $lines lines for service: $service"
    
    case "$service" in
        "nginx")
            docker compose logs --tail="$lines" nginx
            ;;
        "api")
            docker compose logs --tail="$lines" api
            ;;
        "all")
            docker compose logs --tail="$lines"
            ;;
        *)
            log_error "Unknown service: $service. Use: nginx, api, or all"
            return 1
            ;;
    esac
}

# Analyze error patterns
analyze_errors() {
    log_info "Analyzing error patterns..."
    
    # Check for common nginx errors
    if docker exec saraiva-nginx test -f /var/log/nginx/error.log 2>/dev/null; then
        echo "🔍 Recent Nginx Errors:"
        docker exec saraiva-nginx tail -n 20 /var/log/nginx/error.log | grep -E "(error|crit|alert|emerg)" || echo "No recent errors found"
        echo
    fi
    
    # Check API errors from container logs
    echo "🔍 Recent API Errors:"
    docker compose logs api | grep -E "ERROR|error" | tail -n 10 || echo "No recent API errors found"
    echo
    
    # Check for rate limiting
    echo "🔍 Rate Limiting Events:"
    docker compose logs api | grep -E "Rate limit exceeded" | tail -n 5 || echo "No rate limiting events found"
    echo
}

# Show access patterns
show_access_patterns() {
    local lines="${1:-100}"
    
    log_info "Analyzing access patterns (last $lines requests)..."
    
    # Most frequent IPs
    echo "📊 Top 10 Client IPs:"
    if docker exec saraiva-nginx test -f /var/log/nginx/access.log 2>/dev/null; then
        docker exec saraiva-nginx tail -n "$lines" /var/log/nginx/access.log | \
            awk '{print $1}' | sort | uniq -c | sort -nr | head -10 | \
            while read count ip; do
                echo "  $ip: $count requests"
            done
    else
        log_warn "Nginx access log not found"
    fi
    echo
    
    # Most requested endpoints
    echo "📊 Top 10 Requested Endpoints:"
    if docker exec saraiva-nginx test -f /var/log/nginx/access.log 2>/dev/null; then
        docker exec saraiva-nginx tail -n "$lines" /var/log/nginx/access.log | \
            awk '{print $7}' | sort | uniq -c | sort -nr | head -10 | \
            while read count endpoint; do
                echo "  $endpoint: $count requests"
            done
    else
        log_warn "Nginx access log not found"
    fi
    echo
    
    # HTTP status codes
    echo "📊 HTTP Status Code Distribution:"
    if docker exec saraiva-nginx test -f /var/log/nginx/access.log 2>/dev/null; then
        docker exec saraiva-nginx tail -n "$lines" /var/log/nginx/access.log | \
            awk '{print $9}' | sort | uniq -c | sort -nr | \
            while read count status; do
                echo "  HTTP $status: $count responses"
            done
    else
        log_warn "Nginx access log not found"
    fi
    echo
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check nginx health
    if curl -sf http://localhost/health >/dev/null 2>&1; then
        log_success "Nginx health check passed"
    else
        log_error "Nginx health check failed"
    fi
    
    # Check API health
    if curl -sf http://localhost/api/health >/dev/null 2>&1; then
        log_success "API health check passed"
        
        # Show API health details
        echo "API Health Details:"
        curl -s http://localhost/api/health | jq '.' 2>/dev/null || curl -s http://localhost/api/health
    else
        log_error "API health check failed"
    fi
    echo
}

# Export logs
export_logs() {
    local output_dir="${1:-$LOGS_DIR/export}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local archive_name="saraiva_vision_logs_$timestamp.tar.gz"
    
    log_info "Exporting logs to $output_dir..."
    
    mkdir -p "$output_dir"
    
    # Export container logs
    docker compose logs nginx > "$output_dir/nginx_container.log" 2>&1
    docker compose logs api > "$output_dir/api_container.log" 2>&1
    
    # Export nginx logs from container
    if docker exec saraiva-nginx test -f /var/log/nginx/access.log 2>/dev/null; then
        docker cp saraiva-nginx:/var/log/nginx/access.log "$output_dir/nginx_access.log"
        docker cp saraiva-nginx:/var/log/nginx/error.log "$output_dir/nginx_error.log" 2>/dev/null || true
    fi
    
    # Export API logs from container
    if docker exec saraiva-api test -d /app/logs 2>/dev/null; then
        docker cp saraiva-api:/app/logs "$output_dir/api_logs" 2>/dev/null || true
    fi
    
    # Create archive
    cd "$(dirname "$output_dir")"
    tar -czf "$archive_name" "$(basename "$output_dir")"
    
    log_success "Logs exported to: $(dirname "$output_dir")/$archive_name"
}

# Monitor logs in real-time
monitor_logs() {
    log_info "Starting real-time log monitoring (Press Ctrl+C to stop)..."
    docker compose logs -f --tail=10
}

# Show disk usage
show_disk_usage() {
    log_info "Checking disk usage..."
    
    echo "📊 Container Disk Usage:"
    docker system df
    echo
    
    echo "📊 Log Files Disk Usage:"
    if [ -d "$LOGS_DIR" ]; then
        du -sh "$LOGS_DIR"/* 2>/dev/null || echo "No log files found in $LOGS_DIR"
    else
        log_warn "Logs directory not found: $LOGS_DIR"
    fi
    echo
}

# Main menu
show_menu() {
    echo "Available Commands:"
    echo "  status      - Show service status"
    echo "  logs        - Show recent logs [service] [lines]"
    echo "  errors      - Analyze error patterns"
    echo "  access      - Show access patterns [lines]"
    echo "  health      - Run health checks"
    echo "  monitor     - Monitor logs in real-time"
    echo "  export      - Export logs [output_dir]"
    echo "  disk        - Show disk usage"
    echo "  help        - Show this menu"
    echo
    echo "Examples:"
    echo "  $0 logs nginx 100"
    echo "  $0 access 500"
    echo "  $0 export /tmp/logs"
    echo
}

# Main function
main() {
    print_header
    
    local command="${1:-help}"
    
    case "$command" in
        "status")
            check_docker
            check_services
            ;;
        "logs")
            check_docker
            show_recent_logs "${2:-all}" "${3:-50}"
            ;;
        "errors")
            check_docker
            analyze_errors
            ;;
        "access")
            check_docker
            show_access_patterns "${2:-100}"
            ;;
        "health")
            health_check
            ;;
        "monitor")
            check_docker
            monitor_logs
            ;;
        "export")
            check_docker
            export_logs "${2:-}"
            ;;
        "disk")
            show_disk_usage
            ;;
        "help"|*)
            show_menu
            ;;
    esac
}

# Run main function with all arguments
main "$@"