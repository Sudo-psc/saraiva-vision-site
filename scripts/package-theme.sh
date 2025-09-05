#!/usr/bin/env bash
set -euo pipefail

THEME_DIR="wordpress-theme/saraivavision"
OUT="saraivavision-wp-theme.zip"

if [[ ! -d "$THEME_DIR" ]]; then
  echo "Theme directory not found: $THEME_DIR" >&2
  exit 1
fi

echo "Packaging WordPress theme from $THEME_DIR -> $OUT"
rm -f "$OUT"
cd "$(dirname "$THEME_DIR")"/.. # repo root

if command -v zip >/dev/null 2>&1; then
  zip -r "$OUT" "$(basename "$THEME_DIR")" -x "*.DS_Store" "*/.git*" >/dev/null
else
  echo "'zip' not found. Using Python to create zip..."
  python3 - << 'PY'
import os, sys, zipfile
theme_dir = os.path.join('wordpress-theme','saraivavision')
out = 'saraivavision-wp-theme.zip'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(theme_dir):
        for f in files:
            if f == '.DS_Store' or f.startswith('.git'): continue
            full = os.path.join(root, f)
            arc = os.path.relpath(full, os.path.dirname(theme_dir))
            z.write(full, arc)
print('Created', out)
PY
fi
echo "Created $OUT"
