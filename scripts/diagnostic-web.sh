#!/bin/bash
# Diagnostic Script - Web Error Debugging
# Usage: ./scripts/diagnostic-web.sh

set -e

BASE_URL="https://saraivavision.com.br"
BUNDLE_HASH=$(curl -s "$BASE_URL/" | grep -o 'index-[A-Za-z0-9_-]*.js' | head -1)

echo "═══════════════════════════════════════════════════"
echo "   WEB DIAGNOSTIC SCRIPT - Saraiva Vision"
echo "═══════════════════════════════════════════════════"
echo ""

# 1. Bundle JavaScript
echo "1️⃣  JavaScript Bundle"
echo "────────────────────────────────────────────────────"
BUNDLE_URL="$BASE_URL/assets/$BUNDLE_HASH"
echo "Bundle: $BUNDLE_HASH"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BUNDLE_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Status: HTTP $HTTP_CODE"
  curl -sI "$BUNDLE_URL" | grep -E "content-type|access-control" | sed 's/^/   /'
else
  echo "❌ Status: HTTP $HTTP_CODE (FAILED)"
fi
echo ""

# 2. Sourcemaps
echo "2️⃣  Sourcemaps"
echo "────────────────────────────────────────────────────"
MAP_URL="${BUNDLE_URL}.map"
MAP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MAP_URL")
if [ "$MAP_CODE" = "200" ]; then
  MAP_SIZE=$(curl -sI "$MAP_URL" | grep -i content-length | awk '{print $2}' | tr -d '\r')
  echo "✅ Disponível (${MAP_SIZE} bytes)"
else
  echo "⚠️  Não encontrado (HTTP $MAP_CODE)"
  echo "   Recomendação: Ativar sourcemaps em vite.config.js"
fi
echo ""

# 3. Crossorigin Attribute
echo "3️⃣  Crossorigin Attribute"
echo "────────────────────────────────────────────────────"
CROSSORIGIN=$(curl -s "$BASE_URL/" | grep -o '<script[^>]*crossorigin[^>]*>' | head -1)
if [ -n "$CROSSORIGIN" ]; then
  echo "✅ Presente"
  echo "   $CROSSORIGIN"
else
  echo "❌ Ausente (causa 'Script error.')"
fi
echo ""

# 4. Imagens AVIF
echo "4️⃣  Imagens AVIF"
echo "────────────────────────────────────────────────────"
IMAGES=("olhinho" "retinose_pigmentar" "moscas_volantes_capa")
SIZES=(480 768 1280)

for img in "${IMAGES[@]}"; do
  echo "📸 $img:"
  for size in "${SIZES[@]}"; do
    URL="$BASE_URL/Blog/${img}-${size}w.avif"
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    if [ "$CODE" = "200" ]; then
      SIZE_KB=$(curl -sI "$URL" | grep -i content-length | awk '{print int($2/1024)}' | tr -d '\r')
      echo "   ✅ ${size}w (HTTP $CODE, ${SIZE_KB}KB)"
    else
      echo "   ❌ ${size}w (HTTP $CODE)"
    fi
  done
  echo ""
done

# 5. MIME Type AVIF
echo "5️⃣  MIME Type AVIF"
echo "────────────────────────────────────────────────────"
CONTENT_TYPE=$(curl -sI "$BASE_URL/Blog/olhinho-1280w.avif" | grep -i "^content-type:" | cut -d' ' -f2 | tr -d '\r')
if [ "$CONTENT_TYPE" = "image/avif" ]; then
  echo "✅ Correto: $CONTENT_TYPE"
else
  echo "❌ Incorreto: $CONTENT_TYPE"
  echo "   Esperado: image/avif"
  echo "   Configurar em /etc/nginx/mime.types"
fi
echo ""

# 6. Case Sensitivity
echo "6️⃣  Case Sensitivity (/Blog/ vs /blog/)"
echo "────────────────────────────────────────────────────"
for path in "/Blog/" "/blog/"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  if [ "$CODE" = "200" ] || [ "$CODE" = "301" ]; then
    echo "   ${path}: HTTP $CODE"
  else
    echo "   ${path}: HTTP $CODE ⚠️"
  fi
done
echo ""

# 7. Cache Headers
echo "7️⃣  Cache Headers"
echo "────────────────────────────────────────────────────"
echo "Homepage (index.html):"
curl -sI "$BASE_URL/" | grep -iE "cache-control|etag|expires" | sed 's/^/   /'
echo ""
echo "Bundle JS (hashed asset):"
curl -sI "$BUNDLE_URL" | grep -iE "cache-control|etag|expires" | sed 's/^/   /'
echo ""

# 8. CORS Headers
echo "8️⃣  CORS Headers"
echo "────────────────────────────────────────────────────"
curl -sI "$BUNDLE_URL" | grep -iE "access-control" | sed 's/^/   /'
echo ""

# 9. SSL Certificate
echo "9️⃣  SSL Certificate"
echo "────────────────────────────────────────────────────"
CERT_INFO=$(echo | openssl s_client -servername saraivavision.com.br -connect saraivavision.com.br:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ -n "$CERT_INFO" ]; then
  echo "✅ Válido"
  echo "$CERT_INFO" | sed 's/^/   /'
else
  echo "⚠️  Não foi possível verificar"
fi
echo ""

# 10. Performance Metrics (Lighthouse)
echo "🔟 Performance Metrics"
echo "────────────────────────────────────────────────────"
if command -v lighthouse &> /dev/null; then
  echo "🚀 Executando Lighthouse audit..."
  lighthouse "$BASE_URL" --only-categories=performance --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh-report.json
  cat /tmp/lh-report.json | jq '.categories.performance.score * 100' | sed 's/^/   Score: /' || echo "   (jq não instalado)"
else
  echo "⏭️  Lighthouse não instalado (npm install -g lighthouse)"
fi
echo ""

echo "═══════════════════════════════════════════════════"
echo "   ✅ Diagnóstico Concluído!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo "   1. Corrigir erros marcados com ❌"
echo "   2. Executar: npm run build && sudo cp -r dist/* /var/www/html/"
echo "   3. Testar no browser: $BASE_URL/blog"
echo "   4. Verificar console do DevTools (F12)"
echo ""
