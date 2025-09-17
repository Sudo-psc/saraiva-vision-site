#!/bin/bash

# Migration Script: Custom SW → Workbox
# Saraiva Vision - Cache Strategy Optimization

echo "🚀 Migrando para Workbox Service Worker"
echo "======================================="

# 1. Backup do service worker atual
echo "📁 Backup do service worker atual..."
if [ -f "public/sw.js" ]; then
    cp public/sw.js public/sw.js.backup
    echo "✅ Backup criado: public/sw.js.backup"
fi

if [ -f "dist/sw.js" ]; then
    cp dist/sw.js dist/sw.js.backup
    echo "✅ Backup criado: dist/sw.js.backup"
fi

# 2. Build com nova configuração Workbox
echo ""
echo "🔨 Construindo com Workbox..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Restaurando backups..."
    if [ -f "public/sw.js.backup" ]; then
        cp public/sw.js.backup public/sw.js
    fi
    exit 1
fi

# 3. Verificar se Workbox gerou o service worker
if [ ! -f "dist/sw.js" ]; then
    echo "❌ Service worker não foi gerado pelo Workbox!"
    exit 1
fi

echo "✅ Service worker Workbox gerado com sucesso"

# 4. Verificar se o log de build existe
if [ -f "dist/sw-build.log" ]; then
    echo ""
    echo "📊 Estatísticas do build:"
    cat dist/sw-build.log | grep -E "(filesPreCached|totalSize)" | head -2
fi

# 5. Validar estrutura do service worker gerado
echo ""
echo "🔍 Validando service worker..."

# Verifica se contém imports do Workbox
if grep -q "workbox" dist/sw.js; then
    echo "✅ Service worker contém código Workbox"
else
    echo "⚠️  Service worker pode não ter sido gerado corretamente"
fi

# Verifica se contém manifest
if grep -q "__WB_MANIFEST" dist/sw.js; then
    echo "✅ Manifest de precache detectado"
else
    echo "⚠️  Manifest de precache não encontrado"
fi

# 6. Deploy instructions
echo ""
echo "🚀 PRÓXIMOS PASSOS:"
echo "=================="
echo "1. Teste localmente: npm run preview"
echo "2. Verifique DevTools → Application → Service Workers"
echo "3. Monitore Console para logs do Workbox"
echo "4. Deploy para produção quando confirmar funcionamento"
echo ""
echo "📋 MONITORAMENTO:"
echo "- Cache Hits/Misses no Network tab"
echo "- Storage usage em DevTools → Application → Storage"
echo "- Update notifications no site"
echo ""
echo "🔧 ROLLBACK (se necessário):"
echo "- Restaurar: cp public/sw.js.backup public/sw.js"
echo "- Rebuild: npm run build"

echo ""
echo "✅ Migração para Workbox concluída!"
