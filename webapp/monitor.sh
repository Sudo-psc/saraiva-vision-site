#!/bin/bash

# Clínica Saraiva Vision - Website Health Monitor
# Monitors all critical endpoints and services

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="https://saraivavision.com.br"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Clínica Saraiva Vision - Health Monitor${NC}"
echo -e "${BLUE}Timestamp: $TIMESTAMP${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to check endpoint
check_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    
    printf "%-50s" "$description:"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [[ "$response" == "$expected_status" ]]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    elif [[ "$response" == "000" ]]; then
        echo -e "${RED}✗ FAILED${NC} (Connection error)"
        return 1
    else
        echo -e "${YELLOW}⚠ WARNING${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to check API response
check_api() {
    local url="$1"
    local description="$2"
    
    printf "%-50s" "$description:"
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if [[ -n "$response" ]]; then
        # Check if it's JSON
        if echo "$response" | jq -e . >/dev/null 2>&1; then
            count=$(echo "$response" | jq 'length' 2>/dev/null || echo "0")
            echo -e "${GREEN}✓ OK${NC} (JSON response, $count items)"
            return 0
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (Non-JSON response)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (Empty response)"
        return 1
    fi
}

# Function to check load time
check_performance() {
    local url="$1"
    local description="$2"
    local max_time="${3:-3}"
    
    printf "%-50s" "$description:"
    
    load_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "999")
    
    if (( $(echo "$load_time < $max_time" | bc -l) )); then
        echo -e "${GREEN}✓ FAST${NC} (${load_time}s)"
        return 0
    elif (( $(echo "$load_time < $(($max_time * 2))" | bc -l) )); then
        echo -e "${YELLOW}⚠ SLOW${NC} (${load_time}s)"
        return 1
    else
        echo -e "${RED}✗ VERY SLOW${NC} (${load_time}s)"
        return 1
    fi
}

# Main Site Checks
echo -e "${BLUE}[Main Site]${NC}"
check_endpoint "$DOMAIN" "Homepage"
check_endpoint "$DOMAIN/sobre" "About Page"
check_endpoint "$DOMAIN/servicos" "Services Page"
check_endpoint "$DOMAIN/contato" "Contact Page"
check_endpoint "$DOMAIN/blog" "Blog Page"
echo

# Service Pages
echo -e "${BLUE}[Service Routes]${NC}"
check_endpoint "$DOMAIN/servicos/consulta-oftalmologica-completa" "Consulta Completa"
check_endpoint "$DOMAIN/servicos/cirurgia-de-catarata" "Cirurgia Catarata"
check_endpoint "$DOMAIN/servicos/tratamento-glaucoma" "Tratamento Glaucoma"
echo

# Static Resources
echo -e "${BLUE}[Static Resources]${NC}"
check_endpoint "$DOMAIN/robots.txt" "Robots.txt"
check_endpoint "$DOMAIN/site.webmanifest" "Web Manifest"
check_endpoint "$DOMAIN/sw.js" "Service Worker"
echo

# WordPress API
echo -e "${BLUE}[WordPress API]${NC}"
check_api "$DOMAIN/wp-json/wp/v2/posts?per_page=1" "Posts API"
check_api "$DOMAIN/wp-json/wp/v2/categories" "Categories API"
echo

# Performance
echo -e "${BLUE}[Performance]${NC}"
check_performance "$DOMAIN" "Homepage Load Time" 2
check_performance "$DOMAIN/servicos" "Services Page Load Time" 2
echo

# SSL Certificate
echo -e "${BLUE}[SSL Certificate]${NC}"
printf "%-50s" "SSL Certificate:"
cert_expiry=$(echo | openssl s_client -servername saraivavision.com.br -connect saraivavision.com.br:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
if [[ -n "$cert_expiry" ]]; then
    echo -e "${GREEN}✓ VALID${NC} (Expires: $cert_expiry)"
else
    echo -e "${RED}✗ ERROR${NC} (Could not check certificate)"
fi
echo

# Service Worker Version
echo -e "${BLUE}[Service Worker]${NC}"
printf "%-50s" "Service Worker Version:"
sw_version=$(curl -s "$DOMAIN/sw.js" | grep -o "SW_VERSION = '[^']*'" | cut -d"'" -f2)
if [[ -n "$sw_version" ]]; then
    echo -e "${GREEN}✓ $sw_version${NC}"
else
    echo -e "${YELLOW}⚠ Could not determine version${NC}"
fi
echo

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Monitor Complete${NC}"
echo -e "${BLUE}========================================${NC}"

# Optional: Send alert if critical services are down
# You can add email/webhook notifications here