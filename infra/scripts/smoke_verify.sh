#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"
MODE_STRICT="${2:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: $0 <base_url> [--strict]"; exit 1
fi

strict=false
if [[ "$MODE_STRICT" == "--strict" ]]; then strict=true; fi

ok=true
warn=false

say() { printf "%s\n" "$*"; }
header() { say; say "=== $* ==="; }

PAGES=(/ /servicos /contato /sobre /faq)

header "Smoke: HTTP status checks"
for p in "${PAGES[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL$p" || echo "000")
  printf "  %-12s -> %s\n" "$p" "$code"
  [[ "$code" =~ ^(200|30[12])$ ]] || ok=false
done

header "Smoke: Security headers on /"
hdrs=$(curl -sSI "$BASE_URL/" | tr -d '\r' || true)
printf "%s\n" "$hdrs" | grep -qi "Strict-Transport-Security" || { say "  Missing HSTS"; ok=false; }
printf "%s\n" "$hdrs" | grep -qi "X-Content-Type-Options: nosniff" || { say "  Missing X-Content-Type-Options"; ok=false; }
printf "%s\n" "$hdrs" | grep -qi "X-Frame-Options" || { say "  Missing X-Frame-Options"; ok=false; }
printf "%s\n" "$hdrs" | grep -qi "Referrer-Policy" || { say "  Missing Referrer-Policy"; ok=false; }

header "Smoke: Manifest headers"
mhdr=$(curl -sSI "$BASE_URL/site.webmanifest" | tr -d '\r' || true)
printf "%s\n" "$mhdr" | grep -qi "Content-Type: application/manifest+json" || { say "  Manifest Content-Type invalid"; ok=false; }

header "Smoke: Asset headers"
# Try to extract CSS and JS from index.html
index_html=$(curl -s "$BASE_URL/" || true)
css_path=$(printf "%s" "$index_html" | grep -o '/assets/[^"]*\.css' | head -n1 || true)
js_path=$(printf "%s" "$index_html" | grep -o '/assets/[^"]*\.js' | head -n1 || true)
if [[ -n "$css_path" ]]; then
  say "  CSS: $css_path"
  curl -sSI "$BASE_URL$css_path" | tr -d '\r' | grep -E -i '^(HTTP/|Content-Type:|Cache-Control:|Content-Encoding:)' || true
else
  say "  WARN: CSS asset not found in HTML"; warn=true
fi
if [[ -n "$js_path" ]]; then
  say "  JS:  $js_path"
  curl -sSI "$BASE_URL$js_path" | tr -d '\r' | grep -E -i '^(HTTP/|Content-Type:|Cache-Control:)' || true
else
  say "  WARN: JS asset not found in HTML"; warn=true
fi

header "Smoke: JSON-LD Schema (@context)"
if printf "%s" "$index_html" | grep -q '"@context"\s*:\s*"https://schema.org"'; then
  say "  OK: @context present"
else
  say "  WARN: JSON-LD @context not found"; warn=true
fi

header "Smoke: reCAPTCHA badge CSS rule"
if [[ -n "$css_path" ]]; then
  css_body=$(curl -s "$BASE_URL$css_path" || true)
  if printf "%s" "$css_body" | grep -q "\.grecaptcha-badge"; then
    say "  OK: .grecaptcha-badge rule found"
  else
    say "  WARN: .grecaptcha-badge rule not found"; warn=true
  fi
fi

header "Smoke: k6 (30s)"
if bash "$(dirname "$0")/run_k6_smoke.sh" "$BASE_URL"; then
  say "  OK: k6 smoke passed"
else
  say "  WARN: k6 smoke failed"; $strict && ok=false || warn=true
fi

say
say "Summary:"
say "  status: $([[ "$ok" == true ]] && echo PASS || echo FAIL)"
say "  warnings: $([[ "$warn" == true ]] && echo yes || echo no)"

[[ "$ok" == true ]] || exit 1
exit 0

