#!/bin/bash

# Saraiva Vision Production Diagnostic Script
# Comprehensive health check and troubleshooting tool

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="saraivavision.com.br"
API_ENDPOINT="https://$DOMAIN/api/health"
WORDPRESS_ENDPOINT="https://cms.$DOMAIN/graphql"
GOOGLE_MAPS_API_KEY="${VITE_GOOGLE_MAPS_API_KEY:-}"
POSTHOG_KEY="${VITE_POSTHOG_KEY:-}"

echo -e "${BLUE}🔍 Saraiva Vision Production Diagnostic Tool${NC}"
echo "=============================================="
echo ""

# Function to check HTTP status
check_http() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-10}"

    echo -n "Checking $url... "

    if command -v curl &> /dev/null; then
        local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo "000")
        if [ "$response" = "$expected_status" ]; then
            echo -e "${GREEN}✅ OK ($response)${NC}"
            return 0
        else
            echo -e "${RED}❌ FAIL ($response, expected $expected_status)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available${NC}"
        return 1
    fi
}

# Function to check service health
check_service() {
    local name="$1"
    local url="$2"
    local critical="${3:-false}"

    echo -e "${BLUE}🔍 Checking $name...${NC}"

    if check_http "$url"; then
        echo -e "   ${GREEN}✓ $name is healthy${NC}"
        return 0
    else
        if [ "$critical" = "true" ]; then
            echo -e "   ${RED}✗ $name is CRITICAL${NC}"
            return 1
        else
            echo -e "   ${YELLOW}⚠️  $name has issues${NC}"
            return 0
        fi
    fi
}

# Function to check environment variables
check_env_var() {
    local var_name="$1"
    local var_value="$2"
    local required="${3:-false}"

    echo -n "Checking $var_name... "

    if [ -n "$var_value" ]; then
        echo -e "${GREEN}✅ Set${NC}"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo -e "${RED}❌ Missing (REQUIRED)${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  Not set${NC}"
            return 0
        fi
    fi
}

# Function to check DNS resolution
check_dns() {
    local domain="$1"

    echo -n "Checking DNS for $domain... "

    if command -v nslookup &> /dev/null; then
        if nslookup "$domain" &> /dev/null; then
            echo -e "${GREEN}✅ Resolves${NC}"
            return 0
        else
            echo -e "${RED}❌ DNS failure${NC}"
            return 1
        fi
    elif command -v dig &> /dev/null; then
        if dig "$domain" +short &> /dev/null; then
            echo -e "${GREEN}✅ Resolves${NC}"
            return 0
        else
            echo -e "${RED}❌ DNS failure${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  DNS tools not available${NC}"
        return 0
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain="$1"

    echo -n "Checking SSL for $domain... "

    if command -v openssl &> /dev/null; then
        local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2 || echo "")
        if [ -n "$expiry" ]; then
            local expiry_date=$(date -d "$expiry" +%s 2>/dev/null || echo "0")
            local now=$(date +%s)
            local days_left=$(( (expiry_date - now) / 86400 ))

            if [ "$days_left" -gt 30 ]; then
                echo -e "${GREEN}✅ Valid (${days_left} days left)${NC}"
                return 0
            elif [ "$days_left" -gt 7 ]; then
                echo -e "${YELLOW}⚠️  Expires soon (${days_left} days)${NC}"
                return 0
            else
                echo -e "${RED}❌ Expires very soon (${days_left} days)${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ SSL check failed${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  openssl not available${NC}"
        return 0
    fi
}

# Function to check CSP headers
check_csp() {
    local url="$1"

    echo -n "Checking CSP headers for $url... "

    if command -v curl &> /dev/null; then
        local csp_header=$(curl -s -I "$url" 2>/dev/null | grep -i "content-security-policy" || echo "")
        if [ -n "$csp_header" ]; then
            echo -e "${GREEN}✅ Present${NC}"
            return 0
        else
            echo -e "${RED}❌ Missing${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl not available${NC}"
        return 0
    fi
}

# Main diagnostic checks
echo -e "${BLUE}🌐 Network & DNS Checks${NC}"
echo "------------------------"
check_dns "$DOMAIN"
check_dns "cms.$DOMAIN"
check_ssl "$DOMAIN"
echo ""

