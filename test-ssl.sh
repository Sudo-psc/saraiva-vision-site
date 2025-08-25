#!/bin/bash

echo "🔒 VERIFICAÇÃO SSL E HTTPS - Saraiva Vision"
echo "=========================================="

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description ($url): "
    
    response=$(curl -s -o /dev/null -w "%{http_code}|%{redirect_url}" --max-time 10 "$url")
    http_code=$(echo $response | cut -d'|' -f1)
    redirect_url=$(echo $response | cut -d'|' -f2)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ OK (200)${NC}"
        return 0
    elif [ "$http_code" = "301" ] || [ "$http_code" = "302" ]; then
        echo -e "${YELLOW}↗ Redirect ($http_code) → $redirect_url${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL ($http_code)${NC}"
        return 1
    fi
}

# Função para testar SSL
test_ssl() {
    local domain=$1
    echo -n "Testing SSL certificate for $domain: "
    
    if timeout 10 openssl s_client -connect $domain:443 -servername $domain </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✓ Valid SSL${NC}"
        return 0
    else
        echo -e "${RED}✗ SSL Issues${NC}"
        return 1
    fi
}

echo "1. Testing HTTP to HTTPS redirects:"
test_url "http://saraivavision.com.br" "HTTP Main Domain"
test_url "http://www.saraivavision.com.br" "HTTP WWW Domain"

echo
echo "2. Testing HTTPS connections:"
test_url "https://saraivavision.com.br" "HTTPS Main Domain"
test_url "https://www.saraivavision.com.br" "HTTPS WWW Domain"

echo
echo "3. Testing SSL certificates:"
test_ssl "saraivavision.com.br"
test_ssl "www.saraivavision.com.br"

echo
echo "4. Testing API endpoints:"
test_url "https://saraivavision.com.br/api/reviews" "HTTPS API"

echo
echo "5. Testing localhost (development):"
test_url "http://localhost" "Localhost"

echo
echo "6. Nginx and firewall status:"
echo -n "Nginx status: "
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

echo -n "Firewall status: "
if sudo ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}✓ Active${NC}"
else
    echo -e "${YELLOW}⚠ Inactive${NC}"
fi

echo
echo "7. Certificate expiry check:"
if [ -f "/etc/letsencrypt/live/saraivavision.com.br/fullchain.pem" ]; then
    expiry=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem | cut -d= -f2)
    echo "Certificate expires: $expiry"
else
    echo -e "${RED}✗ Certificate file not found${NC}"
fi

echo
echo "8. Port status:"
echo "Open ports (80, 443, 22):"
sudo netstat -tlnp | grep -E ':(80|443|22)\s' | while read line; do
    echo "  $line"
done

echo
echo "=========================================="
echo "🎯 Quick Tests:"
echo "Browser test: https://saraivavision.com.br"
echo "SSL test: curl -I https://saraivavision.com.br"
echo "API test: curl https://saraivavision.com.br/api/reviews"
echo "=========================================="
