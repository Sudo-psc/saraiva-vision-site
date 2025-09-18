#!/bin/bash

echo "🔍 reCAPTCHA Debug Script"
echo "=========================="

# 1. Verificar variáveis de ambiente
echo "📍 1. Verificando variáveis de ambiente:"
echo "   VITE_RECAPTCHA_SITE_KEY: $VITE_RECAPTCHA_SITE_KEY"
echo "   RECAPTCHA_SECRET: $RECAPTCHA_SECRET"
echo ""

# 2. Carregar variáveis do arquivo .env se existir
if [ -f .env ]; then
    echo "📍 2. Carregando .env:"
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
    echo "   ✅ Arquivo .env carregado"
    echo "   VITE_RECAPTCHA_SITE_KEY: $VITE_RECAPTCHA_SITE_KEY"
    echo "   RECAPTCHA_SECRET: $RECAPTCHA_SECRET"
else
    echo "📍 2. ❌ Arquivo .env não encontrado"
fi
echo ""

# 3. Verificar se as URLs do reCAPTCHA estão acessíveis
echo "📍 3. Testando conectividade com APIs do reCAPTCHA:"
echo "   Testando https://www.google.com/recaptcha/api.js..."
if curl -s --max-time 5 "https://www.google.com/recaptcha/api.js" > /dev/null; then
    echo "   ✅ API JavaScript acessível"
else
    echo "   ❌ API JavaScript inacessível"
fi

echo "   Testando https://www.google.com/recaptcha/api/siteverify..."
if curl -s --max-time 5 "https://www.google.com/recaptcha/api/siteverify" > /dev/null; then
    echo "   ✅ API Verify acessível"
else
    echo "   ❌ API Verify inacessível"
fi
echo ""

# 4. Testar a API de contato com token de teste
echo "📍 4. Testando API de contato com token de teste..."
if [ -n "$RECAPTCHA_SECRET" ]; then
    echo "   Enviando requisição de teste..."
    response=$(curl -s -X POST http://localhost:5173/api/contact \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Teste Debug",
            "email": "test@example.com",
            "phone": "33999999999",
            "message": "Teste de debug do reCAPTCHA",
            "token": "test-token-from-debug",
            "action": "contact"
        }' 2>/dev/null || echo "Erro na requisição")

    echo "   Resposta: $response"
else
    echo "   ❌ RECAPTCHA_SECRET não configurado, teste pulado"
fi
echo ""

# 5. Verificar CSP
echo "📍 5. Verificando CSP para reCAPTCHA:"
if [ -f "csp-validation.js" ]; then
    echo "   Executando validação CSP..."
    node csp-validation.js 2>/dev/null || echo "   ⚠️ Erro na validação CSP"
else
    echo "   ⚠️ Arquivo csp-validation.js não encontrado"
fi
echo ""

echo "🏁 Debug concluído!"
echo "=========================="
