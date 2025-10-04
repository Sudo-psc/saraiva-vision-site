#!/bin/bash

echo "🔍 Buscando componentes que precisam de 'use client'..."
echo ""

# Buscar hooks de React sem 'use client'
found=0

while IFS= read -r file; do
  if ! head -3 "$file" | grep -q "'use client'\|\"use client\""; then
    if grep -q "useState\|useEffect\|useContext\|useReducer\|useCallback\|useMemo\|useRef\|useLayoutEffect" "$file"; then
      echo "⚠️  $file"
      echo "   └─ Usa hooks mas não tem 'use client'"
      found=$((found + 1))
    fi
  fi
done < <(find app src/components -name "*.tsx" -o -name "*.ts" 2>/dev/null)

echo ""
if [ $found -eq 0 ]; then
  echo "✅ Todos os componentes com hooks têm 'use client'"
else
  echo "⚠️  Encontrados $found arquivos que podem precisar de 'use client'"
  echo ""
  echo "📝 Nota: Verifique se estes são realmente Client Components"
  echo "   Server Components não devem usar hooks do React"
fi
