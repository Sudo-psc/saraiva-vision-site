#!/bin/bash

echo "================================================"
echo "🌐 TESTE DE IMAGENS EM PRODUÇÃO"
echo "================================================"
echo ""

DOMAIN="https://saraivavision.com.br"
IMAGES=(
  "coats.png"
  "coats-1920w.avif"
  "coats-1280w.avif"
  "coats-768w.avif"
  "coats-480w.avif"
)

PASSED=0
FAILED=0

for img in "${IMAGES[@]}"; do
    URL="$DOMAIN/Blog/$img"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    CONTENT_TYPE=$(curl -s -I "$URL" | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
    
    if [ "$STATUS" = "200" ]; then
        echo "✅ $img - HTTP $STATUS - $CONTENT_TYPE"
        PASSED=$((PASSED + 1))
    else
        echo "❌ $img - HTTP $STATUS"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
echo "================================================"
echo "RESULTADO: $PASSED passou, $FAILED falhou"
echo "================================================"

[ $FAILED -eq 0 ] && exit 0 || exit 1
