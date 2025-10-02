#!/bin/bash

DOMAIN="https://saraivavision.com.br"
IMAGES=(
  "capa-terapias-geneticas.png"
  "capa-olho-seco.png"
  "capa-nutricao-visao.png"
  "capa-lentes-presbiopia.png"
  "capa-lentes-premium.png"
  "capa-cirurgia-refrativa.png"
  "capa-lacrimejamento.png"
)

echo "🧪 Testing all previously missing images..."
echo ""

PASSED=0
FAILED=0

for img in "${IMAGES[@]}"; do
  URL="$DOMAIN/Blog/$img"
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
  
  if [ "$STATUS" = "200" ]; then
    echo "✅ $img - HTTP $STATUS"
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
