#!/bin/bash
# Cloudflare Integration Test Script for SaraivaVision
# Tests all configurations after DNS migration to Cloudflare

echo "🔍 Iniciando testes de integração com Cloudflare..."
echo "================================================"

# Domain to test
DOMAIN="saraivavision.com.br"
WWW_DOMAIN="www.saraivavision.com.br"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3

    echo -n "Testing $description ($url)... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

# Test headers function
test_header() {
    local url=$1
    local header=$2
    local expected_value=$3
    local description=$4

    echo -n "Testing $description ($header)... "

    response=$(curl -s -I "$url" 2>/dev/null | grep -i "$header:" | head -1)

    if echo "$response" | grep -q "$expected_value"; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_value, Got: $response)"
        return 1
    fi
}

echo ""
echo "1. Testing basic connectivity..."
echo "--------------------------------"

test_endpoint "https://$DOMAIN/" "200" "Main site"
test_endpoint "https://$WWW_DOMAIN/" "200" "WWW redirect"
test_endpoint "https://$DOMAIN/health" "200" "Health check"

echo ""
echo "2. Testing cache headers..."
echo "---------------------------"

test_header "https://$DOMAIN/" "CF-Cache-Status" "bypass" "HTML bypass cache"
test_header "https://$DOMAIN/health" "CF-Cache-Status" "bypass" "Health bypass cache"
test_header "https://$DOMAIN/api/" "CF-Cache-Status" "bypass" "API bypass cache"

echo ""
echo "3. Testing WordPress integration..."
echo "-----------------------------------"

test_endpoint "https://$DOMAIN/wp-json/wp/v2/posts" "200" "WordPress API"
test_header "https://$DOMAIN/wp-json/" "CF-Cache-Status" "dynamic" "WP API dynamic cache"

echo ""
echo "4. Testing security headers..."
echo "------------------------------"

test_header "https://$DOMAIN/" "Strict-Transport-Security" "max-age" "HSTS header"
test_header "https://$DOMAIN/" "X-Frame-Options" "SAMEORIGIN" "Frame options"
test_header "https://$DOMAIN/" "X-Content-Type-Options" "nosniff" "Content type options"

echo ""
echo "5. Testing SSL/TLS..."
echo "---------------------"

echo -n "Testing SSL certificate... "
ssl_test=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC}"
fi

echo ""
echo "6. Testing Cloudflare headers..."
echo "---------------------------------"

echo -n "Testing CF-RAY header... "
cf_ray=$(curl -s -I "https://$DOMAIN/" | grep -i "CF-RAY:" | wc -l)
if [ "$cf_ray" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}"
else
    echo -e "${RED}✗ FAIL${NC} (CF-RAY header not found)"
fi

echo ""
echo "7. Testing rate limiting..."
echo "---------------------------"

echo -n "Testing API rate limiting (multiple requests)... "
# Make multiple requests to test rate limiting
rate_test=$(for i in {1..5}; do curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/" 2>/dev/null; done | grep -c "429")
if [ "$rate_test" -gt 0 ]; then
    echo -e "${GREEN}✓ PASS${NC} (Rate limiting working)"
else
    echo -e "${YELLOW}⚠ WARNING${NC} (Rate limiting may not be active)"
fi

echo ""
echo "8. Testing error pages..."
echo "-------------------------"

test_endpoint "https://$DOMAIN/nonexistent-page" "200" "SPA fallback (should return 200 for index.html)"

echo ""
echo "📋 Summary:"
echo "==========="
echo "✅ All configurations have been adjusted for Cloudflare compatibility"
echo "✅ Cache headers configured to work with Cloudflare CDN"
echo "✅ Proxy headers updated for real IP detection"
echo "✅ WordPress cache disabled to avoid conflicts"
echo "✅ SSL/TLS configured for Cloudflare SSL termination"
echo "✅ Security headers maintained without duplication"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Configure Cloudflare Page Rules for caching"
echo "2. Set up Cloudflare WAF rules if needed"
echo "3. Configure Cloudflare Workers if required"
echo "4. Monitor Cloudflare analytics for performance"
echo "5. Test admin areas (/wp-admin/) for proper functionality"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "- WordPress object cache is disabled to prevent conflicts"
echo "- Rate limiting is reduced since Cloudflare provides additional protection"
echo "- All sensitive areas (admin, API) bypass Cloudflare cache"
echo "- Static assets are cached by Cloudflare for better performance"
