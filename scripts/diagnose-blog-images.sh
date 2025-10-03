#!/bin/bash

echo "=== DIAGNÓSTICO DE IMAGENS DO BLOG ==="
echo ""

echo "1️⃣ Verificando imagens sem versões responsivas:"
cd public/Blog

for img in *.png; do
    [[ ! -f "$img" ]] && continue
    base="${img%.png}"
    
    if [[ ! -f "${base}-1920w.avif" ]]; then
        echo "❌ $img - FALTAM versões responsivas"
    fi
done

echo ""
echo "2️⃣ Verificando case sensitivity (arquivos com maiúsculas):"
find . -name "*[A-Z]*" | head -20

echo ""
echo "3️⃣ Imagens Coats existentes:"
ls -lh Coats* 2>/dev/null | awk '{print $9, $5}' || echo "Nenhuma"

