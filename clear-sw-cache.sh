#!/bin/bash
# Script para limpar service workers problemáticos

echo "🧹 Limpando Service Workers e Cache..."
echo "===================================="

# Clear nginx cache if exists
echo "📁 Limpando cache nginx..."
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
    echo "✅ Cache nginx limpo"
fi

# Restart nginx to clear any memory cache
echo "🔄 Reiniciando nginx..."
systemctl restart nginx
if [ $? -eq 0 ]; then
    echo "✅ Nginx reiniciado"
else
    echo "❌ Erro ao reiniciar nginx"
    exit 1
fi

# Clear browser cache instructions
echo ""
echo "🌐 INSTRUÇÕES PARA LIMPAR CACHE DO SAFARI:"
echo "========================================="
echo "1. Safari → Develop → Empty Caches (Cmd+Option+E)"
echo "2. Safari → Preferences → Privacy → Manage Website Data → Remove All"
echo "3. Safari → Develop → Disable Service Workers (temporariamente)"
echo "4. Recarregue a página (Cmd+R ou Cmd+Shift+R para hard refresh)"
echo ""
echo "📱 Para Safari Mobile/iPad:"
echo "=========================="
echo "1. Settings → Safari → Clear History and Website Data"
echo "2. Ou Settings → Safari → Advanced → Website Data → Remove All"
echo ""
echo "🔧 VERIFICAÇÕES ADICIONAIS:"
echo "=========================="
echo "1. Verificar se o site está acessível:"
echo "   curl -I https://saraivavision.com.br/"
echo ""
echo "2. Verificar service worker:"
echo "   curl https://saraivavision.com.br/sw.js"
echo ""
echo "3. Verificar logs nginx:"
echo "   tail -f /var/log/nginx/error.log"
echo "   tail -f /var/log/nginx/access.log"
