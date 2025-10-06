#!/bin/bash
# Script para migrar cores blue → cyan em componentes de blog

# Lista de arquivos a processar
files=(
  "src/components/blog/AccessibleComponents.jsx"
  "src/components/blog/PostPageTemplateRefactored.jsx"
  "src/components/blog/PostPageTemplate.jsx"
  "src/components/blog/BlogPostLayout.jsx"
  "src/components/blog/LearningSummary.jsx"
  "src/components/blog/AuthorWidget.jsx"
  "src/components/blog/InfoBox.jsx"
  "src/components/blog/TableOfContents.jsx"
)

# Padrões de substituição
declare -A patterns=(
  ["bg-blue-50"]="bg-cyan-50"
  ["bg-blue-100"]="bg-cyan-100"
  ["bg-blue-200"]="bg-cyan-200"
  ["bg-blue-300"]="bg-cyan-300"
  ["bg-blue-500"]="bg-cyan-500"
  ["bg-blue-600"]="bg-cyan-600"
  ["bg-blue-700"]="bg-cyan-700"
  ["bg-blue-800"]="bg-cyan-800"
  ["bg-blue-900"]="bg-cyan-900"
  ["from-blue-50"]="from-cyan-50"
  ["from-blue-100"]="from-cyan-100"
  ["from-blue-500"]="from-cyan-500"
  ["from-blue-600"]="from-cyan-600"
  ["from-blue-700"]="from-cyan-700"
  ["to-blue-50"]="to-cyan-50"
  ["to-blue-100"]="to-cyan-100"
  ["to-blue-200"]="to-cyan-200"
  ["to-blue-500"]="to-cyan-500"
  ["to-blue-600"]="to-cyan-600"
  ["to-blue-700"]="to-cyan-700"
  ["to-blue-800"]="to-cyan-800"
  ["to-blue-900"]="to-cyan-900"
  ["border-blue-100"]="border-cyan-100"
  ["border-blue-200"]="border-cyan-200"
  ["border-blue-300"]="border-cyan-300"
  ["border-blue-500"]="border-cyan-500"
  ["border-blue-600"]="border-cyan-600"
  ["border-blue-700"]="border-cyan-700"
  ["text-blue-50"]="text-cyan-50"
  ["text-blue-100"]="text-cyan-100"
  ["text-blue-600"]="text-cyan-600"
  ["text-blue-700"]="text-cyan-700"
  ["text-blue-800"]="text-cyan-800"
  ["text-blue-900"]="text-cyan-900"
  ["hover:bg-blue-50"]="hover:bg-cyan-50"
  ["hover:bg-blue-100"]="hover:bg-cyan-100"
  ["hover:bg-blue-600"]="hover:bg-cyan-600"
  ["hover:bg-blue-700"]="hover:bg-cyan-700"
  ["hover:bg-blue-800"]="hover:bg-cyan-800"
  ["hover:from-blue-500"]="hover:from-cyan-500"
  ["hover:from-blue-600"]="hover:from-cyan-600"
  ["hover:from-blue-700"]="hover:from-cyan-700"
  ["hover:to-blue-600"]="hover:to-cyan-600"
  ["hover:to-blue-700"]="hover:to-cyan-700"
  ["hover:to-blue-800"]="hover:to-cyan-800"
  ["hover:border-blue-300"]="hover:border-cyan-300"
  ["hover:border-blue-400"]="hover:border-cyan-400"
  ["hover:border-blue-500"]="hover:border-cyan-500"
  ["hover:border-blue-600"]="hover:border-cyan-600"
  ["hover:text-blue-600"]="hover:text-cyan-600"
  ["hover:text-blue-700"]="hover:text-cyan-700"
  ["hover:text-blue-800"]="hover:text-cyan-800"
)

total_replacements=0

# Processar cada arquivo
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processando: $file"
    file_replacements=0

    # Aplicar todas as substituições
    for old in "${!patterns[@]}"; do
      new="${patterns[$old]}"
      count=$(grep -o "$old" "$file" 2>/dev/null | wc -l)
      if [ "$count" -gt 0 ]; then
        sed -i "s/$old/$new/g" "$file"
        file_replacements=$((file_replacements + count))
        echo "  - $old → $new ($count ocorrências)"
      fi
    done

    total_replacements=$((total_replacements + file_replacements))
    echo "  Total no arquivo: $file_replacements substituições"
  else
    echo "Arquivo não encontrado: $file"
  fi
done

echo ""
echo "========================================="
echo "Total geral: $total_replacements substituições"
echo "========================================="
