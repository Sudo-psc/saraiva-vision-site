#!/bin/bash

echo "🌍 Teste de Acesso Externo - WordPress SaraivaVision"
echo "=================================================="

# Testar várias formas de acesso
echo "📊 Testando diferentes endpoints..."

echo ""
echo "1. Testando acesso local via Nginx:"
curl -I http://localhost/wp-admin/install.php | head -1

echo ""
echo "2. Testando acesso local direto ao WordPress:"
curl -I http://localhost:8083/wp-admin/install.php | head -1

echo ""
echo "3. Testando acesso via domínio (Cloudflare):"
response=$(curl -s -o /dev/null -w "%{http_code}" http://saraivavision.com.br/wp-admin/install.php 2>/dev/null)
echo "   Status: $response"
if [ "$response" == "301" ]; then
    echo "   ✅ Redirecionando para HTTPS (comportamento esperado)"
elif [ "$response" == "200" ]; then
    echo "   ✅ Acesso direto funcionando"
else
    echo "   ❌ Erro: $response"
fi

echo ""
echo "4. Testando acesso HTTPS (ignorando certificado):"
response=$(curl -s -k -o /dev/null -w "%{http_code}" https://saraivavision.com.br/wp-admin/install.php 2>/dev/null)
echo "   Status: $response"
if [ "$response" == "521" ]; then
    echo "   ⚠️  Erro 521 - Cloudflare não alcança servidor"
    echo "   🔧 Causa: DNS configurado para proxy mas servidor não tem SSL"
elif [ "$response" == "200" ]; then
    echo "   ✅ Acesso HTTPS funcionando"
else
    echo "   ❌ Erro: $response"
fi

echo ""
echo "5. Verificando configuração DNS atual:"
echo "   DNS aponta para: $(nslookup saraivavision.com.br | grep -A 1 "Name:" | tail -1 | awk '{print $2}')"
echo "   IP do servidor: $(curl -4 ifconfig.me)"

echo ""
echo "6. Verificando status dos serviços Docker:"
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 Diagnóstico:"
echo "============="
echo "Se o acesso local funciona mas o externo não, as causas podem ser:"
echo "1. Firewall bloqueando porta 80/443"
echo "2. DNS do Cloudflare configurado para proxy (orange cloud)"
echo "3. Certificado SSL não configurado"
echo "4. Nginx não configurado para domínio externo"

echo ""
echo "🔧 Soluções:"
echo "==========="
echo "A. Configurar DNS do Cloudflare para modo DNS only (gray cloud)"
echo "B. Configurar certificado SSL com Let's Encrypt"
echo "C. Verificar firewall do servidor"
echo "D. Testar acesso direto pelo IP: http://$(curl -4 ifconfig.me)/wp-admin/install.php"