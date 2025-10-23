#!/bin/bash

# Comprehensive Production Testing Script for Planos Flex Feature
# Tests HTTP status, content validation, and SEO meta tags

echo "========================================"
echo "Planos Flex Production Validation Tests"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROD_URL="https://saraivavision.com.br"
ERRORS=0
WARNINGS=0
PASSED=0

# Function to test HTTP status
test_http_status() {
    local url=$1
    local expected=$2
    local description=$3

    echo -n "Testing: $description... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$status" -eq "$expected" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $status)"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected, Got: $status)"
        ((ERRORS++))
    fi
}

# Function to test content presence
test_content() {
    local url=$1
    local pattern=$2
    local description=$3

    echo -n "Testing: $description... "
    content=$(curl -s "$url")

    if echo "$content" | grep -qi "$pattern"; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC} (Pattern not found: $pattern)"
        ((ERRORS++))
    fi
}

# Function to test content absence
test_content_absent() {
    local url=$1
    local pattern=$2
    local description=$3

    echo -n "Testing: $description... "
    content=$(curl -s "$url")

    if ! echo "$content" | grep -qi "$pattern"; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}WARNING${NC} (Pattern should NOT be present: $pattern)"
        ((WARNINGS++))
    fi
}

# Function to test SEO meta tag
test_seo_meta() {
    local url=$1
    local tag=$2
    local description=$3

    echo -n "Testing: $description... "
    content=$(curl -s "$url")

    if echo "$content" | grep -qi "$tag"; then
        echo -e "${GREEN}PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC} (Meta tag not found)"
        ((ERRORS++))
    fi
}

echo "1. HTTP Status Tests"
echo "--------------------"
test_http_status "$PROD_URL/planosflex" 200 "/planosflex returns HTTP 200"
test_http_status "$PROD_URL/planos" 200 "/planos returns HTTP 200"
test_http_status "$PROD_URL/planosonline" 200 "/planosonline returns HTTP 200"
echo ""

echo "2. PlanosFlexPage Content Tests"
echo "--------------------------------"
test_content "$PROD_URL/planosflex" "Planos Presenciais Flex - Sem Fidelidade" "Page title present"
test_content "$PROD_URL/planosflex" "Sem Fidelidade" "Sem Fidelidade badge present"
test_content "$PROD_URL/planosflex" "Cancele quando quiser" "Cancellation message present"
test_content "$PROD_URL/planosflex" "stripe-pricing-table" "Stripe pricing table element present"
test_content "$PROD_URL/planosflex" "prctbl_1SLTeeLs8MC0aCdjujaEGM3N" "Stripe pricing table ID present"
test_content "$PROD_URL/planosflex" "Voltar para Planos Presenciais" "Back navigation link present"
test_content "$PROD_URL/planosflex" "Perguntas Frequentes" "FAQ section present"
echo ""

echo "3. PlanosFlexPage Navigation Tests"
echo "-----------------------------------"
test_content "$PROD_URL/planosflex" 'href="/planos"' "Link to /planos exists"
test_content "$PROD_URL/planosflex" 'href="/planosonline"' "Link to /planosonline exists"
echo ""

echo "4. PlansPage Integration Tests"
echo "-------------------------------"
test_content "$PROD_URL/planos" 'href="/planosflex"' "PlansPage has link to /planosflex"
test_content "$PROD_URL/planos" "prefere planos sem fidelidade" "PlansPage mentions flex plans"
echo ""

echo "5. PlanosOnlinePage Modification Tests"
echo "---------------------------------------"
test_content_absent "$PROD_URL/planosonline" 'href="/planosflex"' "PlanosOnlinePage does NOT link to /planosflex"
test_content "$PROD_URL/planosonline" "100% Online" "PlanosOnlinePage mentions online nature"
echo ""

echo "6. SEO Meta Tags Tests"
echo "----------------------"
test_seo_meta "$PROD_URL/planosflex" '<title>.*Planos Flex.*Saraiva Vision</title>' "PlanosFlexPage has correct title tag"
test_seo_meta "$PROD_URL/planosflex" 'meta.*description.*planos flexíveis' "PlanosFlexPage has meta description"
test_seo_meta "$PROD_URL/planosflex" 'link.*canonical.*saraivavision.com.br/planosflex' "PlanosFlexPage has canonical URL"
echo ""

echo "7. Stripe Script Loading Tests"
echo "-------------------------------"
test_content "$PROD_URL/planosflex" 'https://js.stripe.com/v3/pricing-table.js' "Stripe script reference present"
echo ""

echo "8. Bundle and Performance Tests"
echo "--------------------------------"
echo -n "Testing: Page size is reasonable... "
size=$(curl -s "$PROD_URL/planosflex" | wc -c)
if [ "$size" -lt 500000 ]; then
    echo -e "${GREEN}PASS${NC} (Size: $size bytes)"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC} (Size: $size bytes - larger than expected)"
    ((WARNINGS++))
fi

echo -n "Testing: Page loads without console errors... "
# This is a placeholder - real test would require browser automation
echo -e "${GREEN}MANUAL CHECK REQUIRED${NC}"
echo ""

echo "========================================"
echo "Test Results Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $ERRORS${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review.${NC}"
    exit 1
fi
