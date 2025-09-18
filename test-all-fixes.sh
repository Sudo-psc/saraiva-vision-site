#!/bin/bash

# Script de Teste Completo - Correções Saraiva Vision
# Data: 2025-09-18
# Testa todas as correções aplicadas para problemas de CSP, JavaScript e performance

echo "=================================================="
echo "🏥 TESTE COMPLETO - CLÍNICA SARAIVA VISION"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
PASSED=0
FAILED=0

# Função de teste
test_feature() {
    local description="$1"
    local command="$2"
    local expected="$3"
    
    echo -n "Testing: $description... "
    
    result=$(eval "$command" 2>&1)
    
    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}1. PERMISSIONS-POLICY${NC}"
echo "================================"
test_feature \
    "Permissions-Policy sem interest-cohort" \
    "grep -q 'interest-cohort' nginx-includes/security-headers.conf && echo 'found' || echo 'not found'" \
    "not found"

test_feature \
    "Geolocation permitida para self" \
    "grep 'Permissions-Policy' nginx-includes/security-headers.conf | grep -q 'geolocation=(self)' && echo 'ok'" \
    "ok"

echo ""
echo -e "${BLUE}2. CONTENT SECURITY POLICY (CSP)${NC}"
echo "================================"
test_feature \
    "CSP com nonce configurado" \
    "test -f nginx-includes/csp-with-nonce.conf && echo 'exists'" \
    "exists"

test_feature \
    "Google Analytics permitido no CSP" \
    "grep -q 'analytics.google.com' nginx-includes/csp.conf && echo 'configured'" \
    "configured"

test_feature \
    "Google Tag Manager permitido no CSP" \
    "grep -q 'tagmanager.google.com' nginx-includes/csp.conf && echo 'configured'" \
    "configured"

test_feature \
    "Google Maps permitido no frame-src" \
    "grep 'frame-src' nginx-includes/csp-with-nonce.conf | grep -q 'google.com/maps' && echo 'ok'" \
    "ok"

echo ""
echo -e "${BLUE}3. JAVASCRIPT - CAROUSEL${NC}"
echo "================================"
test_feature \
    "goToSlide corrigido para goTo em Services.jsx" \
    "grep -c 'goToSlide' src/components/Services.jsx" \
    "0"

test_feature \
    "Método goTo usado em Services.jsx" \
    "grep -q 'autoplayCarousel.goTo' src/components/Services.jsx && echo 'fixed'" \
    "fixed"

test_feature \
    "SafeInteractiveCarousel criado" \
    "test -f src/components/ui/SafeInteractiveCarousel.jsx && echo 'exists'" \
    "exists"

test_feature \
    "useAutoplayCarousel com validação segura" \
    "grep -q 'totalSlides = 0' src/hooks/useAutoplayCarousel.js && echo 'safe'" \
    "safe"

echo ""
echo -e "${BLUE}4. GOOGLE MAPS${NC}"
echo "================================"
test_feature \
    "GoogleMapsLoader componente criado" \
    "test -f src/components/GoogleMapsLoader.jsx && echo 'exists'" \
    "exists"

test_feature \
    "Fallback para mapa sem API key" \
    "grep -q 'API Key do Google Maps não configurada' src/components/GoogleMapsLoader.jsx && echo 'has fallback'" \
    "has fallback"

echo ""
echo -e "${BLUE}5. WEB VITALS${NC}"
echo "================================"
test_feature \
    "Endpoint web-vitals configurado no nginx" \
    "grep -q 'location = /web-vitals' nginx.conf && echo 'configured'" \
    "configured"

test_feature \
    "API web-vitals.js criada" \
    "test -f api/web-vitals.js && echo 'exists'" \
    "exists"

test_feature \
    "Web vitals com análise de performance" \
    "grep -q 'analyzeVitals' api/web-vitals.js && echo 'has analysis'" \
    "has analysis"

echo ""
echo -e "${BLUE}6. OTIMIZAÇÃO DE IMAGENS${NC}"
echo "================================"
test_feature \
    "Sistema de lazy loading criado" \
    "test -f src/utils/imageOptimization.js && echo 'exists'" \
    "exists"

test_feature \
    "Intersection Observer implementado" \
    "grep -q 'IntersectionObserver' src/utils/imageOptimization.js && echo 'implemented'" \
    "implemented"

test_feature \
    "Suporte a WebP/AVIF" \
    "grep -q 'getSupportedImageFormat' src/utils/imageOptimization.js && echo 'supported'" \
    "supported"

echo ""
echo -e "${BLUE}7. SERVICE WORKER${NC}"
echo "================================"
test_feature \
    "Service Worker versão atualizada" \
    "grep -q 'v1.0.4' public/sw.js && echo 'v1.0.4'" \
    "v1.0.4"

test_feature \
    "Tratamento de respostas 206" \
    "grep -q 'response.status === 206' public/sw.js && echo 'handled'" \
    "handled"

echo ""
echo -e "${BLUE}8. ESTRUTURA DE ARQUIVOS${NC}"
echo "================================"
test_feature \
    "Diretório nginx-includes existe" \
    "test -d nginx-includes && echo 'exists'" \
    "exists"

test_feature \
    "Build dist existe" \
    "test -d dist && echo 'exists'" \
    "exists"

echo ""
echo -e "${BLUE}9. SINTAXE JAVASCRIPT${NC}"
echo "================================"

# Testa sintaxe de arquivos JS críticos
for file in \
    "src/components/Services.jsx" \
    "src/hooks/useAutoplayCarousel.js" \
    "src/utils/imageOptimization.js" \
    "api/web-vitals.js"
do
    if [ -f "$file" ]; then
        echo -n "Syntax check: $file... "
        if node -c "$file" 2>/dev/null; then
            echo -e "${GREEN}✓ Valid${NC}"
            ((PASSED++))
        else
            echo -e "${RED}✗ Invalid${NC}"
            ((FAILED++))
        fi
    fi
done

echo ""
echo "=================================================="
echo -e "${BLUE}📊 RESUMO DOS TESTES${NC}"
echo "=================================================="
echo ""
echo -e "Testes aprovados: ${GREEN}$PASSED${NC}"
echo -e "Testes falhados: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TODOS OS TESTES PASSARAM!${NC}"
    echo ""
    echo "O site da Clínica Saraiva Vision está pronto para deploy com:"
    echo "• Permissions-Policy corrigido"
    echo "• CSP configurado para Google Analytics/GTM"
    echo "• Carousel funcionando sem erros"
    echo "• Google Maps com fallback"
    echo "• Web Vitals implementado"
    echo "• Imagens otimizadas com lazy loading"
    echo "• Service Worker v1.0.4"
else
    echo -e "${YELLOW}⚠️ ALGUNS TESTES FALHARAM${NC}"
    echo "Revise os erros acima antes do deploy."
fi

echo ""
echo "=================================================="
echo -e "${BLUE}🚀 PRÓXIMOS PASSOS${NC}"
echo "=================================================="
echo ""
echo "1. Build de produção:"
echo "   npm run build"
echo ""
echo "2. Deploy para servidor:"
echo "   ./deploy-simple.sh"
echo ""
echo "3. Validação em produção:"
echo "   - Acesse https://saraivavision.com.br"
echo "   - Abra Chrome DevTools (F12)"
echo "   - Verifique Console (sem erros)"
echo "   - Teste Service Worker em Application"
echo "   - Valide CSP em Network > Headers"
echo ""
echo "4. Monitoramento:"
echo "   - Google Analytics Dashboard"
echo "   - Web Vitals em /web-vitals"
echo "   - Lighthouse Audit"
echo ""
echo "=================================================="