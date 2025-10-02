#!/bin/bash
# Blog Images Verification Script
# Validates that all required blog cover images exist in correct formats

set -e

BLOG_DIR="public/Blog"
REQUIRED_WIDTHS=(480 768 1280 1920)
REQUIRED_FORMATS=(avif webp png)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Blog Images Validation Script"
echo "================================"
echo ""

# Extract unique image names from posts.json
IMAGE_NAMES=$(cat src/content/blog/posts.json | grep -o '"image": "/Blog/[^"]*' | sed 's/"image": "\/Blog\///' | sed 's/\.png$//' | sed 's/\.jpg$//' | sed 's/\.jpeg$//' | sort -u)

TOTAL_EXPECTED=0
TOTAL_FOUND=0
TOTAL_MISSING=0

for basename in $IMAGE_NAMES; do
  echo "Checking: $basename"
  
  for width in "${REQUIRED_WIDTHS[@]}"; do
    for format in "${REQUIRED_FORMATS[@]}"; do
      file="${BLOG_DIR}/${basename}-${width}w.${format}"
      TOTAL_EXPECTED=$((TOTAL_EXPECTED + 1))
      
      # Check if file exists (follow symlinks)
      if [ -e "$file" ]; then
        TOTAL_FOUND=$((TOTAL_FOUND + 1))
        echo -e "  ${GREEN}✓${NC} ${basename}-${width}w.${format}"
      else
        TOTAL_MISSING=$((TOTAL_MISSING + 1))
        echo -e "  ${RED}✗${NC} ${basename}-${width}w.${format} ${YELLOW}(MISSING)${NC}"
      fi
    done
  done
  echo ""
done

echo "================================"
echo "Summary:"
echo "  Expected: $TOTAL_EXPECTED files"
echo -e "  Found:    ${GREEN}$TOTAL_FOUND${NC} files"
echo -e "  Missing:  ${RED}$TOTAL_MISSING${NC} files"

if [ $TOTAL_MISSING -eq 0 ]; then
  echo ""
  echo -e "${GREEN}✅ All blog images are present!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some blog images are missing. Please generate them.${NC}"
  exit 1
fi
