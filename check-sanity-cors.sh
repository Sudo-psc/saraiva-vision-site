#!/bin/bash
echo "================================================================"
echo "  SANITY STUDIO CORS DIAGNOSTIC REPORT"
echo "================================================================"
echo ""
echo "📅 Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

echo "---[ 1. PROJECT INFO ]---"
cd /home/saraiva-vision-site/sanity
echo "Project ID: $(grep projectId sanity.config.js | cut -d"'" -f2)"
echo "Dataset: $(grep dataset sanity.config.js | head -1 | cut -d"'" -f2)"
echo "Workspace: $(grep "name:" sanity.config.js | head -1 | cut -d"'" -f2)"
echo ""

echo "---[ 2. CORS ORIGINS CONFIGURED ]---"
npx sanity cors list 2>&1
echo ""

echo "---[ 3. DNS RESOLUTION ]---"
DIG_OUTPUT=$(dig studio.saraivavision.com.br +short | tail -1)
if [ -n "$DIG_OUTPUT" ]; then
    echo "✅ studio.saraivavision.com.br → $DIG_OUTPUT"
else
    echo "❌ DNS não resolveu"
fi
echo ""

echo "---[ 4. SSL CERTIFICATE ]---"
SSL_DATES=$(echo | openssl s_client -servername studio.saraivavision.com.br -connect studio.saraivavision.com.br:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
if [ -n "$SSL_DATES" ]; then
    echo "$SSL_DATES" | sed 's/^/  /'
    echo "✅ SSL válido"
else
    echo "❌ SSL não encontrado"
fi
echo ""

echo "---[ 5. NGINX CORS HEADERS CHECK ]---"
NGINX_CORS=$(grep -i "access-control" /etc/nginx/sites-available/sanity-studio 2>/dev/null)
if [ -z "$NGINX_CORS" ]; then
    echo "✅ Nginx NÃO adiciona headers CORS (correto)"
else
    echo "⚠️  Nginx adiciona headers CORS (pode causar conflito):"
    echo "$NGINX_CORS" | sed 's/^/  /'
fi
echo ""

echo "---[ 6. CORS PREFLIGHT TEST ]---"
PREFLIGHT=$(curl -s -i -X OPTIONS \
  -H "Origin: https://studio.saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET" \
  "https://92ocrdmp.api.sanity.io/v2021-06-07/users/me" 2>&1)

ALLOW_ORIGIN=$(echo "$PREFLIGHT" | grep -i "access-control-allow-origin" | head -1)
ALLOW_CREDS=$(echo "$PREFLIGHT" | grep -i "access-control-allow-credentials" | head -1)
VARY=$(echo "$PREFLIGHT" | grep -i "vary.*origin" | head -1)

if [ -n "$ALLOW_ORIGIN" ]; then
    echo "✅ Access-Control-Allow-Origin: $(echo $ALLOW_ORIGIN | cut -d: -f2- | xargs)"
else
    echo "❌ Access-Control-Allow-Origin: NOT FOUND"
fi

if [ -n "$ALLOW_CREDS" ]; then
    echo "✅ Access-Control-Allow-Credentials: $(echo $ALLOW_CREDS | cut -d: -f2- | xargs)"
else
    echo "❌ Access-Control-Allow-Credentials: NOT FOUND"
fi

if [ -n "$VARY" ]; then
    echo "✅ Vary: $(echo $VARY | cut -d: -f2- | xargs)"
else
    echo "⚠️  Vary: NOT FOUND (pode causar cache incorreto)"
fi
echo ""

echo "---[ 7. STUDIO BUILD STATUS ]---"
if [ -f "sanity/dist/index.html" ]; then
    BUILD_SIZE=$(du -sh sanity/dist 2>/dev/null | cut -f1)
    JS_FILE=$(ls -1 sanity/dist/static/sanity-*.js 2>/dev/null | head -1 | xargs basename)
    echo "✅ Build exists: $BUILD_SIZE"
    echo "   Main bundle: $JS_FILE"
else
    echo "❌ Build NOT FOUND (run: npm run build)"
fi
echo ""

echo "---[ 8. STUDIO URL TEST ]---"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://studio.saraivavision.com.br)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ https://studio.saraivavision.com.br → HTTP $HTTP_STATUS"
else
    echo "❌ https://studio.saraivavision.com.br → HTTP $HTTP_STATUS"
fi
echo ""

echo "---[ 9. SANITY API CONNECTIVITY ]---"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://92ocrdmp.api.sanity.io/v2021-06-07/data/doc/production" 2>/dev/null)
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "401" ]; then
    echo "✅ Sanity API reachable → HTTP $API_STATUS"
else
    echo "❌ Sanity API unreachable → HTTP $API_STATUS"
fi
echo ""

echo "================================================================"
echo "  SUMMARY"
echo "================================================================"
echo ""

ALL_OK=true

# Check critical items
if [ -z "$ALLOW_ORIGIN" ]; then
    echo "❌ CRITICAL: CORS not configured properly"
    ALL_OK=false
fi

if [ -z "$ALLOW_CREDS" ]; then
    echo "❌ CRITICAL: Credentials not allowed"
    ALL_OK=false
fi

if [ "$HTTP_STATUS" != "200" ]; then
    echo "❌ CRITICAL: Studio URL not accessible"
    ALL_OK=false
fi

if [ ! -f "sanity/dist/index.html" ]; then
    echo "❌ CRITICAL: Build missing"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo ""
    echo "Next steps:"
    echo "1. Clear browser cache (Ctrl+Shift+Del)"
    echo "2. Open: https://studio.saraivavision.com.br"
    echo "3. Check DevTools Console for errors"
    echo "4. Test login flow"
else
    echo "⚠️  ISSUES FOUND - Review errors above"
fi

echo ""
echo "================================================================"
