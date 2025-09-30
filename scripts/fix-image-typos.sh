#!/bin/bash
# Fix Image Naming Typos in /public/Blog
# Saraiva Vision - Blog Image Corrections

set -e  # Exit on error

BLOG_DIR="/home/saraiva-vision-site/public/Blog"
BACKUP_DIR="/home/saraiva-vision-site/public/Blog_backup_$(date +%Y%m%d_%H%M%S)"

echo "🔧 Fixing Image Naming Typos"
echo "============================"
echo ""

# Create backup
echo "📦 Creating backup at: $BACKUP_DIR"
cp -r "$BLOG_DIR" "$BACKUP_DIR"
echo "✅ Backup created"
echo ""

cd "$BLOG_DIR"

# Fix: descolamente → descolamento
if [ -f "descolamente_retina_capa.png" ]; then
    echo "🔄 Fixing: descolamente_retina_capa.png → descolamento_retina_capa.png"
    mv "descolamente_retina_capa.png" "descolamento_retina_capa.png"
    echo "✅ Fixed"
else
    echo "✓  descolamento_retina_capa.png already correct"
fi
echo ""

# Remove files with spaces (URL-unsafe)
echo "🧹 Removing files with spaces in names..."
find . -type f -name "* *" | while read -r file; do
    echo "   ⚠️  Found: $file"
    # Suggest rename
    newname=$(echo "$file" | tr ' ' '_')
    echo "   → Suggested fix: mv \"$file\" \"$newname\""
done
echo ""

# Check for mixed case issues
echo "🔍 Checking for case sensitivity issues..."
find . -type f \( -name "*.PNG" -o -name "*.JPG" -o -name "*.JPEG" \) | while read -r file; do
    echo "   ⚠️  Uppercase extension: $file"
    newname="${file%.*}.${file##*.}"
    newname="${newname,,}"  # Convert to lowercase
    echo "   → mv \"$file\" \"$newname\""
done
echo ""

# Verify critical images exist
echo "✅ Verifying critical blog images..."
CRITICAL_IMAGES=(
    "capa_daltonismo.png"
    "descolamento_retina_capa.png"
    "olhinho.png"
    "retinose_pigmentar.png"
    "moscas_volantes_capa.png"
    "gym_capa.png"
    "futuristic_eye_examination.png"
    "terapia_genica.png"
    "Coats.png"
)

MISSING=0
for img in "${CRITICAL_IMAGES[@]}"; do
    if [ ! -f "$img" ]; then
        echo "   ❌ MISSING: $img"
        ((MISSING++))
    else
        echo "   ✓  Found: $img"
    fi
done
echo ""

if [ $MISSING -gt 0 ]; then
    echo "⚠️  $MISSING critical images missing!"
    echo "   Check original filenames or restore from backup"
else
    echo "✅ All critical images present"
fi
echo ""

# Generate report
REPORT_FILE="/home/saraiva-vision-site/image-fix-report.txt"
echo "📄 Generating report: $REPORT_FILE"
{
    echo "Image Fix Report"
    echo "================"
    echo "Date: $(date)"
    echo "Backup: $BACKUP_DIR"
    echo ""
    echo "Total PNG files: $(find . -name "*.png" | wc -l)"
    echo "Total AVIF files: $(find . -name "*.avif" | wc -l)"
    echo "Total WebP files: $(find . -name "*.webp" | wc -l)"
    echo ""
    echo "Files with spaces:"
    find . -type f -name "* *" || echo "None"
    echo ""
    echo "Uppercase extensions:"
    find . -type f \( -name "*.PNG" -o -name "*.JPG" \) || echo "None"
} > "$REPORT_FILE"

echo "✅ Report saved"
echo ""
echo "🎉 Image fixes complete!"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Generate manifest: npm run generate:manifest"
echo "3. Test build: npm run build"
echo "4. Deploy: sudo cp -r dist/* /var/www/html/"
