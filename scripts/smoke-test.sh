#!/usr/bin/env bash
set -Eeuo pipefail

URL="${1:-http://localhost}"

echo "🔎 Running smoke tests against: $URL"

# 1) Home page should return 200 and include clinic name snippets
code=$(curl -fsS -o /dev/null -w "%{http_code}" "$URL/")
if [[ "$code" != "200" ]]; then
  echo "❌ Unexpected status for / : $code"; exit 1
fi
html=$(curl -fsS "$URL/")
echo "$html" | grep -qiE "Saraiva|Philipe|Clínica" || {
  echo "❌ Home does not contain expected clinic text"; exit 1;
}

# 2) Check a static asset exists (favicon for caching/routing sanity)
curl -fsS "$URL/favicon-32x32.png" > /dev/null || {
  echo "❌ Missing favicon-32x32.png"; exit 1;
}

# 3) Optional: API health (ignore failures if API is not present)
if curl -fsS "$URL/api/health" > /dev/null 2>&1; then
  echo "✅ API /health is reachable"
else
  echo "ℹ️ API /health not reachable (skipping)"
fi

echo "✅ Smoke tests passed"

