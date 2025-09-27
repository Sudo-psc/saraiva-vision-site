#!/bin/bash

# Production Setup Validation Script for Saraiva Vision
# Validates environment configuration, SSL certificates, and service health

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Domain configurations
DOMAINS=(
    "saraivavision.com.br:31.97.129.78"
    "www.saraivavision.com.br:31.97.129.78"
    "blog.saraivavision.com.br:31.97.129.78"
    "cms.saraivavision.com.br:31.97.129.78"
)

# Services to check
SERVICES=("nginx" "php8.1-fpm" "mysql" "redis-server")

# URLs to test
URLS=(
    "https://saraivavision.com.br"
    "https://blog.saraivavision.com.br"
    "https://saraivavision.com.br/api/health"
)

# Environment files to check
ENV_FILES=(
    "/home/saraiva-vision-site/.env.production"
    "/home/saraiva-vision-site/.env.production.template"
)

print_status "🔍 Starting production setup validation for Saraiva Vision..."

# =============================================================================
# DNS AND DOMAIN VALIDATION
# =============================================================================
print_status "🌐 Validating DNS configuration..."

for domain_config in "${DOMAINS[@]}"; do
    domain=$(echo "$domain_config" | cut -d':' -f1)
    expected_ip=$(echo "$domain_config" | cut -d':' -f2)

    print_status "Checking DNS for $domain..."

    # Get current IP
    current_ip=$(nslookup "$domain" | grep -A 1 "Non-authoritative answer:" | grep "Address:" | tail -1 | awk '{print $2}' || echo "FAILED")

    if [[ "$current_ip" == "$expected_ip" ]]; then
        print_success "✅ $domain → $current_ip (correct)"
    elif [[ "$current_ip" == "FAILED" ]]; then
        print_error "❌ $domain → DNS resolution failed"
    else
        print_warning "⚠️ $domain → $current_ip (expected: $expected_ip)"
    fi
done

# =============================================================================
# SSL CERTIFICATE VALIDATION
# =============================================================================
print_status "🔐 Validating SSL certificates..."

# Check certificate status
if command_exists certbot; then
    print_status "Listing installed certificates..."
    certbot certificates --quiet || true

    # Test SSL connectivity
    for domain_config in "${DOMAINS[@]}"; do
        domain=$(echo "$domain_config" | cut -d':' -f1)

        # Skip www subdomain for individual testing
        if [[ "$domain" == "www.saraivavision.com.br" ]]; then
            continue
        fi

        print_status "Testing SSL connectivity for $domain..."

        if timeout 10 openssl s_client -servername "$domain" -connect "${domain}:443" -verify_return_error < /dev/null > /dev/null 2>&1; then
            print_success "✅ SSL certificate valid for $domain"

            # Check expiration
            expiry_date=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
            print_status "   Expires: $expiry_date"
        else
            print_error "❌ SSL certificate issue for $domain"
        fi
    done
else
    print_warning "⚠️ Certbot not installed, skipping SSL validation"
fi

# =============================================================================
# SERVICE HEALTH VALIDATION
# =============================================================================
print_status "🔧 Validating system services..."

for service in "${SERVICES[@]}"; do
    print_status "Checking service: $service"

    if systemctl is-active "$service" >/dev/null 2>&1; then
        print_success "✅ $service is running"
    else
        print_error "❌ $service is not running"

        # Try to get service status
        echo "Service status:"
        systemctl status "$service" --no-pager -l || true
    fi
done

# =============================================================================
# NGINX CONFIGURATION VALIDATION
# =============================================================================
print_status "🌍 Validating Nginx configuration..."

if command_exists nginx; then
    print_status "Testing Nginx configuration..."

    if nginx -t 2>/dev/null; then
        print_success "✅ Nginx configuration is valid"

        # Check enabled sites
        print_status "Enabled sites:"
        ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^total" | awk '{print "  " $9}' || print_warning "No sites enabled"

    else
        print_error "❌ Nginx configuration has errors"
        nginx -t || true
    fi
else
    print_warning "⚠️ Nginx not installed"
fi

# =============================================================================
# URL CONNECTIVITY TESTING
# =============================================================================
print_status "📡 Testing URL connectivity..."

for url in "${URLS[@]}"; do
    print_status "Testing: $url"

    # Get HTTP status code
    status_code=$(curl -o /dev/null -s -w "%{http_code}" "$url" --max-time 10 --connect-timeout 5 || echo "000")
    response_time=$(curl -o /dev/null -s -w "%{time_total}" "$url" --max-time 10 --connect-timeout 5 || echo "timeout")

    if [[ "$status_code" == "200" ]]; then
        print_success "✅ $url → HTTP $status_code (${response_time}s)"
    elif [[ "$status_code" == "000" ]]; then
        print_error "❌ $url → Connection failed"
    else
        print_warning "⚠️ $url → HTTP $status_code (${response_time}s)"
    fi
