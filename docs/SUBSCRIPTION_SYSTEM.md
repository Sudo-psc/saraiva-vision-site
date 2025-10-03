# Subscription System Documentation

Complete subscription system for Saraiva Vision's Jovem profile with Stripe integration, LGPD compliance, and CFM medical compliance.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Configuration](#setup--configuration)
4. [API Routes](#api-routes)
5. [Frontend Components](#frontend-components)
6. [Payment Flow](#payment-flow)
7. [Email Notifications](#email-notifications)
8. [Security & Compliance](#security--compliance)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Features

- **Three Subscription Tiers**: Basic (R$ 49), Pro (R$ 79), Premium (R$ 99)
- **Stripe Integration**: Secure payment processing with Brazilian Real (BRL)
- **Subscription Management**: Upgrade, downgrade, cancel, reactivate
- **Email Notifications**: Automated emails via Resend API
- **LGPD Compliance**: Data minimization, consent management, SHA-256 hashing
- **CFM Compliance**: Medical disclaimers, professional oversight requirements
- **Webhook Handling**: Automated subscription lifecycle management

### Tech Stack

- **Payment**: Stripe SDK (`stripe`, `@stripe/stripe-js`)
- **Validation**: Zod schema validation
- **Email**: Resend API
- **Frontend**: Next.js 13+ App Router, TypeScript, Tailwind CSS
- **Security**: Rate limiting, CSRF protection, input validation

---

## Architecture

### File Structure

```
app/api/subscription/
├── plans/route.ts          # GET: List all plans
├── create/route.ts         # POST: Create subscription
├── manage/route.ts         # POST: Update/cancel, DELETE: Cancel immediately
├── webhook/route.ts        # POST: Stripe webhook handler
└── [id]/route.ts          # GET: Get subscription details

app/jovem/assinatura/
├── page.tsx               # Plans selection page
├── checkout/page.tsx      # Payment checkout
├── success/page.tsx       # Success confirmation
└── manage/page.tsx        # Subscription dashboard

components/subscription/
├── PlanCard.tsx           # Plan display card
├── CheckoutForm.tsx       # Payment form
└── SubscriptionStatus.tsx # Dashboard widget

lib/
├── stripe.ts              # Stripe utilities
└── emails/
    └── subscriptionEmails.ts  # Email templates

types/
└── subscription.ts        # TypeScript types
```

### Data Flow

```
User Selects Plan
    ↓
Checkout Form
    ↓
Client: Create Payment Method (Stripe.js)
    ↓
Server: POST /api/subscription/create
    ↓
Stripe: Create Customer & Subscription
    ↓
Webhook: subscription.created
    ↓
Email: Welcome Email
    ↓
Redirect: Success Page
```

---

## Setup & Configuration

### 1. Install Dependencies

Already installed:
- `stripe` - Server-side Stripe SDK
- `@stripe/stripe-js` - Client-side Stripe.js
- `resend` - Email API
- `zod` - Validation

### 2. Environment Variables

Add to `.env.local` (development) and `.env.production`:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Use sk_live_... in production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Use pk_live_... in production
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_PREMIUM=price_...

# Already configured
RESEND_API_KEY=re_...
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
```

### 3. Stripe Dashboard Setup

#### Create Products & Prices

1. Go to **Products** in Stripe Dashboard
2. Create three products:

**Basic Plan**
- Name: "Basic"
- Price: R$ 49.00 BRL
- Billing: Recurring monthly
- Copy Price ID → `STRIPE_PRICE_ID_BASIC`

**Pro Plan**
- Name: "Pro"
- Price: R$ 79.00 BRL
- Billing: Recurring monthly
- Copy Price ID → `STRIPE_PRICE_ID_PRO`

**Premium Plan**
- Name: "Premium"
- Price: R$ 99.00 BRL
- Billing: Recurring monthly
- Copy Price ID → `STRIPE_PRICE_ID_PREMIUM`

#### Configure Webhooks

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Add endpoint: `https://saraivavision.com.br/api/subscription/webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`
4. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode Setup

For development, use Stripe test mode:

- Use test API keys (`sk_test_...`, `pk_test_...`)
- Test cards: `4242 4242 4242 4242` (success), `4000 0000 0000 9995` (declined)
- Webhook testing: Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/subscription/webhook`)

---

## API Routes

### GET /api/subscription/plans

List all available subscription plans.

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": "basic",
      "name": "Basic",
      "description": "1 par de lentes por mês",
      "price": 4900,
      "priceFormatted": "R$ 49",
      "features": ["..."],
      "recommended": false
    }
  ]
}
```

### POST /api/subscription/create

Create new subscription.

**Request**:
```json
{
  "planId": "basic",
  "email": "user@example.com",
  "name": "Nome Completo",
  "paymentMethodId": "pm_...",
  "consentTerms": true,
  "consentPrivacy": true,
  "consentMarketing": false
}
```

**Validation**:
- Email: Valid email format
- Name: Minimum 3 characters
- Plan ID: Must be `basic`, `pro`, or `premium`
- Consent: `consentTerms` and `consentPrivacy` must be `true`

**Rate Limiting**: 5 requests per 15 minutes per IP

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_...",
    "status": "active",
    "customerId": "cus_...",
    "clientSecret": "pi_..._secret_..." // For 3D Secure
  },
  "message": "Assinatura criada com sucesso!"
}
```

### POST /api/subscription/manage

Update or cancel subscription.

**Plan Change**:
```json
{
  "subscriptionId": "sub_...",
  "planId": "pro"
}
```

**Schedule Cancellation**:
```json
{
  "subscriptionId": "sub_...",
  "cancelAtPeriodEnd": true,
  "cancelReason": "Optional reason"
}
```

**Reactivate**:
```json
{
  "subscriptionId": "sub_...",
  "cancelAtPeriodEnd": false
}
```

### DELETE /api/subscription/manage

Cancel subscription immediately.

**Query Parameters**:
- `subscriptionId`: Subscription ID

### GET /api/subscription/[id]

Get subscription details.

**Response**:
```json
{
  "success": true,
  "subscription": {
    "id": "sub_...",
    "status": "active",
    "customerId": "cus_...",
    "currentPeriodStart": "2025-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2025-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "items": [...]
  }
}
```

### POST /api/subscription/webhook

Stripe webhook endpoint (internal use only).

**Required Header**: `stripe-signature`

**Events Handled**:
- `customer.subscription.created` → Send welcome email
- `customer.subscription.updated` → Update status
- `customer.subscription.deleted` → Send cancellation email
- `invoice.payment_succeeded` → Send receipt
- `invoice.payment_failed` → Send payment failure notice
- `customer.subscription.trial_will_end` → Send reminder

---

## Frontend Components

### PlanCard

Display subscription plan with features.

```tsx
import { PlanCard } from '@/components/subscription/PlanCard';

<PlanCard
  plan={plan}
  onSelect={(planId) => console.log('Selected:', planId)}
  selected={selectedPlan === plan.id}
  loading={false}
/>
```

### CheckoutForm

Payment form with Stripe integration.

```tsx
import { CheckoutForm } from '@/components/subscription/CheckoutForm';

<CheckoutForm
  planId="basic"
  onSuccess={(subscriptionId) => router.push(`/success?subscription=${subscriptionId}`)}
  onCancel={() => router.push('/plans')}
/>
```

### SubscriptionStatus

Subscription management dashboard.

```tsx
import { SubscriptionStatus } from '@/components/subscription/SubscriptionStatus';

<SubscriptionStatus subscriptionId="sub_..." />
```

---

## Payment Flow

### 1. Plan Selection

User visits `/jovem/assinatura` and selects a plan.

### 2. Checkout

User redirected to `/jovem/assinatura/checkout?plan=basic`:
- Form fields: Name, Email
- Payment method: Stripe Elements (card input)
- Consent checkboxes: Terms, Privacy, Medical Disclaimer
- Optional: Marketing consent

### 3. Payment Processing

1. Client: Collect payment method via Stripe.js
2. Client: POST to `/api/subscription/create`
3. Server: Validate input (Zod)
4. Server: Create Stripe customer
5. Server: Attach payment method
6. Server: Create subscription
7. Server: Return subscription details + client secret (if 3D Secure required)

### 4. 3D Secure (if required)

```javascript
const stripe = await stripePromise;
const { error } = await stripe.confirmCardPayment(clientSecret);
if (error) {
  // Handle error
}
```

### 5. Success

Redirect to `/jovem/assinatura/success?subscription=sub_...`:
- Display confirmation
- Show next steps
- Send welcome email (webhook)

### 6. Subscription Management

User can access `/jovem/assinatura/manage?subscription=sub_...` to:
- View subscription status
- Change plan
- Cancel or reactivate
- Update payment method

---

## Email Notifications

All emails sent via Resend API with HTML templates.

### Welcome Email

**Trigger**: `customer.subscription.created` webhook
**Function**: `sendWelcomeEmail(email, name, planName)`
**Content**:
- Welcome message
- Next steps (send prescription, wait for confirmation, receive lenses)
- Medical disclaimer reminder

### Payment Receipt

**Trigger**: `invoice.payment_succeeded` webhook
**Function**: `sendPaymentReceipt(email, name, amount, invoiceUrl?)`
**Content**:
- Payment confirmation
- Amount paid
- Invoice link (optional)

### Payment Failed

**Trigger**: `invoice.payment_failed` webhook
**Function**: `sendPaymentFailedEmail(email, name, reason?)`
**Content**:
- Payment failure notice
- Troubleshooting steps
- Update payment method link

### Cancellation Confirmation

**Trigger**: Manual cancellation
**Function**: `sendCancellationEmail(email, name, endDate)`
**Content**:
- Cancellation confirmation
- End date
- Feedback request

---

## Security & Compliance

### LGPD Compliance

**Data Minimization**:
- Only collect essential data: email, name (required for billing)
- No storage of credit card details (handled by Stripe)

**Consent Management**:
- Explicit checkboxes for terms and privacy policy
- Optional marketing consent
- Timestamp and IP logged for audit

**Data Hashing**:
- User IDs hashed with SHA-256 for privacy
- Function: `hashUserId(userId)`

**User Rights**:
- Cancel subscription anytime
- Request data deletion (contact support)

### CFM Compliance

**Medical Disclaimer**:
- Required acknowledgment during checkout
- Emphasizes professional oversight
- States service does not replace medical consultations
- Recommends annual eye exams

**Disclaimer Text**: See `MEDICAL_DISCLAIMER_TEXT` in `types/subscription.ts`

### Payment Security

**PCI DSS Compliance**:
- No card details stored on server
- Stripe handles all card data (PCI Level 1 certified)
- Tokenization via Stripe Elements

**HTTPS Only**:
- All payment endpoints require HTTPS in production
- Secure cookie settings

**CSRF Protection**:
- Built-in Next.js CSRF protection
- SameSite cookie policy

**Rate Limiting**:
- 5 requests per 15 minutes for subscription creation
- Prevents abuse and DDoS

**Input Validation**:
- Zod schema validation on all endpoints
- Email format validation
- Plan ID whitelist

**Webhook Verification**:
- Stripe signature validation
- Prevents webhook spoofing

---

## Testing

### Unit Tests

Run subscription tests:

```bash
npm run test:vitest -- tests/subscription
```

### Manual Testing

#### Test Mode (Development)

1. Use test Stripe keys
2. Test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 9995`
   - 3D Secure: `4000 0027 6000 3184`

3. Test flow:
```bash
# Start dev server
npm run dev

# Visit
http://localhost:3000/jovem/assinatura

# Select plan → Checkout → Use test card → Success
```

#### Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/subscription/webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

### E2E Tests

Add Playwright tests:

```bash
npm run test:e2e
```

---

## Deployment

### Production Checklist

- [ ] Update environment variables to production Stripe keys
- [ ] Create production products and prices in Stripe
- [ ] Configure production webhook endpoint
- [ ] Test with real payment method (small amount)
- [ ] Verify email delivery (Resend)
- [ ] Enable HTTPS
- [ ] Review LGPD consent flow
- [ ] Verify CFM medical disclaimer display
- [ ] Load testing for rate limiting
- [ ] Monitor logs for errors

### Environment Variables (Production)

```bash
# Stripe Production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_live_...
STRIPE_PRICE_ID_PRO=price_live_...
STRIPE_PRICE_ID_PREMIUM=price_live_...

# Email
RESEND_API_KEY=re_...

# Site
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
NODE_ENV=production
```

### Deploy Command

```bash
npm run build
npm run deploy
```

### Webhook Endpoint

Update in Stripe Dashboard:
```
https://saraivavision.com.br/api/subscription/webhook
```

---

## Troubleshooting

### Payment Fails

**Symptoms**: User cannot complete payment

**Solutions**:
1. Check Stripe API keys are correct
2. Verify price IDs match Stripe dashboard
3. Check card details (test mode: use test cards)
4. Review browser console for Stripe.js errors
5. Check server logs for API errors

### Webhook Not Receiving Events

**Symptoms**: No emails sent, subscription status not updating

**Solutions**:
1. Verify webhook endpoint URL in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` is correct
3. Review webhook logs in Stripe Dashboard
4. Test locally with Stripe CLI
5. Ensure endpoint is publicly accessible (HTTPS)

### Email Not Sent

**Symptoms**: User doesn't receive emails

**Solutions**:
1. Check `RESEND_API_KEY` is valid
2. Verify `CONTACT_EMAIL_FROM` domain is verified in Resend
3. Check spam folder
4. Review Resend logs
5. Test with `sendWelcomeEmail()` directly

### Rate Limiting Triggered

**Symptoms**: 429 error on subscription creation

**Solutions**:
1. Wait 15 minutes
2. Clear rate limit cache (restart server in dev)
3. Adjust rate limit settings if needed
4. Consider IP-based exemptions for trusted sources

### LGPD Compliance Issues

**Symptoms**: Consent not recorded, privacy concerns

**Solutions**:
1. Verify all consent checkboxes are required
2. Check SHA-256 hashing is working (`hashUserId`)
3. Review consent logging in webhook handlers
4. Ensure data minimization (no unnecessary fields)

### CFM Compliance Issues

**Symptoms**: Medical disclaimer not displayed

**Solutions**:
1. Verify `MEDICAL_DISCLAIMER_TEXT` is shown in checkout
2. Check disclaimer acknowledgment is required
3. Ensure disclaimer is logged with consent

---

## API Reference

### Stripe Utilities (`lib/stripe.ts`)

#### `getOrCreateCustomer(email, name)`
Create or retrieve Stripe customer.

#### `createStripeSubscription(customerId, priceId, paymentMethodId)`
Create subscription with payment method.

#### `updateStripeSubscription(subscriptionId, updates)`
Update subscription (plan change, cancellation schedule).

#### `cancelStripeSubscription(subscriptionId)`
Cancel subscription immediately.

#### `getStripeSubscription(subscriptionId)`
Retrieve subscription details.

#### `verifyWebhookSignature(payload, signature)`
Verify Stripe webhook signature.

#### `formatBRL(amountInCents)`
Format cents to Brazilian Real string.

#### `hashUserId(userId)`
Hash user ID with SHA-256 for LGPD compliance.

### Email Functions (`lib/emails/subscriptionEmails.ts`)

#### `sendWelcomeEmail(email, name, planName)`
Send welcome email after subscription creation.

#### `sendPaymentReceipt(email, name, amount, invoiceUrl?)`
Send payment confirmation with receipt.

#### `sendPaymentFailedEmail(email, name, reason?)`
Send payment failure notification.

#### `sendCancellationEmail(email, name, endDate)`
Send cancellation confirmation.

---

## Support

For issues or questions:
- **Email**: suporte@saraivavision.com.br
- **Documentation**: `/docs/SUBSCRIPTION_SYSTEM.md`
- **GitHub**: [Issues](https://github.com/Sudo-psc/saraivavision-site-v2/issues)

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0
**Author**: Saraiva Vision Development Team
