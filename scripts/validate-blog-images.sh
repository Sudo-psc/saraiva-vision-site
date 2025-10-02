#!/bin/bash

echo "================================================"
echo "🔍 VALIDAÇÃO DE IMAGENS DO BLOG"
echo "================================================"
echo ""

ERRORS=0
WARNINGS=0

echo "1️⃣ Verificando case sensitivity..."
UPPERCASE=$(find public/Blog -name "*[A-Z]*" -type f | grep -v ".gitkeep" | wc -l)
if [ "$UPPERCASE" -gt 0 ]; then
    echo "   ⚠️  AVISO: $UPPERCASE arquivos com maiúsculas encontrados"
    find public/Blog -name "*[A-Z]*" -type f | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo "   ✅ Todos os arquivos em lowercase"
fi
echo ""

echo "2️⃣ Verificando versões responsivas..."
MISSING_RESPONSIVE=0
cd public/Blog
for img in *.png; do
    [[ ! -f "$img" ]] && continue
    base="${img%.png}"
    
    if [[ ! -f "${base}-1920w.avif" ]]; then
        echo "   ❌ $img - faltam versões responsivas"
        MISSING_RESPONSIVE=$((MISSING_RESPONSIVE + 1))
    fi
done

if [ $MISSING_RESPONSIVE -eq 0 ]; then
    echo "   ✅ Todas as imagens têm versões responsivas"
else
    echo "   ⚠️  $MISSING_RESPONSIVE imagens sem versões responsivas"
    WARNINGS=$((WARNINGS + 1))
fi
cd ../..
echo ""

echo "3️⃣ Verificando build..."
if [ ! -d "dist/Blog" ]; then
    echo "   ❌ Pasta dist/Blog não encontrada. Execute: npm run build"
    ERRORS=$((ERRORS + 1))
else
    BLOG_FILES=$(ls -1 dist/Blog/*.png 2>/dev/null | wc -l)
    echo "   ✅ dist/Blog existe com $BLOG_FILES arquivos PNG"
fi
echo ""

echo "4️⃣ Testando URLs específicas (coats)..."
if [ -f "dist/Blog/coats.png" ]; then
    echo "   ✅ /Blog/coats.png existe"
else
    echo "   ❌ /Blog/coats.png NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "dist/Blog/coats-1920w.avif" ]; then
    echo "   ✅ /Blog/coats-1920w.avif existe"
else
    echo "   ❌ /Blog/coats-1920w.avif NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi
echo ""

echo "================================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ VALIDAÇÃO COMPLETA - SEM PROBLEMAS"
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  VALIDAÇÃO COMPLETA - $WARNINGS AVISOS"
else
    echo "❌ VALIDAÇÃO FALHOU - $ERRORS ERROS, $WARNINGS AVISOS"
    exit 1
fi
echo "================================================"
