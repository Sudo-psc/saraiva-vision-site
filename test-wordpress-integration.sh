#!/bin/bash

# Script de teste da integração WordPress
# Clínica Saraiva Vision

echo "=================================================="
echo "🧪 TESTE DE INTEGRAÇÃO WORDPRESS - SARAIVA VISION"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL
BASE_URL="https://saraivavision.com.br"

# Função de teste
test_endpoint() {
    local url="$1"
    local expected_code="$2"
    local description="$3"
    
    echo -n "Testing: $description... "
    
    # Fazer requisição e capturar código de status
    status_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
    
    if [ "$status_code" == "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected: $expected_code, Got: $status_code)"
        return 1
    fi
}

echo -e "${YELLOW}1. TESTES DE REDIRECIONAMENTO${NC}"
echo "================================"
test_endpoint "$BASE_URL/wp-admin" "301" "Redirect /wp-admin → /blog/wp-admin"
test_endpoint "$BASE_URL/wp-admin/" "301" "Redirect /wp-admin/ → /blog/wp-admin/"

echo ""
echo -e "${YELLOW}2. TESTES DE ACESSO WORDPRESS${NC}"
echo "================================"
test_endpoint "$BASE_URL/blog" "200" "Blog homepage"
test_endpoint "$BASE_URL/blog/wp-login.php" "200" "WordPress login page"
test_endpoint "$BASE_URL/blog/wp-admin/" "302" "WordPress admin (redirect to login)"

echo ""
echo -e "${YELLOW}3. TESTES DA API WORDPRESS${NC}"
echo "================================"
test_endpoint "$BASE_URL/wp-json" "200" "WordPress REST API root"
test_endpoint "$BASE_URL/wp-json/wp/v2/posts" "200" "WordPress posts endpoint"
test_endpoint "$BASE_URL/blog/wp-json/wp/v2/posts" "200" "Blog posts via /blog path"

echo ""
echo -e "${YELLOW}4. TESTES DE RECURSOS${NC}"
echo "================================"
test_endpoint "$BASE_URL/blog/wp-includes/js/jquery/jquery.min.js" "200" "jQuery library"
test_endpoint "$BASE_URL/blog/wp-content/themes/" "200" "Themes directory"

echo ""
echo -e "${YELLOW}5. TESTE DE CONTEÚDO${NC}"
echo "================================"

# Testar se o WordPress está retornando conteúdo válido
echo -n "Checking WordPress content... "
content=$(curl -s "$BASE_URL/blog" | head -100)
if [[ "$content" == *"<!DOCTYPE"* ]] || [[ "$content" == *"<html"* ]]; then
    echo -e "${GREEN}✓ HTML válido${NC}"
else
    echo -e "${RED}✗ Conteúdo inválido${NC}"
fi

# Verificar se a API retorna JSON
echo -n "Checking API JSON response... "
api_response=$(curl -s "$BASE_URL/wp-json")
if [[ "$api_response" == "{"* ]]; then
    echo -e "${GREEN}✓ JSON válido${NC}"
else
    echo -e "${RED}✗ Resposta não é JSON${NC}"
fi

echo ""
echo "=================================================="
echo -e "${YELLOW}📊 DIAGNÓSTICO DETALHADO${NC}"
echo "=================================================="
echo ""

# Verificar processo WordPress/PHP
echo "🔍 Processos PHP-FPM:"
ps aux | grep php-fpm | grep -v grep | wc -l | xargs -I {} echo "   {} processos rodando"

# Verificar porta 8083
echo ""
echo "🔍 Porta 8083 (WordPress backend):"
if sudo netstat -tlnp | grep :8083 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Porta 8083 está ouvindo"
else
    echo -e "   ${RED}✗${NC} Porta 8083 não está ouvindo"
fi

# Verificar logs de erro
echo ""
echo "🔍 Últimos erros nginx (WordPress):"
sudo tail -5 /var/log/nginx/wordpress.error.log 2>/dev/null || echo "   Sem erros recentes"

echo ""
echo "=================================================="
echo -e "${YELLOW}📝 URLS PARA TESTE MANUAL${NC}"
echo "=================================================="
echo ""
echo "1. Blog Frontend:"
echo "   ${BASE_URL}/blog"
echo ""
echo "2. WordPress Admin:"
echo "   ${BASE_URL}/blog/wp-admin"
echo "   ${BASE_URL}/wp-admin (deve redirecionar)"
echo ""
echo "3. API Endpoints:"
echo "   ${BASE_URL}/wp-json"
echo "   ${BASE_URL}/wp-json/wp/v2/posts"
echo "   ${BASE_URL}/wp-json/wp/v2/pages"
echo ""
echo "4. Login:"
echo "   ${BASE_URL}/blog/wp-login.php"
echo ""
echo "=================================================="
echo ""
echo "💡 Dica: Use Chrome DevTools para verificar:"
echo "   • Console: Erros JavaScript"
echo "   • Network: Status das requisições"
echo "   • Application: Cookies e sessão"
echo ""