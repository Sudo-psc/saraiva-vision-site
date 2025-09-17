#!/bin/bash

# Script para testar integração WordPress completa
echo "🧪 TESTANDO INTEGRAÇÃO WORDPRESS COMPLETA"
echo "=========================================="
echo

# 1. Verificar servidor mock WordPress
echo "1. 📡 Verificando servidor WordPress Mock..."
if curl -s "http://localhost:8081/wp-json/wp/v2" > /dev/null 2>&1; then
    echo "   ✅ Servidor WordPress Mock ativo na porta 8081"
    
    # Testar posts
    POST_COUNT=$(curl -s "http://localhost:8081/wp-json/wp/v2/posts" | jq 'length' 2>/dev/null || echo "0")
    echo "   📄 Posts disponíveis: $POST_COUNT"
    
    # Mostrar primeiro post como exemplo
    if [ "$POST_COUNT" -gt "0" ]; then
        echo "   📝 Exemplo de post:"
        curl -s "http://localhost:8081/wp-json/wp/v2/posts?per_page=1" | jq '.[0] | {id: .id, title: .title.rendered, status: .status}' 2>/dev/null || echo "   ⚠️ Erro ao processar dados do post"
    fi
else
    echo "   ❌ Servidor WordPress Mock não está respondendo"
    echo "   💡 Iniciando servidor mock..."
    node mock-wordpress-server.js &
    sleep 3
    echo "   🔄 Tentando novamente..."
    if curl -s "http://localhost:8081/wp-json/wp/v2" > /dev/null 2>&1; then
        echo "   ✅ Servidor WordPress Mock iniciado com sucesso"
    else
        echo "   ❌ Falha ao iniciar servidor WordPress Mock"
    fi
fi

echo
echo "2. 🌐 Verificando configuração da integração..."

# Verificar variáveis de ambiente
if [ -f ".env" ]; then
    echo "   ✅ Arquivo .env encontrado"
    
    WP_URL=$(grep "VITE_WORDPRESS_API_URL" .env | cut -d'=' -f2)
    CONSTRUCTION=$(grep "VITE_BLOG_UNDER_CONSTRUCTION" .env | cut -d'=' -f2)
    
    echo "   🔗 WordPress API URL: $WP_URL"
    echo "   🏗️ Página em construção: $CONSTRUCTION"
    
    if [ "$CONSTRUCTION" = "0" ]; then
        echo "   ✅ Overlay de construção desabilitado"
    else
        echo "   ⚠️ Overlay de construção ainda ativo"
    fi
else
    echo "   ⚠️ Arquivo .env não encontrado"
fi

echo
echo "3. ⚛️ Verificando arquivo de configuração WordPress..."

if [ -f "src/lib/wordpress.js" ]; then
    echo "   ✅ Arquivo wordpress.js encontrado"
    
    # Verificar se as funções principais existem
    if grep -q "fetchPosts" src/lib/wordpress.js; then
        echo "   ✅ Função fetchPosts disponível"
    fi
    
    if grep -q "checkWordPressConnection" src/lib/wordpress.js; then
        echo "   ✅ Função checkWordPressConnection disponível"
    fi
    
    if grep -q "API_BASE_URL" src/lib/wordpress.js; then
        echo "   ✅ Configuração API_BASE_URL definida"
    fi
else
    echo "   ❌ Arquivo wordpress.js não encontrado"
fi

echo
echo "4. 📝 Verificando componente BlogPage..."

if [ -f "src/pages/BlogPage.jsx" ]; then
    echo "   ✅ Arquivo BlogPage.jsx encontrado"
    
    # Verificar se o overlay foi removido
    if grep -q "Página em construção" src/pages/BlogPage.jsx; then
        echo "   ⚠️ Ainda há referências à página em construção"
    else
        echo "   ✅ Overlay de construção removido"
    fi
    
    # Verificar imports do WordPress
    if grep -q "from.*wordpress" src/pages/BlogPage.jsx; then
        echo "   ✅ Imports do WordPress configurados"
    fi
else
    echo "   ❌ Arquivo BlogPage.jsx não encontrado"
fi

echo
echo "5. 🌍 Simulando requisição do React para WordPress..."

# Simular o que o React faria
echo "   📡 Fazendo requisição para /wp-json/wp/v2/posts..."
HTTP_STATUS=$(curl -s -o /tmp/wp_response.json -w "%{http_code}" "http://localhost:8081/wp-json/wp/v2/posts?per_page=3&_embed=true")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ Requisição bem-sucedida (HTTP $HTTP_STATUS)"
    
    # Verificar estrutura dos dados
    if command -v jq > /dev/null 2>&1; then
        POST_COUNT=$(jq 'length' /tmp/wp_response.json 2>/dev/null || echo "0")
        echo "   📊 Posts retornados: $POST_COUNT"
        
        if [ "$POST_COUNT" -gt "0" ]; then
            echo "   📋 Estrutura do primeiro post:"
            jq '.[0] | {id: .id, title: .title.rendered, excerpt: (.excerpt.rendered | gsub("<[^>]*>"; "") | .[0:100] + "..."), date: .date, status: .status, _embedded: (._embedded | keys)}' /tmp/wp_response.json 2>/dev/null || echo "   ⚠️ Erro ao analisar estrutura"
        fi
    else
        echo "   ⚠️ jq não disponível para análise detalhada"
    fi
else
    echo "   ❌ Requisição falhou (HTTP $HTTP_STATUS)"
fi

# Limpeza
rm -f /tmp/wp_response.json

echo
echo "📊 RESUMO DA INTEGRAÇÃO"
echo "======================"
echo "✅ Servidor mock funcionando: $([ "$POST_COUNT" -gt "0" ] && echo "SIM" || echo "NÃO")"
echo "✅ Overlay removido: $([ ! -f "src/pages/BlogPage.jsx" ] || ! grep -q "Página em construção" src/pages/BlogPage.jsx && echo "SIM" || echo "NÃO")"
echo "✅ API configurada: $([ -f "src/lib/wordpress.js" ] && echo "SIM" || echo "NÃO")"
echo "✅ Variáveis de ambiente: $([ "$CONSTRUCTION" = "0" ] && echo "OK" || echo "VERIFICAR")"

echo
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Abrir http://localhost:3003/blog no navegador"
echo "2. Verificar se os posts estão sendo exibidos"
echo "3. Verificar console do navegador para erros"
echo