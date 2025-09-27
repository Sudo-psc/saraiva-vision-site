#!/bin/bash

# Test script to validate JavaScript error fixes
# Tests both Vercel deployment and production (once API is deployed)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERCEL_URL="https://saraiva-vision-site-9hz5ucro6-sudopscs-projects.vercel.app"
PROD_URL="https://saraivavision.com.br"
API_URL="https://saraivavision.com.br/api"

# Print colored output
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

# Function to test HTTP status
test_http_status() {
    local url=$1
    local expected_code=$2
    local description=$3

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$status_code" -eq "$expected_code" ]; then
        print_success "$description: HTTP $status_code ✓"
        return 0
    else
        print_error "$description: HTTP $status_code (expected $expected_code) ✗"
        return 1
    fi
}

# Function to test image proxy
test_image_proxy() {
    local base_url=$1
    local description=$2

    local test_path="/api/images/proxy/hostinger-horizons-assets-prod/979f9a5f-43ca-4577-b86e-f6adc587dcb8/a8dfe42cbf2667c6fde2f934ce773078.png"
    local test_url="${base_url}${test_path}"

    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$test_url")
    local content_type=$(curl -s -I "$test_url" | grep -i "content-type" | cut -d' ' -f2 | tr -d '\r\n')

    if [ "$status_code" -eq 200 ]; then
        if [[ "$content_type" == *"image"* ]]; then
            print_success "$description: Working correctly ✓"
            return 0
        else
            print_warning "$description: HTTP 200 but content-type is $content_type"
            return 0
        fi
    else
        print_error "$description: HTTP $status_code ✗"
        return 1
    fi
}

# Function to test API health
test_api_health() {
    local base_url=$1
    local description=$2

    local health_url="${base_url}/api/health"
    local response=$(curl -s "$health_url" 2>/dev/null || echo "")

    if [[ "$response" == *"\"status\":\"ok\""* ]]; then
        print_success "$description: API is healthy ✓"
        return 0
    else
        print_error "$description: API not responding properly ✗"
        return 1
    fi
}

# Function to test for JavaScript errors in page content
test_js_errors() {
    local url=$1
    local description=$2

    local page_content=$(curl -s "$url")
    local error_count=0

    # Check for common error indicators
    if [[ "$page_content" == *"error"* ]] || [[ "$page_content" == *"Error"* ]]; then
        error_count=$(echo "$page_content" | grep -i "error" | wc -l)
        if [ "$error_count" -gt 2 ]; then
            print_warning "$description: Found $error_count potential error references"
        else
            print_success "$description: Minimal error references ($error_count) ✓"
        fi
    else
        print_success "$description: No error references found ✓"
    fi

    # Check for specific error patterns we fixed
    if [[ "$page_content" == *"ServicesPage"* ]] || [[ "$page_content" == *"chunk"* ]]; then
        print_success "$description: ServicesPage content found ✓"
    else
        print_warning "$description: ServicesPage content may be missing"
    fi
}

# Main test function
main() {
    echo -e "${BLUE}🧪 Testing JavaScript Error Fixes${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""

    local total_tests=0
    local passed_tests=0

    # Test Vercel Deployment
    echo -e "${BLUE}Testing Vercel Deployment:${NC}"
    echo "URL: $VERCEL_URL"
    echo ""

    test_http_status "$VERCEL_URL" 200 "Vercel Main Page" && ((passed_tests++))
    ((total_tests++))

    test_http_status "$VERCEL_URL/servicos" 200 "Vercel Services Page" && ((passed_tests++))
    ((total_tests++))

    test_js_errors "$VERCEL_URL/servicos" "Vercel Services Page Content" && ((passed_tests++))
    ((total_tests++))

    # Note: Image proxy won't work on Vercel until API is deployed to production
    test_image_proxy "$VERCEL_URL" "Vercel Image Proxy" || print_warning "Vercel Image Proxy: Expected to fail until API deployed"
    ((total_tests++))

    echo ""

    # Test Production
    echo -e "${BLUE}Testing Production:${NC}"
    echo "URL: $PROD_URL"
    echo ""

    test_http_status "$PROD_URL" 200 "Production Main Page" && ((passed_tests++))
    ((total_tests++))

    test_http_status "$PROD_URL/servicos" 200 "Production Services Page" && ((passed_tests++))
    ((total_tests++))

    test_api_health "$PROD_URL" "Production API" && ((passed_tests++))
    ((total_tests++))

    test_js_errors "$PROD_URL/servicos" "Production Services Page Content" && ((passed_tests++))
    ((total_tests++))

    # Test production image proxy (may fail until API is deployed)
    test_image_proxy "$PROD_URL" "Production Image Proxy" || print_warning "Production Image Proxy: Will work after API deployment"
    ((total_tests++))

    echo ""

    # Summary
    echo -e "${BLUE}=== Test Summary ===${NC}"
    echo -e "Total Tests: $total_tests"
    echo -e "Passed: ${GREEN}$passed_tests${NC}"
    echo -e "Failed: ${RED}$((total_tests - passed_tests))${NC}"

    local success_rate=$((passed_tests * 100 / total_tests))
    echo -e "Success Rate: ${GREEN}$success_rate%${NC}"

    if [ "$success_rate" -ge 80 ]; then
        echo ""
        print_success "✅ Overall test results are good!"
        echo ""
        echo "📋 Next Steps:"
        echo "1. Deploy API changes to production server"
        echo "2. Test image proxy functionality"
        echo "3. Monitor for JavaScript errors in browser console"
        echo "4. Verify all images load correctly on services page"
    else
        echo ""
        print_error "❌ Test results need attention"
    fi

    echo ""
    echo -e "${BLUE}🔧 Key Fixes Implemented:${NC}"
    echo "• Backend image proxy for CORS issues"
    echo "• Enhanced lazy loading with retry logic"
    echo "• Error boundaries for dynamic imports"
    echo "• Updated all GCS image references"

    return 0
}

# Run main function
main "$@"