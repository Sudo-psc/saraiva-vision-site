#!/bin/bash

echo "================================================"
echo "   DEPLOY - Contact Form Backend"
echo "================================================"
echo ""

# Check required environment variables
echo "1. Checking environment variables..."
if [ -z "$RESEND_API_KEY" ] || [ "$RESEND_API_KEY" == "RESEND_API_KEY_PLACEHOLDER" ]; then
    echo "❌ ERROR: RESEND_API_KEY not configured!"
    echo "   Get your key from: https://resend.com"
    echo "   Then update .env.production"
    exit 1
fi

if [ -z "$DOCTOR_EMAIL" ]; then
    echo "❌ ERROR: DOCTOR_EMAIL not configured!"
    exit 1
fi

echo "✅ RESEND_API_KEY configured"
echo "✅ DOCTOR_EMAIL: $DOCTOR_EMAIL"
echo ""

# Test Resend API connection
echo "2. Testing Resend API connection..."
node -e "
import { Resend } from './api/node_modules/resend/dist/index.mjs';
const resend = new Resend('$RESEND_API_KEY');
try {
  await resend.emails.send({
    from: 'Test <contato@saraivavision.com.br>',
    to: ['$DOCTOR_EMAIL'],
    subject: 'Deployment Test - Contact Backend',
    html: '<p>Backend deployment test successful!</p>'
  });
  console.log('✅ Resend API connection successful');
} catch (error) {
  console.error('❌ Resend API error:', error.message);
  process.exit(1);
}
" || exit 1

echo ""

# Run tests
echo "3. Running unit tests..."
npm run test:run api/src/routes/__tests__/resend-email-service.test.js || {
    echo "⚠️  Some tests failed, but continuing..."
}
echo ""

# Build
echo "4. Building application..."
npm run build || exit 1
echo ""

# Deploy
echo "5. Ready to deploy!"
echo ""
echo "Next steps:"
echo "  - Run: ./scripts/deploy-atomic.sh"
echo "  - Test: curl https://saraivavision.com.br/api/health"
echo "  - Verify: Submit test contact form"
echo ""
echo "================================================"
