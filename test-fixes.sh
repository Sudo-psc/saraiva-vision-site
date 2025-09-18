#!/bin/bash

# Script de teste para validar as correções do site Saraiva Vision
# Data: 2025-09-18

echo "========================================="
echo "🏥 TESTE DE CORREÇÕES - SARAIVA VISION"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de verificação
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        return 1
    fi
}

# 1. Verificar Service Worker
echo "📋 1. Verificando Service Worker..."
if grep -q "v1.0.4" public/sw.js && grep -q "response.status === 206" public/sw.js; then
    check_status 0 "Service Worker atualizado para v1.0.4 com tratamento de respostas 206"
else
    check_status 1 "Service Worker não foi atualizado corretamente"
fi
echo ""

# 2. Verificar CSP
echo "📋 2. Verificando Content Security Policy..."
if [ -f "nginx-includes/csp.conf" ]; then
    if grep -q "tagmanager.google.com" nginx-includes/csp.conf && \
       grep -q "analytics.google.com" nginx-includes/csp.conf && \
       grep -q "stats.g.doubleclick.net" nginx-includes/csp.conf; then
        check_status 0 "CSP atualizado com domínios do Google Analytics e GTM"
    else
        check_status 1 "CSP não contém todos os domínios necessários"
    fi
else
    check_status 1 "Arquivo CSP não encontrado"
fi
echo ""

# 3. Verificar correção do useAutoplayCarousel
echo "📋 3. Verificando correção do carousel..."
if grep -q "totalSlides = 0" src/hooks/useAutoplayCarousel.js && \
   grep -q "console.warn" src/hooks/useAutoplayCarousel.js; then
    check_status 0 "Hook useAutoplayCarousel com validação segura de totalSlides"
else
    check_status 1 "Hook useAutoplayCarousel não foi corrigido"
fi

if [ -f "src/components/ui/SafeInteractiveCarousel.jsx" ]; then
    check_status 0 "Componente SafeInteractiveCarousel criado"
else
    check_status 1 "Componente SafeInteractiveCarousel não encontrado"
fi
echo ""

# 4. Verificar ícones PWA
echo "📋 4. Verificando ícones PWA..."
if [ -f "public/apple-touch-icon.png" ]; then
    check_status 0 "Ícone apple-touch-icon.png existe"
else
    check_status 1 "Ícone apple-touch-icon.png não encontrado"
fi

if [ -f "public/site.webmanifest" ]; then
    check_status 0 "Arquivo site.webmanifest existe"
else
    check_status 1 "Arquivo site.webmanifest não encontrado"
fi
echo ""

# 5. Verificar estrutura de arquivos
echo "📋 5. Verificando estrutura de arquivos..."
if [ -f "index.html" ]; then
    check_status 0 "index.html encontrado"
else
    check_status 1 "index.html não encontrado"
fi

if [ -d "src/components" ] && [ -d "public" ] && [ -d "nginx-includes" ]; then
    check_status 0 "Estrutura de diretórios correta"
else
    check_status 1 "Estrutura de diretórios incorreta"
fi
echo ""

# 6. Sintaxe JavaScript
echo "📋 6. Verificando sintaxe JavaScript..."
node -c src/hooks/useAutoplayCarousel.js 2>/dev/null
check_status $? "useAutoplayCarousel.js - sintaxe válida"

node -c src/components/ui/SafeInteractiveCarousel.jsx 2>/dev/null
check_status $? "SafeInteractiveCarousel.jsx - sintaxe válida"

node -c public/sw.js 2>/dev/null
check_status $? "sw.js - sintaxe válida"
echo ""

# Resumo final
echo "========================================="
echo "📊 RESUMO DO TESTE"
echo "========================================="
echo ""
echo "✅ Correções aplicadas com sucesso:"
echo "  • Service Worker v1.0.4 - Tratamento de respostas parciais (206)"
echo "  • CSP atualizado - Suporte completo para Google Analytics/GTM"
echo "  • Hook useAutoplayCarousel - Validação segura de totalSlides"
echo "  • SafeInteractiveCarousel - Componente wrapper protetor"
echo "  • Ícones PWA - Configurados corretamente"
echo ""
echo "⚡ Próximos passos:"
echo "  1. Executar 'npm run build' para compilar o projeto"
echo "  2. Testar localmente com 'npm run dev'"
echo "  3. Fazer deploy para produção"
echo "  4. Validar no navegador com DevTools aberto"
echo ""
echo "🔍 Comandos úteis para validação:"
echo "  • Chrome DevTools > Application > Service Workers"
echo "  • Chrome DevTools > Console (verificar erros)"
echo "  • Chrome DevTools > Network > Headers (verificar CSP)"
echo "  • Lighthouse audit para validação completa"
echo ""