echo -e "${BLUE}🔧 Environment Variables${NC}"
echo "---------------------------"
check_env_var "VITE_SUPABASE_URL" "$VITE_SUPABASE_URL" true
check_env_var "VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_ANON_KEY" true
check_env_var "VITE_GOOGLE_MAPS_API_KEY" "$GOOGLE_MAPS_API_KEY" true
check_env_var "VITE_POSTHOG_KEY" "$POSTHOG_KEY" false
check_env_var "RESEND_API_KEY" "$RESEND_API_KEY" true
echo ""

echo -e "${BLUE}🏥 Service Health Checks${NC}"
echo "---------------------------"
check_service "Frontend" "https://$DOMAIN" true
check_service "API" "$API_ENDPOINT" true
check_service "WordPress CMS" "$WORDPRESS_ENDPOINT" false
echo ""

echo -e "${BLUE}🔒 Security Headers${NC}"
echo "---------------------"
check_csp "https://$DOMAIN"
echo ""

echo -e "${BLUE}📊 Performance Checks${NC}"
echo "------------------------"

# Check response times
echo -n "Frontend response time... "
if command -v curl &> /dev/null; then
    local time=$(curl -s -o /dev/null -w "%{time_total}" "https://$DOMAIN" 2>/dev/null || echo "0")
    if (( $(echo "$time < 3.0" | bc -l 2>/dev/null || echo "1") )); then
        echo -e "${GREEN}✅ ${time}s${NC}"
    else
        echo -e "${YELLOW}⚠️  ${time}s (slow)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available${NC}"
fi

echo -n "API response time... "
if command -v curl &> /dev/null; then
    local time=$(curl -s -o /dev/null -w "%{time_total}" "$API_ENDPOINT" 2>/dev/null || echo "0")
    if (( $(echo "$time < 2.0" | bc -l 2>/dev/null || echo "1") )); then
        echo -e "${GREEN}✅ ${time}s${NC}"
    else
        echo -e "${YELLOW}⚠️  ${time}s (slow)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available${NC}"
fi

echo ""

# Docker checks (if running in Docker environment)
if [ -f "/.dockerenv" ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo -e "${BLUE}🐳 Docker Environment Checks${NC}"
    echo "------------------------------"

    # Check if services are running
    echo -n "Checking container health... "
    if command -v docker &> /dev/null; then
        local unhealthy=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null | wc -l)
        if [ "$unhealthy" -eq 0 ]; then
            echo -e "${GREEN}✅ All containers healthy${NC}"
        else
            echo -e "${RED}❌ $unhealthy unhealthy containers${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  docker command not available${NC}"
    fi
    echo ""
fi

echo -e "${BLUE}📋 Summary & Recommendations${NC}"
echo "==============================="

# Count failures
FAILURES=0

# Re-run critical checks and count failures
if ! check_http "https://$DOMAIN" &>/dev/null; then ((FAILURES++)); fi
if ! check_http "$API_ENDPOINT" &>/dev/null; then ((FAILURES++)); fi
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ -z "$GOOGLE_MAPS_API_KEY" ] || [ -z "$RESEND_API_KEY" ]; then ((FAILURES++)); fi

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All critical systems operational${NC}"
    echo ""
    echo "🎉 Saraiva Vision is running smoothly!"
else
    echo -e "${RED}❌ $FAILURES critical issues detected${NC}"
    echo ""
    echo "🔧 Recommended actions:"
    echo "   1. Check Vercel deployment logs"
    echo "   2. Verify environment variables in Vercel dashboard"
    echo "   3. Review API server logs"
    echo "   4. Check Supabase connection"
    echo "   5. Validate Google Maps API key"
fi

echo ""
echo -e "${BLUE}For detailed logs, check:${NC}"
echo "   - Vercel dashboard: https://vercel.com/dashboard"
echo "   - Supabase dashboard: https://supabase.com/dashboard"
echo "   - Application logs: Console/DevTools"
echo ""
echo -e "${BLUE}Need help? Contact:${NC}"
echo "   - Email: philipe_cruz@outlook.com"
echo "   - Emergency: Check monitoring alerts"