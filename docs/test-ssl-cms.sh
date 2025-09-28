#!/bin/bash
# Saraiva Vision CMS SSL Testing Script
# Comprehensive testing of SSL configuration and GraphQL endpoint

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="cms.saraivavision.com.br"
FRONTEND_DOMAIN="saraivavision.com.br"
EMAIL="admin@saraivavision.com.br"
LOG_FILE="/tmp/ssl-test-$(date +%Y%m%d_%H%M%S).log"

echo -e "${BLUE}=== Saraiva Vision CMS SSL Testing ===${NC}"
echo "Domain: $DOMAIN"
echo "Frontend: $FRONTEND_DOMAIN"
echo "Log File: $LOG_FILE"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root${NC}"
   exit 1
fi

# Function to log messages
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test connectivity
test_connectivity() {
    local url="$1"
    local description="$2"

    log "Testing $description..."

    if command_exists curl; then
        local http_code
        local response_time

        http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "0.000")

        if [[ "$http_code" == "200" ]]; then
            log "✅ $description - HTTP $http_code (${response_time}s)"
            return 0
        else
            error "❌ $description - HTTP $http_code (${response_time}s)"
            return 1
        fi
    else
        error "curl command not available"
        return 1
    fi
}

# Function to test SSL certificate
test_ssl_certificate() {
    local domain="$1"

    log "Testing SSL certificate for $domain..."

    if command_exists openssl; then
        local result
        result=$(openssl s_client -connect "$domain:443" -showcerts </dev/null 2>/dev/null)

        if [[ $? -eq 0 ]]; then
            local issuer
            local expiry_date
            local days_left

            issuer=$(echo "$result" | openssl x509 -issuer -noout 2>/dev/null | cut -d= -f2-)
            expiry_date=$(echo "$result" | openssl x509 -enddate -noout 2>/dev/null | cut -d= -f2)
            days_left=$(( ( $(date -d "$expiry_date" +%s) - $(date +%s) ) / 86400 ))

            log "✅ SSL Certificate Valid"
            log "   Issuer: $issuer"
            log "   Expires: $expiry_date ($days_left days)"

            if [[ "$days_left" -lt 30 ]]; then
                warn "⚠️ Certificate expires in $days_left days"
            fi

            return 0
        else
            error "❌ SSL certificate validation failed"
            return 1
        fi
    else
        error "openssl command not available"
        return 1
    fi
}

# Function to test CORS headers
test_cors_headers() {
    local url="$1"
    local expected_origin="$2"

    log "Testing CORS headers for $url..."

    if command_exists curl; then
        local headers
        headers=$(curl -s -I -H "Origin: $expected_origin" "$url" 2>/dev/null || echo "")

        local cors_origin
        local cors_methods
        local cors_headers

        cors_origin=$(echo "$headers" | grep -i "access-control-allow-origin:" | cut -d' ' -f2 | tr -d '\r\n')
        cors_methods=$(echo "$headers" | grep -i "access-control-allow-methods:" | cut -d' ' -f2- | tr -d '\r\n')
        cors_headers=$(echo "$headers" | grep -i "access-control-allow-headers:" | cut -d' ' -f2- | tr -d '\r\n')

        if [[ "$cors_origin" == "$expected_origin" ]]; then
            log "✅ CORS Origin: $cors_origin"
        else
            error "❌ CORS Origin: $cors_origin (expected: $expected_origin)"
        fi

        if [[ -n "$cors_methods" ]]; then
            log "✅ CORS Methods: $cors_methods"
        else
            error "❌ CORS Methods not found"
        fi

        if [[ -n "$cors_headers" ]]; then
            log "✅ CORS Headers: $cors_headers"
        else
            error "❌ CORS Headers not found"
        fi
    else
        error "curl command not available"
        return 1
    fi
}

# Function to test GraphQL endpoint
test_graphql_endpoint() {
    local url="$1"

    log "Testing GraphQL endpoint..."

    if command_exists curl; then
        local response
        local http_code

        response=$(curl -s -H "Content-Type: application/json" -d '{"query":"{__typename}"}' "$url" 2>/dev/null)
        http_code=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json" -d '{"query":"{__typename}"}' "$url" 2>/dev/null)

        if [[ "$http_code" == "200" ]]; then
            if echo "$response" | grep -q "__typename"; then
                log "✅ GraphQL endpoint working correctly"
                return 0
            else
                error "❌ GraphQL endpoint returned unexpected response: $response"
                return 1
            fi
        else
            error "❌ GraphQL endpoint returned HTTP $http_code"
            return 1
        fi
    else
        error "curl command not available"
        return 1
    fi
}

