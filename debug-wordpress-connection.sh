#!/bin/bash

echo "🐛 DEBUG: Testando conexão WordPress"
echo "===================================="

# 1. Verificar variáveis de ambiente
echo "1. 📋 Variáveis de ambiente:"
if [ -f ".env" ]; then
    echo "   VITE_WORDPRESS_API_URL: $(grep VITE_WORDPRESS_API_URL .env | cut -d'=' -f2)"
    echo "   VITE_LOG_WP_API: $(grep VITE_LOG_WP_API .env | cut -d'=' -f2)"
else
    echo "   ❌ Arquivo .env não encontrado"
fi

echo
echo "2. 🌐 Testando conectividade direta:"

# WordPress Mock
echo "   WordPress Mock (8081):"
WP_RESPONSE=$(curl -s "http://localhost:8081/wp-json/wp/v2/posts?per_page=1" -w "%{http_code}" -o /tmp/wp_debug.json)
WP_STATUS="${WP_RESPONSE: -3}"
echo "      Status: $WP_STATUS"

if [ "$WP_STATUS" = "200" ]; then
    echo "      Dados: $(cat /tmp/wp_debug.json | jq -r '.[0].title.rendered' 2>/dev/null || echo 'Erro ao processar JSON')"
else
    echo "      Erro: $(cat /tmp/wp_debug.json 2>/dev/null || echo 'Sem resposta')"
fi

# React Dev Server
echo "   React Dev Server (3002):"
REACT_STATUS=$(curl -s "http://localhost:3002" -w "%{http_code}" -o /dev/null 2>/dev/null || echo "000")
echo "      Status: $REACT_STATUS"

echo
echo "3. 🔍 Simulando checkWordPressConnection():"

# Simular o que a função faz
API_URL="http://localhost:8081/wp-json/wp/v2"
echo "   API_BASE_URL: $API_URL"
echo "   Testando: $API_URL/posts?per_page=1"

CONN_STATUS=$(curl -s "$API_URL/posts?per_page=1" -w "%{http_code}" -o /tmp/wp_conn_test.json 2>/dev/null)
CONN_HTTP_STATUS="${CONN_STATUS: -3}"

echo "   HTTP Status: $CONN_HTTP_STATUS"
echo "   Response OK: $([ "$CONN_HTTP_STATUS" -ge "200" ] && [ "$CONN_HTTP_STATUS" -lt "300" ] && echo 'true' || echo 'false')"

if [ "$CONN_HTTP_STATUS" -ge "200" ] && [ "$CONN_HTTP_STATUS" -lt "300" ]; then
    echo "   ✅ Conexão WordPress: SUCESSO"
    echo "   📄 Posts encontrados: $(cat /tmp/wp_conn_test.json | jq 'length' 2>/dev/null || echo '0')"
else
    echo "   ❌ Conexão WordPress: FALHA"
    echo "   💡 Motivo: $(cat /tmp/wp_conn_test.json 2>/dev/null | head -c 100 || echo 'Sem resposta')"
fi

echo
echo "4. 🌍 Testando CORS (Cross-Origin):"

# Simular requisição CORS (como o browser faria)
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:3002" \
                     -H "Access-Control-Request-Method: GET" \
                     -H "Access-Control-Request-Headers: content-type" \
                     -X OPTIONS "http://localhost:8081/wp-json/wp/v2/posts" \
                     -w "%{http_code}" -o /tmp/cors_test.txt 2>/dev/null)
CORS_STATUS="${CORS_RESPONSE: -3}"

echo "   CORS Preflight Status: $CORS_STATUS"
echo "   CORS Headers: $(cat /tmp/cors_test.txt 2>/dev/null || echo 'Não disponível')"

echo
echo "5. 💡 Diagnóstico:"

if [ "$CONN_HTTP_STATUS" -ge "200" ] && [ "$CONN_HTTP_STATUS" -lt "300" ]; then
    echo "   ✅ WordPress mock está funcionando"
    echo "   🔍 Problema provável: CORS ou timing no React"
    echo ""
    echo "   📋 Soluções sugeridas:"
    echo "      1. Verificar se VITE_WORDPRESS_API_URL aponta para localhost:8081"
    echo "      2. Verificar console do navegador para erros CORS"
    echo "      3. Verificar se o servidor React consegue fazer fetch interno"
else
    echo "   ❌ WordPress mock não está respondendo corretamente"
    echo "   🔧 Ações necessárias:"
    echo "      1. Reiniciar servidor mock: node mock-wordpress-server.js"
    echo "      2. Verificar se porta 8081 está livre"
fi

# Limpeza
rm -f /tmp/wp_debug.json /tmp/wp_conn_test.json /tmp/cors_test.txt

echo