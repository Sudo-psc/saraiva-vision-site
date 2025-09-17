#!/bin/bash

echo "🏥 Clínica Saraiva Vision - Teste de Integração WordPress"
echo "======================================================="
echo ""

echo "1. Verificando se WordPress está rodando na porta 8083..."
if curl -s http://localhost:8083/wp-json/wp/v2/posts >/dev/null 2>&1; then
    echo "✅ WordPress está respondendo!"
    
    echo ""
    echo "2. Testando posts..."
    POST_COUNT=$(curl -s http://localhost:8083/wp-json/wp/v2/posts | jq length 2>/dev/null || echo "0")
    echo "📝 Posts encontrados: $POST_COUNT"
    
    echo ""
    echo "3. Testando categorias..."
    CAT_COUNT=$(curl -s http://localhost:8083/wp-json/wp/v2/categories | jq length 2>/dev/null || echo "0")
    echo "📂 Categorias encontradas: $CAT_COUNT"
    
    echo ""
    echo "4. Exemplo de post:"
    curl -s http://localhost:8083/wp-json/wp/v2/posts | jq -r '.[0].title.rendered' 2>/dev/null || echo "Erro ao obter títulos"
    
    echo ""
    echo "5. Status do servidor PHP:"
    ps aux | grep -E "php.*localhost:8083" | grep -v grep || echo "Processo não encontrado"
    
else
    echo "❌ WordPress não está respondendo na porta 8083"
    echo ""
    echo "Verificando processos PHP:"
    ps aux | grep php | grep -v grep || echo "Nenhum processo PHP encontrado"
    
    echo ""
    echo "Verificando porta 8083:"
    lsof -i :8083 || echo "Porta 8083 não está em uso"
fi

echo ""
echo "✅ Teste concluído!"