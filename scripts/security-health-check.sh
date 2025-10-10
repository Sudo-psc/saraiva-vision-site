#!/bin/bash

# Security Health Check Script for Saraiva Vision
# Verifica todos os componentes de segurança implementados

echo "🔍 Saraiva Vision - Security Health Check"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SITE_URL="https://saraivavision.com.br"
API_URL="https://analytics.saraivavision.com.br"

echo -e "${BLUE}📊 Verificando Headers de Segurança${NC}"
echo "--------------------------------------------"

# Function to check header
check_header() {
    local url=$1
    local header=$2
    local expected=$3

    echo -n "  $header: "
    header_value=$(curl -s -I "$url" 2>/dev/null | grep -i "$header:" | tr -d '\r')

    if [[ -n "$header_value" ]]; then
        if [[ "$expected" == "present" ]]; then
            echo -e "${GREEN}✅ Present${NC}"
            echo "    $header_value"
        else
            echo -e "${GREEN}✅ $header_value${NC}"
        fi
    else
        echo -e "${RED}❌ Missing${NC}"
    fi
}

echo "Site principal: $SITE_URL"
check_header "$SITE_URL" "x-frame-options" "present"
check_header "$SITE_URL" "x-content-type-options" "present"
check_header "$SITE_URL" "x-xss-protection" "present"
check_header "$SITE_URL" "referrer-policy" "present"
check_header "$SITE_URL" "permissions-policy" "present"
check_header "$SITE_URL" "strict-transport-security" "present"
check_header "$SITE_URL" "content-security-policy-report-only" "present"
check_header "$SITE_URL" "report-to" "present"

echo ""
echo -e "${BLUE}🔌 Verificando Endpoints da API${NC}"
echo "--------------------------------------------"

# Function to check API endpoint
check_api_endpoint() {
    local url=$1
    local method=$2
    local data=$3
    local expected_status=$4

    echo -n "  $method $url: "

    if [[ "$method" == "GET" ]]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url" 2>/dev/null)
    fi

    if [[ "$status" == "$expected_status" ]]; then
        echo -e "${GREEN}✅ $status${NC}"
    else
        echo -e "${RED}❌ $status (expected: $expected_status)${NC}"
    fi
}

# Test API endpoints
check_api_endpoint "$API_URL/api/health" "GET" "" "200"
check_api_endpoint "$API_URL/api/csp-reports" "POST" '{"csp-report":{"test":"test"}}' "204"
check_api_endpoint "$API_URL/api/ga" "POST" '{"test":"data"}' "204"
check_api_endpoint "$API_URL/api/gtm" "POST" '{"test":"data"}' "204"
check_api_endpoint "$API_URL/api/ga" "GET" "" "405"
check_api_endpoint "$API_URL/api/gtm" "GET" "" "405"

echo ""
echo -e "${BLUE}🌐 Verificando Configurações SSL${NC}"
echo "--------------------------------------------"

# Check SSL certificate
echo -n "  SSL Certificate: "
ssl_info=$(echo | openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [[ -n "$ssl_info" ]]; then
    echo -e "${GREEN}✅ Valid${NC}"
    echo "$ssl_info" | sed 's/^/    /'
else
    echo -e "${RED}❌ Invalid or missing${NC}"
fi

echo ""
echo -e "${BLUE}📈 Status dos Serviços${NC}"
echo "--------------------------------------------"

# Check PM2 processes
echo "PM2 Processes:"
pm2 list 2>/dev/null | grep -E "(saraiva-vision|id|name|status)" | while read line; do
    if [[ "$line" =~ (saraiva-vision) ]]; then
        if [[ "$line" =~ "online" ]]; then
            echo -e "  ${GREEN}✅ $line${NC}"
        elif [[ "$line" =~ "errored" ]]; then
            echo -e "  ${RED}❌ $line${NC}"
        else
            echo -e "  ${YELLOW}⚠️  $line${NC}"
        fi
    elif [[ "$line" =~ (id|name|status) ]]; then
        echo "  $line"
    fi
done

echo ""
echo -e "${BLUE}🔍 Verificação de Portas${NC}"
echo "--------------------------------------------"

# Check critical ports
echo -n "  Port 443 (HTTPS): "
if netstat -tuln 2>/dev/null | grep -q ":443 "; then
    echo -e "${GREEN}✅ Listening${NC}"
else
    echo -e "${RED}❌ Not listening${NC}"
fi

echo -n "  Port 3001 (API): "
if netstat -tuln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✅ Listening${NC}"
else
    echo -e "${RED}❌ Not listening${NC}"
fi

echo ""
echo -e "${BLUE}📊 Métricas do Sistema${NC}"
echo "--------------------------------------------"

# System resources
echo -n "  Load Average: "
load=$(uptime | awk -F'load average:' '{ print $2 }' | awk '{ print $1 }' | tr -d ',')
if (( $(echo "$load < 2.0" | bc -l) )); then
    echo -e "${GREEN}$load${NC}"
elif (( $(echo "$load < 4.0" | bc -l) )); then
    echo -e "${YELLOW}$load${NC}"
else
    echo -e "${RED}$load${NC}"
fi

echo -n "  Memory Usage: "
mem_usage=$(free | grep Mem | awk '{printf("%.1f", $3/$2 * 100.0)}')
if (( $(echo "$mem_usage < 80" | bc -l) )); then
    echo -e "${GREEN}$mem_usage%${NC}"
elif (( $(echo "$mem_usage < 90" | bc -l) )); then
    echo -e "${YELLOW}$mem_usage%${NC}"
else
    echo -e "${RED}$mem_usage%${NC}"
fi

echo ""
echo -e "${BLUE}🚨 Recomendações${NC}"
echo "--------------------------------------------"

echo "📋 Checklist de Monitoramento CSP:"
echo "  • Monitorar logs de violações CSP por 48-72 horas"
echo "  • Analisar padrões de violações no endpoint /api/csp-reports"
echo "  • Verificar funcionalidades críticas (GA, GTM, Maps)"
echo "  • Documentar violações legítimas vs suspeitas"
echo ""

echo "🔧 Próximos Passos:"
echo "  • Após análise, remover domínios desnecessários da CSP"
echo "  • Considerar implementação de SRI para scripts críticos"
echo "  • Testar política CSP enforce em ambiente de staging"
echo "  • Implementar dashboard para visualização de violações"
echo ""

echo "✅ Health check concluído em $(date)"
echo ""

# Show last 5 CSP violations if any
echo -e "${BLUE}📊 Últimas 5 Violacoes CSP (se existirem)${NC}"
echo "--------------------------------------------"
pm2 logs saraiva-vision-api --lines 50 2>/dev/null | grep "CSP Violation" | tail -5 | while read line; do
    echo "  $line"
done

if ! pm2 logs saraiva-vision-api --lines 50 2>/dev/null | grep -q "CSP Violation"; then
    echo "  ${GREEN}Nenhuma violação CSP registrada recentemente${NC}"
fi

echo ""
echo "📁 Documentação completa: /home/saraiva-vision-site/docs/CSP-Migration-Plan.md"