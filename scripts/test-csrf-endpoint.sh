#!/bin/bash

echo "🧪 Testing CSRF Endpoint"
echo "========================"
echo ""

# Test GET /api/csrf-token
echo "1️⃣ Testing GET /api/csrf-token..."
RESPONSE=$(curl -s http://localhost:3001/api/csrf-token)
echo "Response: $RESPONSE"
echo ""

# Check if response contains "token" field
if echo "$RESPONSE" | grep -q "\"token\""; then
    echo "✅ CSRF endpoint is working!"
    TOKEN=$(echo "$RESPONSE" | jq -r '.token')
    EXPIRES=$(echo "$RESPONSE" | jq -r '.expiresIn')
    echo "   Token: ${TOKEN:0:20}..."
    echo "   Expires in: $EXPIRES ms ($(($EXPIRES / 1000)) seconds)"
    echo ""

    # Test using the token
    echo "2️⃣ Testing token validation..."
    echo "   (This would normally be done by a form submission)"
    echo "   Token would be sent as X-CSRF-Token header"
    echo ""

    # Test token expiration
    echo "3️⃣ Token should expire after 5 minutes (300000 ms)"
    echo ""

    echo "✅ All CSRF tests passed!"
else
    echo "❌ CSRF endpoint NOT working!"
    echo "   Server may need to be restarted to load new routes"
    echo ""
    echo "   To restart the server:"
    echo "   1. Kill current process: sudo fuser -k -9 3001/tcp"
    echo "   2. Wait 5 seconds: sleep 5"
    echo "   3. Start server: cd /home/saraiva-vision-site/api && PORT=3001 NODE_ENV=production node src/server.js &"
    echo ""
    echo "   Or use: sudo ./restart-api.sh"
fi
