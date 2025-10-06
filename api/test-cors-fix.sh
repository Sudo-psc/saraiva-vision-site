#!/bin/bash

# CORS Fix Test Script
# Tests the /api/google-reviews endpoint with CORS headers

echo "🧪 Testing CORS Configuration for /api/google-reviews"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3002"
BACKEND_URL="http://localhost:3001"
ENDPOINT="/api/google-reviews?placeId=test&limit=3&language=pt-BR"

echo "📍 Frontend: $FRONTEND_URL"
echo "🔧 Backend: $BACKEND_URL"
echo "🎯 Endpoint: $ENDPOINT"
echo ""

# Test 1: Preflight (OPTIONS) Request
echo "================================"
echo "TEST 1: Preflight (OPTIONS) Request"
echo "================================"
echo ""

PREFLIGHT_RESPONSE=$(curl -i -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -s "$BACKEND_URL$ENDPOINT")

echo "$PREFLIGHT_RESPONSE"
echo ""

# Check for required CORS headers in preflight
if echo "$PREFLIGHT_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ Access-Control-Allow-Origin header present${NC}"
else
    echo -e "${RED}❌ Access-Control-Allow-Origin header MISSING${NC}"
fi

if echo "$PREFLIGHT_RESPONSE" | grep -q "Access-Control-Allow-Methods"; then
    echo -e "${GREEN}✅ Access-Control-Allow-Methods header present${NC}"
else
    echo -e "${RED}❌ Access-Control-Allow-Methods header MISSING${NC}"
fi

if echo "$PREFLIGHT_RESPONSE" | grep -q "Access-Control-Allow-Headers"; then
    echo -e "${GREEN}✅ Access-Control-Allow-Headers header present${NC}"
else
    echo -e "${RED}❌ Access-Control-Allow-Headers header MISSING${NC}"
fi

# Check status code
if echo "$PREFLIGHT_RESPONSE" | grep -q "HTTP/1.1 204\|HTTP/1.1 200"; then
    echo -e "${GREEN}✅ Preflight returns 200/204 OK${NC}"
else
    echo -e "${RED}❌ Preflight returns wrong status code${NC}"
fi

echo ""

# Test 2: Actual GET Request
echo "================================"
echo "TEST 2: Actual GET Request"
echo "================================"
echo ""

GET_RESPONSE=$(curl -i -X GET \
  -H "Origin: $FRONTEND_URL" \
  -s "$BACKEND_URL$ENDPOINT")

echo "$GET_RESPONSE"
echo ""

# Check for CORS headers in actual response
if echo "$GET_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ GET request has Access-Control-Allow-Origin${NC}"
else
    echo -e "${RED}❌ GET request MISSING Access-Control-Allow-Origin${NC}"
fi

# Check status code
if echo "$GET_RESPONSE" | grep -q "HTTP/1.1 200"; then
    echo -e "${GREEN}✅ GET request returns 200 OK${NC}"
else
    echo -e "${YELLOW}⚠️  GET request returns non-200 status (may be API key issue)${NC}"
fi

echo ""

# Test 3: Browser Simulation with fetch
echo "================================"
echo "TEST 3: Browser Simulation"
echo "================================"
echo ""

cat << 'EOF'
To test in the browser console, run:

fetch('http://localhost:3001/api/google-reviews?placeId=test&limit=3&language=pt-BR', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ CORS Error:', err));

Expected: No CORS errors in console
EOF

echo ""

# Summary
echo "================================"
echo "📊 SUMMARY"
echo "================================"
echo ""
echo "If all tests show ✅, CORS is configured correctly."
echo "If you see ❌, check:"
echo "  1. Backend server is running (npm run dev or node api/src/server.js)"
echo "  2. CORS middleware is loaded before routes in server.js"
echo "  3. No conflicting CORS headers in route handlers"
echo "  4. Frontend uses correct origin (http://localhost:3002)"
echo ""
echo -e "${YELLOW}⚠️  Note: API may return errors due to missing Google API key,${NC}"
echo -e "${YELLOW}   but CORS headers should still be present.${NC}"
