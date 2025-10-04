#!/bin/bash

echo "🔍 Buscando <img> tags não otimizadas..."
echo ""

found=0

while IFS= read -r match; do
  if ! echo "$match" | grep -q "next/image"; then
    echo "⚠️  $match"
    found=$((found + 1))
  fi
done < <(grep -r '<img' app src --include="*.tsx" --include="*.jsx" 2>/dev/null)

echo ""
if [ $found -eq 0 ]; then
  echo "✅ Nenhuma <img> tag não otimizada encontrada!"
else
  echo "⚠️  Encontradas $found tags <img> não otimizadas"
  echo ""
  echo "💡 Sugestão: Migre para <Image> do next/image"
  echo ""
  echo "Exemplo:"
  echo "  import Image from 'next/image';"
  echo ""
  echo "  <Image"
  echo "    src=\"/images/hero.jpg\""
  echo "    alt=\"Descrição\""
  echo "    width={1200}"
  echo "    height={600}"
  echo "    priority // se acima da dobra"
  echo "  />"
fi
