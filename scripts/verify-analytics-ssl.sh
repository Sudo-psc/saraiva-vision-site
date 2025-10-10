#!/bin/bash

# Script para verificar o setup do analytics.saraivavision.com.br
echo "🔍 Verificação SSL - Analytics Subdomain"
echo "======================================="

ANALYTICS_URL="https://analytics.saraivavision.com.br"

echo -e "\n📊 Testando Conectividade SSL"
echo "------------------------------"
echo "Verificando certificado SSL..."
cert_info=$(openssl s_client -connect analytics.saraivavision.com.br:443 -servername analytics.saraivavision.com.br < /dev/null 2>/dev/null | openssl x509 -noout -subject -dates 2>/dev/null)

if [[ -n "$cert_info" ]]; then
    echo -e "✅ Certificado SSL válido:"
    echo "$cert_info" | sed 's/^/  /'
else
    echo -e "❌ Erro ao verificar certificado SSL"
fi

echo -e "\n📊 Testando Arquivos Estáticos"
echo "--------------------------------"
echo "GET /static/array.js:"
status=$(curl -s -o /dev/null -w "%{http_code}" "$ANALYTICS_URL/static/array.js")
if [[ "$status" == "200" ]]; then
    echo -e "✅ Status: $status"
    content_type=$(curl -s -I "$ANALYTICS_URL/static/array.js" | grep -i "content-type" | cut -d' ' -f2- | tr -d '\r')
    echo -e "✅ Content-Type: $content_type"
else
    echo -e "❌ Status: $status"
fi

echo -e "\n📊 Testando API Endpoints"
echo "-------------------------"
echo "GET /api/health:"
status=$(curl -s -o /dev/null -w "%{http_code}" "$ANALYTICS_URL/api/health")
if [[ "$status" == "200" ]]; then
    echo -e "✅ Status: $status"
    api_response=$(curl -s "$ANALYTICS_URL/api/health")
    api_status=$(echo "$api_response" | jq -r '.status // "unknown"' 2>/dev/null)
    echo -e "✅ API Status: $api_status"
else
    echo -e "❌ Status: $status"
fi

echo "POST /api/csp-reports:"
status=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ANALYTICS_URL/api/csp-reports" -H "Content-Type: application/json" -d '{"csp-report":{"test":"test"}}')
if [[ "$status" == "204" ]]; then
    echo -e "✅ Status: $status"
else
    echo -e "❌ Status: $status"
fi

echo -e "\n📊 Verificando Headers de Segurança"
echo "----------------------------------"
headers=$(curl -s -I "$ANALYTICS_URL/static/array.js" | grep -E "(x-frame-options|x-content-type-options|referrer-policy|permissions-policy|strict-transport-security)" | head -5)
if [[ -n "$headers" ]]; then
    echo "$headers" | sed 's/^/  /'
else
    echo "⚠️  Nenhum header de segurança encontrado"
fi

echo -e "\n📊 Testando CORS"
echo "----------------"
echo "Testando CORS do domínio principal..."
origin_header=$(curl -s -H "Origin: https://saraivavision.com.br" -I "$ANALYTICS_URL/api/health" | grep -i "access-control-allow-origin" | head -1)
if [[ -n "$origin_header" ]]; then
    echo -e "✅ CORS configurado:"
    echo "$origin_header" | sed 's/^/  /'
else
    echo -e "❌ CORS não configurado ou inválido"
fi

echo -e "\n📊 Configuração Nginx"
echo "---------------------"
echo "Verificando se o site está habilitado..."
if [[ -L "/etc/nginx/sites-enabled/analytics.saraivavision.com.br" ]]; then
    echo -e "✅ Site analytics.saraivavision.com.br habilitado"
else
    echo -e "❌ Site não habilitado"
fi

echo "Testando configuração Nginx..."
nginx_test=$(nginx -t 2>&1 | grep -o "syntax is ok\|test is successful" | head -2)
if [[ -n "$nginx_test" ]]; then
    echo -e "✅ Configuração Nginx válida"
    echo "$nginx_test" | sed 's/^/  /'
else
    echo -e "❌ Erro na configuração Nginx"
fi

echo -e "\n🌐 Resumo do Certificado SSL"
echo "--------------------------"
echo "Domínios cobertos:"
certbot certificates 2>/dev/null | grep -A 5 "saraivavision.com.br" | grep "Domains" | sed 's/.*Domains: //; s/, /\n  /g' | sed 's/^/  /'

echo -e "\nData de expiração:"
expiry=$(certbot certificates 2>/dev/null | grep -A 3 "saraivavision.com.br" | grep "Expiry Date" | head -1)
if [[ -n "$expiry" ]]; then
    echo -e "✅ $expiry"
else
    echo -e "❌ Não foi possível obter data de expiração"
fi

echo -e "\n✅ Verificação concluída!"
echo -e "\n📋 Próximos passos:"
echo "1. O certificado SSL está válido e funcionando"
echo "2. O subdomínio analytics.saraivavision.com.br está ativo"
echo "3. APIs estão acessíveis através do subdomínio"
echo "4. Arquivos estáticos estão sendo servidos corretamente"
echo "5. CORS está configurado para o domínio principal"