done

# =============================================================================
# ENVIRONMENT CONFIGURATION VALIDATION
# =============================================================================
print_status "⚙️ Validating environment configuration..."

for env_file in "${ENV_FILES[@]}"; do
    if [[ -f "$env_file" ]]; then
        print_success "✅ Found: $env_file"

        # Check for placeholder values that need to be replaced
        placeholders_found=$(grep -c "REPLACE_WITH_\|your_.*_here\|GENERATE_RANDOM" "$env_file" 2>/dev/null || echo "0")

        if [[ "$placeholders_found" -gt 0 ]]; then
            print_warning "⚠️ $placeholders_found placeholder values found in $env_file"
            print_warning "   Replace these with actual production values:"
            grep "REPLACE_WITH_\|your_.*_here\|GENERATE_RANDOM" "$env_file" | head -5 | sed 's/^/   /'
            [[ "$placeholders_found" -gt 5 ]] && echo "   ... and $((placeholders_found - 5)) more"
        else
            print_success "✅ No placeholder values found in $env_file"
        fi
    else
        print_error "❌ Missing: $env_file"
    fi
done

# =============================================================================
# SYSTEM RESOURCES VALIDATION
# =============================================================================
print_status "💾 Checking system resources..."

# CPU usage
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}' 2>/dev/null || echo "unknown")
print_status "CPU usage: ${cpu_usage}%"

# Memory usage
memory_info=$(free -m | awk 'NR==2{printf "%.0f/%.0fMB (%.0f%%)", $3,$2,$3*100/$2}' 2>/dev/null || echo "unknown")
print_status "Memory usage: $memory_info"

# Disk usage
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//' 2>/dev/null || echo "unknown")
print_status "Disk usage: ${disk_usage}%"

# =============================================================================
# SECURITY HEADERS VALIDATION
# =============================================================================
print_status "🛡️ Checking security headers..."

test_url="https://saraivavision.com.br"
print_status "Testing security headers for: $test_url"

headers_response=$(curl -I "$test_url" --max-time 10 --connect-timeout 5 2>/dev/null || echo "FAILED")

if [[ "$headers_response" != "FAILED" ]]; then
    security_headers=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Strict-Transport-Security"
        "Content-Security-Policy"
    )

    for header in "${security_headers[@]}"; do
        if echo "$headers_response" | grep -i "$header" >/dev/null; then
            print_success "✅ $header header present"
        else
            print_warning "⚠️ $header header missing"
        fi
    done
else
    print_error "❌ Could not fetch headers from $test_url"
fi

# =============================================================================
# SUMMARY AND RECOMMENDATIONS
# =============================================================================
echo ""
echo "================================================"
echo "📋 PRODUCTION SETUP VALIDATION SUMMARY"
echo "================================================"

print_status "🎯 Key Issues to Address:"
echo ""

# DNS Issues
if nslookup cms.saraivavision.com.br | grep "82.25.73.118" >/dev/null; then
    print_warning "1. DNS: cms.saraivavision.com.br points to wrong IP (82.25.73.118 instead of 31.97.129.78)"
fi

# SSL Issues
if ! timeout 5 openssl s_client -servername cms.saraivavision.com.br -connect cms.saraivavision.com.br:443 -verify_return_error < /dev/null > /dev/null 2>&1; then
    print_warning "2. SSL: cms.saraivavision.com.br SSL certificate missing or invalid"
fi

# Environment Issues
env_placeholders=$(grep -c "REPLACE_WITH_\|your_.*_here\|GENERATE_RANDOM" /home/saraiva-vision-site/.env.production 2>/dev/null || echo "0")
if [[ "$env_placeholders" -gt 0 ]]; then
    print_warning "3. Environment: $env_placeholders placeholder values need to be replaced"
fi

echo ""
print_status "🔧 Recommended Actions:"
echo "1. Fix DNS for cms.saraivavision.com.br to point to 31.97.129.78"
echo "2. Generate SSL certificate for cms.saraivavision.com.br after DNS fix"
echo "3. Run secrets generation script: ./scripts/generate-production-secrets.sh"
echo "4. Configure external service API keys (Supabase, Google, Resend, etc.)"
echo "5. Test all endpoints and integrations"
echo ""

print_status "📊 For detailed monitoring, check:"
echo "- Nginx logs: /var/log/nginx/"
echo "- System logs: journalctl -u nginx -u php8.1-fpm"
echo "- SSL certificates: certbot certificates"
echo "- Service status: systemctl status <service-name>"
echo ""

print_success "🔍 Production validation completed!"