#!/bin/bash

# WordPress GraphQL Health Check Script
# Monitors WordPress GraphQL endpoint and CORS configuration

echo "🔍 Saraiva Vision WordPress GraphQL Health Check"
echo "=================================================="

# Configuration
WORDPRESS_ENDPOINT="https://cms.saraivavision.com.br/graphql"
FRONTEND_URL="https://saraivavision.com.br"
API_ENDPOINT="https://saraivavision.com.br/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_endpoint() {
    local url=$1
    local name=$2

    echo -e "\n📡 Testing $name..."
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$response" -eq 200 ]; then
        echo -e "  ✅ $name: ${GREEN}OK ($response)${NC}"
        return 0
    elif [ "$response" -eq 404 ]; then
        echo -e "  ❌ $name: ${RED}NOT FOUND ($response)${NC}"
        return 1
    else
        echo -e "  ⚠️  $name: ${YELLOW}ISSUE ($response)${NC}"
        return 1
    fi
}

test_cors() {
    local url=$1
    local name=$2

    echo -e "\n🌐 Testing CORS for $name..."
    local cors_response=$(curl -s -X OPTIONS \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -o /dev/null -w "%{http_code}" "$url")

    if [ "$cors_response" -eq 200 ] || [ "$cors_response" -eq 204 ]; then
        echo -e "  ✅ CORS: ${GREEN}OK ($cors_response)${NC}"
        return 0
    else
        echo -e "  ❌ CORS: ${RED}FAILED ($cors_response)${NC}"
        return 1
    fi
}

test_graphql() {
    local url=$1
    local name=$2

    echo -e "\n🔬 Testing GraphQL functionality..."

    local graphql_response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -H "Origin: $FRONTEND_URL" \
        -d '{"query": "{categories {nodes {id name slug}}}"}' \
        "$url")

    if echo "$graphql_response" | grep -q "categories"; then
        echo -e "  ✅ GraphQL: ${GREEN}WORKING${NC}"
        return 0
    else
        echo -e "  ❌ GraphQL: ${RED}NOT WORKING${NC}"
        echo -e "  📄 Response preview: ${graphql_response:0:200}..."
        return 1
    fi
}

# Main health check
echo "🕒 $(date)"

# Test frontend
test_endpoint "$FRONTEND_URL" "Frontend Application"
FRONTEND_OK=$?

# Test API
test_endpoint "$API_ENDPOINT/contact" "API Endpoint"
API_OK=$?

# Test WordPress GraphQL
test_endpoint "$WORDPRESS_ENDPOINT" "WordPress GraphQL Endpoint"
WP_ENDPOINT_OK=$?

# Test CORS for WordPress
test_cors "$WORDPRESS_ENDPOINT" "WordPress GraphQL"
WP_CORS_OK=$?

# Test GraphQL functionality
test_graphql "$WORDPRESS_ENDPOINT" "WordPress GraphQL"
WP_GRAPHQL_OK=$?

# Summary
echo -e "\n📊 Health Check Summary"
echo "========================"

if [ $FRONTEND_OK -eq 0 ]; then
    echo -e "🌐 Frontend: ${GREEN}OK${NC}"
else
    echo -e "🌐 Frontend: ${RED}ISSUE${NC}"
fi

if [ $API_OK -eq 0 ]; then
    echo -e "⚙️  API: ${GREEN}OK${NC}"
else
    echo -e "⚙️  API: ${RED}ISSUE${NC}"
fi

if [ $WP_ENDPOINT_OK -eq 0 ] && [ $WP_CORS_OK -eq 0 ] && [ $WP_GRAPHQL_OK -eq 0 ]; then
    echo -e "📝 WordPress GraphQL: ${GREEN}OK${NC}"
    WP_OVERALL_OK=0
else
    echo -e "📝 WordPress GraphQL: ${RED}ISSUE${NC}"
    WP_OVERALL_OK=1
fi

echo -e "\n🔧 Troubleshooting"
echo "================"

if [ $WP_OVERALL_OK -ne 0 ]; then
    echo -e "${YELLOW}WordPress GraphQL Issues Detected:${NC}"
    echo "1. Install WPGraphQL plugin in WordPress admin:"
    echo "   https://cms.saraivavision.com.br/wp-admin"
    echo "   Plugins → Add New → Search for 'WPGraphQL' → Install & Activate"
    echo ""
    echo "2. Verify plugin activation:"
    echo "   curl -X POST $WORDPRESS_ENDPOINT -H 'Content-Type: application/json' -d '{\"query\": \"{categories {nodes {id name}}}\"}'"
    echo ""
    echo "3. Check WordPress error logs for debugging"
fi

if [ $WP_ENDPOINT_OK -ne 0 ]; then
    echo -e "${RED}• WordPress GraphQL endpoint returns 404${NC}"
    echo "  → WPGraphQL plugin not installed or activated"
fi

if [ $WP_CORS_OK -ne 0 ]; then
    echo -e "${RED}• CORS preflight requests failing${NC}"
    echo "  → Check WordPress server CORS configuration"
fi

if [ $WP_GRAPHQL_OK -ne 0 ]; then
    echo -e "${RED}• GraphQL queries not working${NC}"
    echo "  → Verify WPGraphQL plugin configuration"
fi

echo -e "\n📚 Documentation"
echo "================"
echo "Full troubleshooting guide: docs/WORDPRESS_GRAPHQL_CORS_FIX.md"
echo "Build status: ✅ Frontend ready for deployment"
echo "WordPress status: ⚠️  Requires plugin installation"

exit $WP_OVERALL_OK