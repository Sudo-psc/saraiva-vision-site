#!/bin/bash
# Test Analytics Configuration
# Author: Dr. Philipe Saraiva Cruz

echo "🔍 Testing Google Analytics & GTM Configuration"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check environment variables
echo "📋 Test 1: Environment Variables"
if [ -f .env.production ]; then
    if grep -q "VITE_GTM_ID=GTM-KF2NP85D" .env.production && grep -q "VITE_GA_ID=G-LXWRK8ELS6" .env.production; then
        echo -e "${GREEN}✅ Variables configured correctly${NC}"
    else
        echo -e "${RED}❌ Variables missing or incorrect${NC}"
    fi
else
    echo -e "${RED}❌ .env.production not found${NC}"
fi
echo ""

# Test 2: Check Nginx proxies
echo "📋 Test 2: Nginx Proxy Configuration"
echo -n "   Testing /gtm.js proxy... "
if curl -s -I https://saraivavision.com.br/gtm.js?id=GTM-KF2NP85D | grep -q "200"; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi

echo -n "   Testing /ga.js proxy... "
if curl -s -I https://saraivavision.com.br/ga.js | grep -q "200"; then
    echo -e "${GREEN}✅ Working${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
fi
echo ""

# Test 3: Check scripts in production
echo "📋 Test 3: Scripts Loaded on Site"
PAGE_CONTENT=$(curl -s https://saraivavision.com.br/)

if echo "$PAGE_CONTENT" | grep -q "dataLayer"; then
    echo -e "${GREEN}✅ dataLayer found${NC}"
else
    echo -e "${RED}❌ dataLayer not found${NC}"
fi

if echo "$PAGE_CONTENT" | grep -q "GTM-KF2NP85D"; then
    echo -e "${GREEN}✅ GTM ID found${NC}"
else
    echo -e "${YELLOW}⚠️  GTM ID not in initial HTML (may load dynamically)${NC}"
fi

if echo "$PAGE_CONTENT" | grep -q "G-LXWRK8ELS6"; then
    echo -e "${GREEN}✅ GA4 ID found${NC}"
else
    echo -e "${YELLOW}⚠️  GA4 ID not in initial HTML (may load dynamically)${NC}"
fi
echo ""

# Test 4: Check CSP headers
echo "📋 Test 4: CSP Headers"
CSP_HEADER=$(curl -s -I https://saraivavision.com.br/ | grep -i "content-security-policy")

if echo "$CSP_HEADER" | grep -q "googletagmanager.com"; then
    echo -e "${GREEN}✅ GTM allowed in CSP${NC}"
else
    echo -e "${RED}❌ GTM not allowed in CSP${NC}"
fi

if echo "$CSP_HEADER" | grep -q "google-analytics.com"; then
    echo -e "${GREEN}✅ GA allowed in CSP${NC}"
else
    echo -e "${RED}❌ GA not allowed in CSP${NC}"
fi
echo ""

# Test 5: Component check
echo "📋 Test 5: AnalyticsProxy Component"
if [ -f src/components/AnalyticsProxy.jsx ]; then
    if grep -q "/gtm.js" src/components/AnalyticsProxy.jsx; then
        echo -e "${GREEN}✅ Component uses correct GTM proxy route${NC}"
    else
        echo -e "${RED}❌ Component uses wrong GTM route${NC}"
    fi

    if grep -q "VITE_GTM_ID" src/components/AnalyticsProxy.jsx; then
        echo -e "${GREEN}✅ Component reads GTM ID from env${NC}"
    else
        echo -e "${RED}❌ Component doesn't use env variable${NC}"
    fi
else
    echo -e "${RED}❌ AnalyticsProxy.jsx not found${NC}"
fi
echo ""

# Summary
echo "================================================"
echo "🎯 Testing Complete!"
echo ""
echo "📖 For detailed debugging, see:"
echo "   docs/ANALYTICS_DEBUG_REPORT.md"
echo ""
echo "🧪 Manual Browser Test:"
echo "   1. Open: https://saraivavision.com.br"
echo "   2. Press F12 (DevTools)"
echo "   3. Console tab"
echo "   4. Look for: [AnalyticsProxy] messages"
echo "   5. Check: window.gtag and window.dataLayer"
echo ""
echo "📊 Google Analytics Real-Time:"
echo "   https://analytics.google.com/analytics/web/#/realtime"
echo ""
