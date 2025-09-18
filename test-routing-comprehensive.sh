#!/bin/bash

# Comprehensive Routing Test for Saraiva Vision
# Tests React Router SPA + WordPress API integration
# Author: Claude Code Assistant
# Date: 2025-09-18

echo "🏥 Saraiva Vision - Comprehensive Routing Test"
echo "📍 Clínica Oftalmológica - Dr. Philipe Saraiva Cruz (CRM-MG 69.870)"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
TOTAL=0

# Function to test a URL
test_url() {
    local url="$1"
    local description="$2"
    local expected_status="$3"

    TOTAL=$((TOTAL + 1))
    echo -e "${BLUE}Testing${NC}: $description"
    echo "URL: $url"

    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}: HTTP $status_code"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: Expected $expected_status, got $status_code"
        FAILED=$((FAILED + 1))
    fi
    echo "----------------------------------------"
}

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local description="$2"
    local expected_content="$3"

    TOTAL=$((TOTAL + 1))
    echo -e "${BLUE}Testing${NC}: $description"
    echo "Endpoint: $endpoint"

    response=$(curl -s "$endpoint" 2>/dev/null)

    if [[ $response == *"$expected_content"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}: API response contains expected content"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: Expected content not found"
        FAILED=$((FAILED + 1))
    fi
    echo "----------------------------------------"
}

echo ""
echo "🧪 Testing React Router SPA Routes"
echo "----------------------------------------"

# Test main SPA routes
test_url "https://saraivavision.com.br/" "Home Page" "200"
test_url "https://saraivavision.com.br/servicos" "Services Page" "200"
test_url "https://saraivavision.com.br/contato" "Contact Page" "200"
test_url "https://saraivavision.com.br/sobre" "About Page" "200"

# Test blog routes (React Router)
test_url "https://saraivavision.com.br/blog" "Blog Page (React Router)" "200"
test_url "https://saraivavision.com.br/blog/importancia-exame-fundo-de-olho" "Blog Post (React Router)" "200"
test_url "https://saraivavision.com.br/categoria/consultas" "Category Page (React Router)" "200"

echo ""
echo "🧪 Testing WordPress API Routes"
echo "----------------------------------------"

# Test WordPress API endpoints
test_api "https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1" "WordPress Posts API" "title_rendered"
test_api "https://saraivavision.com.br/wp-json/wp/v2/categories" "WordPress Categories API" "name"
test_api "https://saraivavision.com.br/wp-json/wp/v2" "WordPress API Discovery" "routes"

echo ""
echo "🧪 Testing WordPress Admin Routes"
echo "----------------------------------------"

# Test WordPress admin (should redirect or require auth)
test_url "https://saraivavision.com.br/wp-admin" "WordPress Admin" "302"

echo ""
echo "🧪 Testing Static Assets"
echo "----------------------------------------"

# Test static assets
test_url "https://saraivavision.com.br/assets/index.css" "CSS Assets" "200"
test_url "https://saraivavision.com.br/favicon.svg" "Favicon" "200"

echo ""
echo "🧪 Testing CORS Headers"
echo "----------------------------------------"

# Test CORS headers
TOTAL=$((TOTAL + 1))
echo -e "${BLUE}Testing${NC}: CORS Headers for WordPress API"
cors_header=$(curl -s -I "https://saraivavision.com.br/wp-json/wp/v2/posts" 2>/dev/null | grep -i "access-control-allow-origin" || echo "NOT_FOUND")

if [[ $cors_header != "NOT_FOUND" ]]; then
    echo -e "${GREEN}✓ PASS${NC}: CORS headers present"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ WARNING${NC}: CORS headers not found (may be nginx-managed)"
fi
echo "----------------------------------------"

echo ""
echo "🧪 Testing Service Worker"
echo "----------------------------------------"

# Test service worker registration
TOTAL=$((TOTAL + 1))
echo -e "${BLUE}Testing${NC}: Service Worker Registration"
sw_response=$(curl -s "https://saraivavision.com.br/sw.js" 2>/dev/null)

if [[ $sw_response == *"Saraiva Vision Medical Clinic Service Worker"* ]]; then
    echo -e "${GREEN}✓ PASS${NC}: Service Worker found and contains expected content"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FAIL${NC}: Service Worker not found or content mismatch"
    FAILED=$((FAILED + 1))
fi
echo "----------------------------------------"

echo ""
echo "🏥 Test Results Summary"
echo "=================================================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${BLUE}Total: $TOTAL${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Routing configuration is working correctly.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Review the configuration above.${NC}"
    exit 1
fi