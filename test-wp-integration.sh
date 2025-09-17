#!/bin/bash

echo "🔧 Testando WordPress Integration..."

# Verificar se o servidor mock está rodando
echo "📡 Verificando servidor mock na porta 8081..."
if curl -sf "http://localhost:8081/wp-json" > /dev/null 2>&1; then
    echo "✅ Servidor mock WordPress está online"
else
    echo "❌ Servidor mock WordPress não está respondendo"
    echo "   Execute: node mock-wordpress-server.js"
    exit 1
fi

# Testar endpoints principais
echo ""
echo "📝 Testando endpoint de posts..."
POSTS_RESPONSE=$(curl -sf "http://localhost:8081/wp-json/wp/v2/posts?per_page=1" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Endpoint de posts funcionando"
    echo "   Exemplo: $(echo "$POSTS_RESPONSE" | grep -o '"title":{"rendered":"[^"]*"' | head -1)"
else
    echo "❌ Endpoint de posts falhando"
fi

echo ""
echo "📂 Testando endpoint de categorias..."
if curl -sf "http://localhost:8081/wp-json/wp/v2/categories" > /dev/null 2>&1; then
    echo "✅ Endpoint de categorias funcionando"
else
    echo "❌ Endpoint de categorias falhando"
fi

echo ""
echo "🏷️  Testando endpoint de tags..."
if curl -sf "http://localhost:8081/wp-json/wp/v2/tags" > /dev/null 2>&1; then
    echo "✅ Endpoint de tags funcionando"
else
    echo "❌ Endpoint de tags falhando"
fi

# Verificar se o servidor Vite está rodando
echo ""
echo "🌐 Verificando servidor de desenvolvimento..."
if curl -sf "http://localhost:3002" > /dev/null 2>&1; then
    echo "✅ Servidor Vite está online em http://localhost:3002"
else
    echo "❌ Servidor Vite não está respondendo"
    echo "   Execute: npm run dev"
fi

echo ""
echo "🎉 Teste da integração WordPress concluído!"
echo ""
echo "📋 Para acessar:"
echo "   Blog: http://localhost:3002/blog"
echo "   API:  http://localhost:8081/wp-json/wp/v2/posts"