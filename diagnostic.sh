#!/usr/bin/env bash
set -euo pipefail

# Diagnostic script that validates the deployment criteria for the Saraiva Vision site.
# It mirrors the verification steps described in the recovery prompt and emits PASS/FAIL
# results for each criterion. Customise behaviour via environment variables.

APP="${APP:-saraiva}"
BASE="${BASE:-/srv/$APP}"
RELEASES="${RELEASES:-$BASE/releases}"
DOMAIN="${DOMAIN:-saraivavision.com.br}"
API_PORT="${API_PORT:-8787}"
CURRENT_LINK="${CURRENT_LINK:-$BASE/current}"
SERVICE_USER="${SERVICE_USER:-www-data}" # currently unused but kept for parity
CURL_TIMEOUT="${CURL_TIMEOUT:-10}"
SKIP_API_CHECK="${SKIP_API_CHECK:-false}"

STATUS=0

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' not found" >&2
    exit 1
  fi
}

pass() {
  printf '[PASS] %s\n' "$1"
}

fail() {
  printf '[FAIL] %s\n' "$1"
  STATUS=1
}

warn() {
  printf '[WARN] %s\n' "$1"
}

lower() {
  printf '%s' "$1" | tr 'A-Z' 'a-z'
}

require_command curl
require_command sha256sum
require_command find
require_command readlink
require_command awk

CURRENT_RELEASE=""
if [ -L "$CURRENT_LINK" ]; then
  CURRENT_RELEASE="$(readlink -f "$CURRENT_LINK")"
elif [ -d "$CURRENT_LINK" ]; then
  CURRENT_RELEASE="$CURRENT_LINK"
fi

if [ -z "$CURRENT_RELEASE" ]; then
  fail "Current release not found at $CURRENT_LINK"
else
  pass "Resolved current release path: $CURRENT_RELEASE"
fi

# 1. Build integrity
if [ -n "$CURRENT_RELEASE" ] && [ -d "$CURRENT_RELEASE/dist" ]; then
  pass "dist/ directory present in current release"
else
  fail "dist/ directory missing in $CURRENT_RELEASE"
fi

# 2. Homepage HTTP check
if HEADERS=$(curl -sI -m "$CURL_TIMEOUT" "https://$DOMAIN" 2>/dev/null); then
  STATUS_LINE="$(printf '%s' "$HEADERS" | head -n 1)"
  CODE="$(printf '%s' "$STATUS_LINE" | awk '{print $2}')"
  if [[ "$STATUS_LINE" =~ ^HTTP/ ]] && [ "$CODE" = "200" ] && printf '%s' "$HEADERS" | grep -qi '^content-type: .*text/html'; then
    pass "Homepage reachable with HTTP $CODE and text/html content type"
  else
    fail "Homepage headers unexpected: $(printf '%s' "$STATUS_LINE")"
  fi
else
  fail "Unable to reach https://$DOMAIN"
fi

# 3. SPA fallback
if HEADERS=$(curl -sI -m "$CURL_TIMEOUT" "https://$DOMAIN/rota-aleatoria" 2>/dev/null); then
  STATUS_LINE="$(printf '%s' "$HEADERS" | head -n 1)"
  CODE="$(printf '%s' "$STATUS_LINE" | awk '{print $2}')"
  if [[ "$STATUS_LINE" =~ ^HTTP/ ]] && [ "$CODE" = "200" ]; then
    pass "SPA fallback served 200 for /rota-aleatoria"
  else
    fail "Unexpected status for SPA fallback: $(printf '%s' "$STATUS_LINE")"
  fi
else
  fail "Unable to reach https://$DOMAIN/rota-aleatoria"
fi

