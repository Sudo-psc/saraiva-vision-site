# Subscription System - Quick Start Guide

Fast setup guide for Saraiva Vision subscription system.

## Prerequisites

- Stripe account (Brazil-enabled)
- Resend API key
- Node.js 22+

## 1. Stripe Setup (5 minutes)

### Create Account
1. Go to [stripe.com](https://stripe.com)
2. Create account → Enable Brazil (BRL)

### Create Products
Dashboard → Products → Add Product (create 3):

```
Basic Plan
- Price: R$ 49.00 BRL
- Recurring: Monthly
→ Copy Price ID

Pro Plan
- Price: R$ 79.00 BRL
- Recurring: Monthly
→ Copy Price ID

Premium Plan
- Price: R$ 99.00 BRL
- Recurring: Monthly
→ Copy Price ID
```

### Get API Keys
Dashboard → Developers → API keys:
- Copy "Publishable key" (pk_test_...)
- Copy "Secret key" (sk_test_...)

### Setup Webhook
Dashboard → Developers → Webhooks → Add endpoint:
```
URL: https://saraivavision.com.br/api/subscription/webhook
Events: Select all subscription & invoice events
→ Copy Webhook Secret (whsec_...)
```

## 2. Environment Variables

Add to `.env.local`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

# Email (already configured)
RESEND_API_KEY=re_...
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br

# Site (already configured)
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
```

## 3. Install & Test

```bash
# Already installed
npm install stripe @stripe/stripe-js

# Start dev server
npm run dev

# Visit
http://localhost:3000/jovem/assinatura
```

## 4. Test Payment

Use test card:
```
Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

## 5. Test Webhooks (Local)

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/subscription/webhook

# In another terminal, trigger test
stripe trigger customer.subscription.created
```

## 6. Production Deployment

### Update Environment
Replace test keys with live keys:
```bash
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)
STRIPE_PRICE_ID_BASIC=price_live_...
STRIPE_PRICE_ID_PRO=price_live_...
STRIPE_PRICE_ID_PREMIUM=price_live_...
```

### Update Webhook URL
In Stripe Dashboard, update webhook endpoint:
```
https://saraivavision.com.br/api/subscription/webhook
```

### Deploy
```bash
npm run build
npm run deploy
```

## Routes

```
/jovem/assinatura          → Plans selection
/jovem/assinatura/checkout → Payment
/jovem/assinatura/success  → Confirmation
/jovem/assinatura/manage   → Dashboard
```

## API Endpoints

```
GET  /api/subscription/plans       → List plans
POST /api/subscription/create      → Create subscription
POST /api/subscription/manage      → Update/cancel
GET  /api/subscription/[id]        → Get details
POST /api/subscription/webhook     → Stripe events
```

## Testing

```bash
# Unit tests
npm run test:vitest -- tests/subscription

# E2E tests
npm run test:e2e

# Manual test
1. Visit /jovem/assinatura
2. Select Basic plan
3. Click "Continuar para Checkout"
4. Fill form with test card
5. Submit → Should redirect to success page
```

## Troubleshooting

**Payment fails**: Check Stripe API keys match (test/live)
**Webhook not working**: Verify webhook secret and URL
**Email not sent**: Check Resend API key

## Support

Full documentation: `/docs/SUBSCRIPTION_SYSTEM.md`
Issues: GitHub Issues
Email: suporte@saraivavision.com.br

---

**Setup Time**: ~10 minutes
**Status**: Ready for production
