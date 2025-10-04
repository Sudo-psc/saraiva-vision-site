#!/bin/bash

echo "🔍 Verificando metadata em rotas do Next.js..."
echo ""

ok=0
missing=0

while IFS= read -r file; do
  if grep -q "metadata\|generateMetadata" "$file"; then
    echo "✅ $file"
    ok=$((ok + 1))
  else
    echo "❌ $file (falta metadata)"
    missing=$((missing + 1))
  fi
done < <(find app -name "page.tsx" -o -name "page.ts" 2>/dev/null)

echo ""
echo "📊 Resumo:"
echo "   ✅ Com metadata: $ok"
echo "   ❌ Sem metadata: $missing"

if [ $missing -eq 0 ]; then
  echo ""
  echo "🎉 Todas as rotas têm metadata configurada!"
else
  echo ""
  echo "⚠️  Adicione metadata nas rotas faltantes para melhor SEO"
  echo ""
  echo "Exemplo:"
  echo "  export const metadata = {"
  echo "    title: 'Título da Página',"
  echo "    description: 'Descrição para SEO',"
  echo "  };"
fi
