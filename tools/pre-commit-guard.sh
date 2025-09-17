#!/usr/bin/env bash
set -euo pipefail

red() { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)

# 1) Block committing .env files
BLOCKED_ENV=$(echo "$STAGED_FILES" | awk '/^\.env(\..*)?$/') || true
if [[ -n "${BLOCKED_ENV:-}" ]]; then
  red "⛔ Aborting commit: .env files must not be committed:"
  echo "$BLOCKED_ENV" | sed 's/^/ - /'
  exit 1
fi

# 2) Secret patterns to scan in newly added lines
PATTERNS=(
  'RECAPTCHA_SECRET\s*='
  'GOOGLE_([A-Z_]*_)?KEY\s*='
  'SUPABASE_([A-Z_]*_)?KEY\s*='
  'AWS_(SECRET|ACCESS)_KEY\s*='
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
)

FILES_TO_SCAN=$(echo "$STAGED_FILES" | grep -Ev '^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|dist/|coverage/|node_modules/|public/|\.githooks/|tools/pre-commit-guard\.sh)$') || true

if [[ -n "${FILES_TO_SCAN:-}" ]]; then
  for f in $FILES_TO_SCAN; do
    # Only scan text files
    if file "$f" | grep -qiE 'text|json|xml|yaml|yml|javascript|typescript|jsx|tsx|css|html|md'; then
      ADDED=$(git diff --cached -U0 -- "$f" | grep '^+' | grep -vE '^\+\+\+' || true)
      for p in "${PATTERNS[@]}"; do
        if echo "$ADDED" | grep -Eiq "$p"; then
          red "⛔ Potential secret found in $f (pattern: $p). Aborting commit."
          yellow "If this is a false positive, commit with --no-verify (not recommended)."
          exit 1
        fi
      done
    fi
  done
fi

green "✅ Pre-commit secret scan passed"
exit 0

