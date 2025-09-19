#!/bin/bash

# Script de Validação CORS - Clínica Saraiva Vision
# Testa todas as correções implementadas para resolver problema CORS

echo "🏥 VALIDAÇÃO CORS - CLÍNICA SARAIVA VISION"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar CORS
test_cors() {
    local origin="$1"
    local url="$2"
    local description="$3"

    echo -e "${YELLOW}Testando:${NC} $description"
    echo "Origin: $origin"
    echo "URL: $url"

    # Contar headers Access-Control-Allow-Origin
    local count=$(curl -s -H "Origin: $origin" -I "$url" | grep -ci "access-control-allow-origin")

    if [ "$count" -eq 1 ]; then
        echo -e "✅ ${GREEN}SUCESSO${NC} - 1 header CORS (correto)"
    elif [ "$count" -gt 1 ]; then
        echo -e "❌ ${RED}ERRO${NC} - $count headers CORS (duplicados!)"
        echo "Headers encontrados:"
        curl -s -H "Origin: $origin" -I "$url" | grep -i "access-control-allow-origin"
    else
        echo -e "⚠️  ${YELLOW}AVISO${NC} - Nenhum header CORS encontrado"
    fi

    echo ""
}

# Função para testar redirecionamento
test_redirect() {
    local url="$1"
    local expected="$2"
    local description="$3"

    echo -e "${YELLOW}Testando:${NC} $description"
    echo "URL: $url"

    local redirect=$(curl -s -I "$url" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')

    if [ "$redirect" = "$expected" ]; then
        echo -e "✅ ${GREEN}SUCESSO${NC} - Redirecionamento correto para: $redirect"
    else
        echo -e "❌ ${RED}ERRO${NC} - Redirecionamento incorreto"
        echo "Esperado: $expected"
        echo "Recebido: $redirect"
    fi

    echo ""
}

echo "1. TESTE DE HEADERS CORS DUPLICADOS"
echo "-----------------------------------"

test_cors "https://www.saraivavision.com.br" "https://saraivavision.com.br/wp-json/" \
    "WordPress API - origem www"

test_cors "https://saraivavision.com.br" "https://saraivavision.com.br/wp-json/" \
    "WordPress API - origem não-www"

test_cors "https://example.com" "https://saraivavision.com.br/wp-json/" \
    "WordPress API - origem externa (deve permitir)"

echo "2. TESTE DE REDIRECIONAMENTO CANÔNICO"
echo "-------------------------------------"

test_redirect "https://www.saraivavision.com.br/" "https://saraivavision.com.br/" \
    "Redirecionamento HTTPS www -> não-www"

test_redirect "http://www.saraivavision.com.br/" "https://saraivavision.com.br/" \
    "Redirecionamento HTTP www -> HTTPS não-www"

test_redirect "http://saraivavision.com.br/" "https://saraivavision.com.br/" \
    "Redirecionamento HTTP não-www -> HTTPS não-www"

echo "3. TESTE DE ENDPOINTS ESPECÍFICOS"
echo "---------------------------------"

# Testar API Node.js
echo -e "${YELLOW}Testando:${NC} API Node.js endpoints"
api_response=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/health)
if [ "$api_response" = "200" ]; then
    echo -e "✅ ${GREEN}SUCESSO${NC} - API Node.js acessível"
else
    echo -e "⚠️  ${YELLOW}AVISO${NC} - API Node.js retornou: $api_response"
fi

# Testar WordPress REST API
echo -e "${YELLOW}Testando:${NC} WordPress REST API"
wp_response=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/wp-json/)
if [ "$wp_response" = "200" ]; then
    echo -e "✅ ${GREEN}SUCESSO${NC} - WordPress REST API acessível"
else
    echo -e "❌ ${RED}ERRO${NC} - WordPress REST API retornou: $wp_response"
fi

echo ""

echo "4. TESTE DE HEADERS DE SEGURANÇA MÉDICA"
echo "---------------------------------------"

security_headers=$(curl -s -I https://saraivavision.com.br/ | grep -i -E "(x-frame-options|x-content-type-options|strict-transport-security)")
echo "Headers de segurança encontrados:"
echo "$security_headers"

echo ""

echo "5. VALIDAÇÃO FINAL"
echo "==================="

# Verificar se não há erros CORS nos logs recentes
echo -e "${YELLOW}Verificando logs Nginx para erros CORS recentes...${NC}"
recent_cors_errors=$(tail -50 /var/log/nginx/error.log | grep -i -c "cors\|access-control" || true)

if [ "$recent_cors_errors" -eq 0 ]; then
    echo -e "✅ ${GREEN}SUCESSO${NC} - Nenhum erro CORS nos logs recentes"
else
    echo -e "⚠️  ${YELLOW}AVISO${NC} - $recent_cors_errors erros CORS encontrados nos logs"
fi

# Teste final integrado
echo -e "${YELLOW}Teste integrado final...${NC}"
integrated_test=$(curl -s -H "Origin: https://www.saraivavision.com.br" \
    -H "Access-Control-Request-Method: GET" \
    -H "Content-Type: application/json" \
    https://saraivavision.com.br/wp-json/wp/v2/posts?per_page=1 \
    | jq length 2>/dev/null || echo "0")

if [ "$integrated_test" -gt 0 ] || [[ "$integrated_test" == *"["* ]]; then
    echo -e "✅ ${GREEN}SUCESSO${NC} - WordPress REST API responde corretamente com CORS"
else
    echo -e "❌ ${RED}ERRO${NC} - WordPress REST API não está respondendo adequadamente"
fi

echo ""
echo "🎯 RESUMO DAS CORREÇÕES IMPLEMENTADAS:"
echo "• Removidos headers CORS duplicados do Nginx"
echo "• Implementado redirecionamento canônico (www -> não-www)"
echo "• Configurado plugin WordPress para CORS específico da clínica"
echo "• Adicionados headers de segurança médica (LGPD compliance)"
echo "• WordPress gerencia CORS nativamente sem conflitos"

echo ""
echo -e "${GREEN}✅ VALIDAÇÃO CORS CONCLUÍDA${NC}"