# Function to test DNS resolution
test_dns_resolution() {
    local domain="$1"

    log "Testing DNS resolution for $domain..."

    if command_exists nslookup; then
        local result
        result=$(nslookup "$domain" 2>/dev/null)

        if [[ $? -eq 0 ]]; then
            local ip_address
            ip_address=$(echo "$result" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
            log "✅ DNS Resolution: $domain -> $ip_address"
            return 0
        else
            error "❌ DNS resolution failed for $domain"
            return 1
        fi
    else
        error "nslookup command not available"
        return 1
    fi
}

# Function to test Nginx configuration
test_nginx_config() {
    log "Testing Nginx configuration..."

    if nginx -t 2>/dev/null; then
        log "✅ Nginx configuration is valid"
        return 0
    else
        error "❌ Nginx configuration test failed"
        return 1
    fi
}

# Function to test systemd services
test_systemd_services() {
    local services=("nginx" "php8.1-fpm")

    for service in "${services[@]}"; do
        log "Testing $service service..."

        if systemctl is-active --quiet "$service"; then
            log "✅ $service is running"
        else
            error "❌ $service is not running"
        fi
    done

    # Test certbot timer
    log "Testing certbot-renewal timer..."
    if systemctl is-enabled --quiet certbot-renewal.timer; then
        log "✅ certbot-renewal timer is enabled"
    else
        warn "⚠️ certbot-renewal timer is not enabled"
    fi

    if systemctl is-active --quiet certbot-renewal.timer; then
        log "✅ certbot-renewal timer is running"
    else
        warn "⚠️ certbot-renewal timer is not running"
    fi
}

# Function to test file permissions
test_file_permissions() {
    local files=(
        "/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
        "/etc/letsencrypt/live/$DOMAIN/privkey.pem"
        "/etc/nginx/sites-available/$DOMAIN"
        "/etc/nginx/sites-enabled/$DOMAIN"
    )

    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            local perms
            perms=$(stat -c "%a" "$file")
            log "✅ $file exists (permissions: $perms)"
        else
            error "❌ $file not found"
        fi
    done
}

# Function to generate test report
generate_test_report() {
    local report_file="/tmp/ssl-test-report-$(date +%Y%m%d_%H%M%S).html"

    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Saraiva Vision CMS SSL Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; }
        .warning { background: #fff3cd; border-color: #ffeaa7; }
        .error { background: #f8d7da; border-color: #f5c6cb; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Saraiva Vision CMS SSL Test Report</h1>
        <p>Domain: $DOMAIN</p>
        <p>Generated: $(date)</p>
    </div>

    <div class="section">
        <h2>Test Summary</h2>
        <pre>$(cat "$LOG_FILE" | grep -E "(✅|❌|⚠️)" || echo "No test results found")</pre>
    </div>

    <div class="section">
        <h2>System Information</h2>
        <pre>$(uname -a)</pre>
        <pre>$(nginx -v 2>&1)</pre>
        <pre>$(php -v | head -1)</pre>
    </div>

    <div class="section">
        <h2>SSL Certificate Details</h2>
        <pre>$(openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout 2>/dev/null || echo "Certificate not found")</pre>
    </div>
</body>
</html>
EOF

    log "Test report generated: $report_file"
}

# Main test execution
log "=== Starting SSL Tests ==="

# Initialize test counters
total_tests=0
passed_tests=0
failed_tests=0

# Run tests
{
    test_dns_resolution "$DOMAIN"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_ssl_certificate "$DOMAIN"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_connectivity "https://$DOMAIN/health" "Health Endpoint"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_connectivity "https://$DOMAIN/ssl-health" "SSL Health Endpoint"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_graphql_endpoint "https://$DOMAIN/graphql"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_cors_headers "https://$DOMAIN/graphql" "https://$FRONTEND_DOMAIN"
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

{
    test_nginx_config
    ((total_tests++)) && ((passed_tests++))
} || {
    ((total_tests++)) && ((failed_tests++))
}

test_systemd_services
test_file_permissions

# Generate report
generate_test_report

# Display summary
log "=== Test Summary ==="
echo "Total Tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $failed_tests"
echo "Success Rate: $(( passed_tests * 100 / total_tests ))%"

if [[ $failed_tests -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! SSL configuration is working correctly.${NC}"
else
    echo -e "${RED}⚠️ Some tests failed. Please check the log file: $LOG_FILE${NC}"
    exit 1
fi