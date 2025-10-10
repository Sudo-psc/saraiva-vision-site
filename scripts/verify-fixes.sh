#!/bin/bash

# Script para verificar se as correções estão funcionando
echo "🔍 Verificação de Correções - Saraiva Vision"
echo "=========================================="

SITE_URL="https://saraivavision.com.br"
API_LOCAL="http://localhost:3001"

echo -e "\n📊 Testando CORS Fix"
echo "----------------------"
echo "Testando CORS entre www e non-www..."
curl -s -H "Origin: https://www.saraivavision.com.br" -I "$SITE_URL/api/config" | grep -i "access-control-allow-origin"

echo -e "\n📊 Testando Endpoints Analytics"
echo "--------------------------------"
echo "POST /api/analytics/ga:"
curl -s -X POST "$API_LOCAL/api/analytics/ga" -H "Content-Type: application/json" -d '{"test":"data"}' -w "Status: %{http_code}\n" -o /dev/null

echo "POST /api/analytics/gtm:"
curl -s -X POST "$API_LOCAL/api/analytics/gtm" -H "Content-Type: application/json" -d '{"test":"data"}' -w "Status: %{http_code}\n" -o /dev/null

echo -e "\n📊 Testando Outros Endpoints"
echo "-----------------------------"
echo "GET /api/health:"
curl -s "$API_LOCAL/api/health" | jq -r '.status // empty' 2>/dev/null || echo "Erro ao processar resposta"

echo "POST /api/csp-reports:"
curl -s -X POST "$API_LOCAL/api/csp-reports" -H "Content-Type: application/json" -d '{"csp-report":{"test":"test"}}' -w "Status: %{http_code}\n" -o /dev/null

echo -e "\n📊 Verificando Headers de Segurança"
echo "---------------------------------"
curl -s -I "$SITE_URL" | grep -E "(content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy)" | head -5

echo -e "\n📊 Status do Serviço PM2"
echo "------------------------"
pm2 list | grep saraiva-vision-api

echo -e "\n✅ Verificação concluída!"