# 4. Asset consistency
if [ -n "$CURRENT_RELEASE" ]; then
  LOCAL_ASSET="$(find "$CURRENT_RELEASE/dist" -maxdepth 2 -type f -name 'app.*.js' | head -n 1 || true)"
  if [ -n "$LOCAL_ASSET" ]; then
    LOCAL_HASH="$(sha256sum "$LOCAL_ASSET" | awk '{print $1}')"
    RELATIVE_PATH="${LOCAL_ASSET#"$CURRENT_RELEASE/dist"}"
    RELATIVE_PATH="${RELATIVE_PATH#/}"
    REMOTE_URL="https://$DOMAIN/$RELATIVE_PATH"
    if REMOTE_CONTENT=$(curl -fsSL -m "$CURL_TIMEOUT" "$REMOTE_URL" 2>/dev/null); then
      REMOTE_HASH="$(printf '%s' "$REMOTE_CONTENT" | sha256sum | awk '{print $1}')"
      if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
        pass "Asset hash matches for $(basename "$LOCAL_ASSET")"
      else
        fail "Asset hash mismatch for $(basename "$LOCAL_ASSET")"
      fi
    else
      fail "Unable to download $REMOTE_URL for asset comparison"
    fi
  else
    fail "No app.*.js asset found under $CURRENT_RELEASE/dist"
  fi
else
  warn "Skipping asset check because current release is undefined"
fi

# 5. API health (optional)
if [ "$(lower "$SKIP_API_CHECK")" = "true" ]; then
  warn "Skipping API contact endpoint check (SKIP_API_CHECK=true)"
else
  if RESPONSE_FILE=$(mktemp); then
    HTTP_CODE=$(curl -s -o "$RESPONSE_FILE" -w '%{http_code}' -m "$CURL_TIMEOUT" -X POST "http://127.0.0.1:$API_PORT/api/contact" \
      -H 'Content-Type: application/json' \
      -d '{"email":"teste@exemplo.com","message":"ping"}' || true)
    if [[ "$HTTP_CODE" =~ ^2 ]]; then
      BODY="$(cat "$RESPONSE_FILE")"
      if printf '%s' "$BODY" | grep -Eq '"(ok|id)"'; then
        pass "API /api/contact responded with $HTTP_CODE"
      else
        warn "API /api/contact responded with $HTTP_CODE but body lacks ok/id"
      fi
    else
      warn "API /api/contact returned HTTP $HTTP_CODE"
    fi
    rm -f "$RESPONSE_FILE"
  else
    warn "Could not create temp file for API response"
  fi
fi

# 6. Log inspection
NGINX_LOG_STATUS=0
if command -v sudo >/dev/null 2>&1; then
  if NGINX_LOG=$(sudo journalctl -u nginx -n 100 --no-pager 2>/dev/null); then
    if printf '%s' "$NGINX_LOG" | grep -Eqi '5[0-9]{2}|permission denied'; then
      fail "Nginx logs contain 5xx or permission denied"
      NGINX_LOG_STATUS=1
    else
      pass "Nginx logs clean (last 100 lines)"
    fi
  else
    warn "Unable to read nginx journal (permission denied?)"
  fi
else
  warn "sudo not available; skipping nginx journal check"
fi

if command -v pm2 >/dev/null 2>&1; then
  if PM2_LOG=$(pm2 logs "$APP-api" --lines 50 2>&1 || true); then
    if printf '%s' "$PM2_LOG" | grep -Eqi 'error|permission denied|ECONN'; then
      warn "PM2 logs contain potential issues"
    else
      pass "PM2 logs clean (last 50 lines)"
    fi
  else
    warn "Unable to read PM2 logs"
  fi
else
  warn "pm2 command not found; skipping PM2 log check"
fi

# 7. Rollback readiness
RELEASE_COUNT=$(find "$RELEASES" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
if [ "${RELEASE_COUNT:-0}" -ge 2 ]; then
  pass "Rollback ready (releases count: $RELEASE_COUNT)"
else
  fail "Rollback not ready; found $RELEASE_COUNT release(s)"
fi

# 8. Release documentation
if [ -f "$BASE/last_release_commit" ] && [ -f "$BASE/last_release_note" ]; then
  pass "Release documentation files present"
else
  fail "Missing last_release_commit or last_release_note"
fi

exit $STATUS
