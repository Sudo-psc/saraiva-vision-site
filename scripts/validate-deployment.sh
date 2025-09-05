#!/bin/bash

# Script de validação pós-deploy para Saraiva Vision
# Executa verificações automatizadas após deployment

set -euo pipefail

SITE_URL="${SITE_URL:-https://saraivavision.com.br}"
TIMEOUT="${TIMEOUT:-30}"

echo "🔍 Validando deployment em $SITE_URL"

# Função para fazer requests com timeout
check_url() {
    local url="$1"
    local expected_code="${2:-200}"
    
    echo "📡 Verificando $url..."
    
    if command -v curl >/dev/null 2>&1; then
        local status_code
        status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" || echo "000")
        
        if [[ "$status_code" == "$expected_code" ]]; then
            echo "✅ $url retornou $status_code"
            return 0
        else
            echo "❌ $url retornou $status_code (esperado: $expected_code)"
            return 1
        fi
    else
        echo "⚠️  curl não disponível - pulando verificação de $url"
        return 0
    fi
}

# Função para verificar se conteúdo existe
check_content() {
    local url="$1"
    local pattern="$2"
    
    echo "🔍 Verificando conteúdo em $url..."
    
    if command -v curl >/dev/null 2>&1; then
        local content
        content=$(curl -s --max-time "$TIMEOUT" "$url" || echo "")
        
        if echo "$content" | grep -q "$pattern"; then
            echo "✅ Conteúdo encontrado: $pattern"
            return 0
        else
            echo "❌ Conteúdo não encontrado: $pattern"
            return 1
        fi
    else
        echo "⚠️  curl não disponível - pulando verificação de conteúdo"
        return 0
    fi
}

# Contador de falhas
FAILURES=0

# 1. Verificar se o site principal está acessível
if check_url "$SITE_URL"; then
    echo "✅ Site principal acessível"
else
    echo "❌ Site principal inacessível"
    ((FAILURES++))
fi

# 2. Verificar páginas importantes
PAGES=(
    "/"
    "/servicos"
    "/sobre"
    "/contato"
    "/politica-privacidade"
)

for page in "${PAGES[@]}"; do
    if check_url "${SITE_URL}${page}"; then
        echo "✅ Página $page acessível"
    else
        echo "❌ Página $page inacessível"
        ((FAILURES++))
    fi
done

# 3. Verificar se GTM está carregado
if check_content "$SITE_URL" "GTM-"; then
    echo "✅ GTM detectado"
else
    echo "⚠️  GTM não detectado"
    ((FAILURES++))
fi

# 4. Verificar se o conteúdo principal está presente
CONTENT_CHECKS=(
    "Saraiva Vision"
    "oftalmologista"
    "Caratinga"
)

for content in "${CONTENT_CHECKS[@]}"; do
    if check_content "$SITE_URL" "$content"; then
        echo "✅ Conteúdo encontrado: $content"
    else
        echo "❌ Conteúdo não encontrado: $content"
        ((FAILURES++))
    fi
done

# 5. Verificar se CSS está carregando (busca por assets)
if check_content "$SITE_URL" "assets/"; then
    echo "✅ Assets detectados"
else
    echo "⚠️  Assets não detectados"
    ((FAILURES++))
fi

# 6. Verificar estrutura HTML básica
HTML_CHECKS=(
    "<!DOCTYPE html>"
    "<html"
    "<head>"
    "<body>"
    "</html>"
)

for html_element in "${HTML_CHECKS[@]}"; do
    if check_content "$SITE_URL" "$html_element"; then
        echo "✅ HTML estrutura OK: $html_element"
    else
        echo "❌ HTML estrutura problema: $html_element"
        ((FAILURES++))
    fi
done

# 7. Verificar meta tags essenciais
META_CHECKS=(
    '<meta charset='
    '<meta name="viewport"'
    '<title>'
    '<meta name="description"'
)

for meta in "${META_CHECKS[@]}"; do
    if check_content "$SITE_URL" "$meta"; then
        echo "✅ Meta tag encontrada: $meta"
    else
        echo "⚠️  Meta tag não encontrada: $meta"
        ((FAILURES++))
    fi
done

# 8. Verificar se robots.txt existe
if check_url "${SITE_URL}/robots.txt"; then
    echo "✅ robots.txt acessível"
else
    echo "⚠️  robots.txt não encontrado"
fi

# 9. Verificar se sitemap.xml existe
if check_url "${SITE_URL}/sitemap.xml"; then
    echo "✅ sitemap.xml acessível"
else
    echo "⚠️  sitemap.xml não encontrado"
fi

# 10. Teste de performance básico (tempo de resposta)
echo "⏱️  Testando tempo de resposta..."
if command -v curl >/dev/null 2>&1; then
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" --max-time "$TIMEOUT" "$SITE_URL" || echo "999")
    RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc -l 2>/dev/null || echo "999")
    
    if (( $(echo "$RESPONSE_TIME < 3" | bc -l 2>/dev/null || echo "0") )); then
        echo "✅ Tempo de resposta OK: ${RESPONSE_TIME}s"
    else
        echo "⚠️  Tempo de resposta lento: ${RESPONSE_TIME}s"
        ((FAILURES++))
    fi
else
    echo "⚠️  Não foi possível medir tempo de resposta"
fi

# 11. Verificar se HTTPS está funcionando
if [[ "$SITE_URL" == https://* ]]; then
    if check_url "$SITE_URL"; then
        echo "✅ HTTPS funcionando"
    else
        echo "❌ HTTPS com problemas"
        ((FAILURES++))
    fi
fi

# Resumo final
echo ""
echo "📊 RESUMO DA VALIDAÇÃO"
echo "======================="

if [[ $FAILURES -eq 0 ]]; then
    echo "✅ Todas as verificações passaram!"
    echo "🎉 Deploy validado com sucesso!"
    exit 0
elif [[ $FAILURES -le 3 ]]; then
    echo "⚠️  $FAILURES verificações falharam (aceitável)"
    echo "🔄 Deploy OK, mas com pequenos problemas"
    exit 0
else
    echo "❌ $FAILURES verificações falharam (crítico)"
    echo "🚨 Deploy pode ter problemas significativos"
    exit 1
fi