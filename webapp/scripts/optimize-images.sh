#!/bin/bash

# This script optimizes images for the web.
# It finds all PNG and JPEG images in the specified directories,
# resizes them to a maximum width of 1200px, and converts them to WebP format.

set -e

SRC_DIRS=("public/img" "public/images")
MAX_WIDTH=1200

for dir in "${SRC_DIRS[@]}"; do
  find "$dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -print0 | \
  while IFS= read -r -d $'\0' file; do
    echo "Optimizing $file..."
    convert "$file" -resize "${MAX_WIDTH}>" "${file%.*}.webp"
  done
done

echo "Image optimization complete."
