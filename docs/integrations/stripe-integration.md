# Stripe Integration - Technical Reference

## Overview

Saraiva Vision uses Stripe for payment processing and subscription management, specifically for the **Planos Presenciais Flex** feature (no-commitment monthly subscriptions).

**Integration Type**: Embedded Pricing Table + Webhooks
**Environment**: Production (Live Mode)
**PCI Compliance**: Level 1 (handled by Stripe)

## Stripe Configuration

### API Keys

**Publishable Key** (Frontend):
```
pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH
```

**Secret Key** (Backend):
- Stored in environment variables (not in code)
- Location: Backend API environment configuration
- Used for: Webhook signature verification, API calls

### Pricing Table

**Pricing Table ID**:
```
prctbl_1SLTeeLs8MC0aCdjujaEGM3N
```

**Where Used**: `/planosflex` page (PlanosFlexPage.jsx)

**Configuration**:
- Plans included: Flex plans (monthly, no commitment)
- Payment methods: Card, PIX, Boleto
- Locale: Portuguese (Brazil)
- Currency: BRL (R$)

## Frontend Integration

### Component Implementation

**File**: `src/modules/payments/pages/PlanosFlexPage.jsx`

```javascript
import React, { useEffect } from 'react';

const PlanosFlexPage = () => {
  useEffect(() => {
    // Dynamically load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <stripe-pricing-table
      pricing-table-id="prctbl_1SLTeeLs8MC0aCdjujaEGM3N"
      publishable-key="pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH"
    />
  );
};
```

### CSP Configuration

**File**: `/etc/nginx/sites-enabled/saraivavision`

**Required Directives**:
```nginx
Content-Security-Policy-Report-Only:
  script-src 'self' https://js.stripe.com;
  frame-src 'self' https://js.stripe.com;
  connect-src 'self' https://api.stripe.com;
```

**Status**: Already configured (line ~339 in Nginx config)

## Backend Integration

### Webhook Configuration

**Webhook Endpoint**: `https://saraivavision.com.br/api/webhooks/stripe`

**Webhook Secret**:
- Stored in environment variable `STRIPE_WEBHOOK_SECRET`
- Used for signature verification
- Generated in Stripe Dashboard

**Events to Handle**:

| Event | Description | Handler |
|-------|-------------|---------|
| `customer.subscription.created` | New subscription started | Activate user access, send welcome email |
| `customer.subscription.updated` | Subscription modified | Update user access, sync changes |
| `customer.subscription.deleted` | Subscription cancelled | Revoke access, send cancellation confirmation |
| `invoice.payment_succeeded` | Monthly payment successful | Extend access, send receipt |
| `invoice.payment_failed` | Payment failed | Notify user, trigger dunning process |
| `customer.created` | New customer in Stripe | Create internal customer record |
| `checkout.session.completed` | Checkout completed | Link subscription to user account |

### Webhook Handler Structure

**Location**: `api/src/webhooks/stripe-webhook.js` (example structure)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Verify webhook signature
const verifyWebhook = (req) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  return stripe.webhooks.constructEvent(
    req.body,
    sig,
    webhookSecret
  );
};

// Handle webhook events
const handleStripeWebhook = async (req, res) => {
  try {
    const event = verifyWebhook(req);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      // ... other event handlers
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
```

### Security Best Practices

1. **Always Verify Signatures**: Never trust webhook data without signature verification
2. **Use HTTPS**: Webhook endpoint must use HTTPS in production
3. **Idempotency**: Handle duplicate webhook deliveries gracefully
4. **Error Handling**: Return 200 for successfully processed webhooks, even if business logic fails
5. **Logging**: Log all webhook events for debugging and audit trail

## Payment Flow

### User Journey

1. **Page Load**: User visits `/planosflex`
2. **Pricing Table Renders**: Stripe script loads pricing table dynamically
3. **Plan Selection**: User clicks "Subscribe" button on desired plan
4. **Checkout Redirect**: Stripe redirects to hosted checkout page
5. **Payment Entry**: User enters payment details (card, PIX, or boleto)
6. **Payment Processing**: Stripe processes payment securely
7. **Webhook Triggered**: Stripe sends `checkout.session.completed` webhook
8. **Subscription Activated**: Backend webhook handler activates subscription
9. **Welcome Email**: User receives confirmation email
10. **Customer Portal**: User can manage subscription via Stripe Customer Portal

### Technical Flow

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ├─ Load /planosflex
         │
         ▼
┌─────────────────────┐
│ Saraiva Vision Site │
│  (Vite/React)       │
└────────┬────────────┘
         │
         ├─ Load Stripe Pricing Table Script
         │  (https://js.stripe.com/v3/pricing-table.js)
         │
         ▼
┌─────────────────┐
│  Stripe Hosted  │
│  Pricing Table  │
└────────┬────────┘
         │
         ├─ User clicks "Subscribe"
         │
         ▼
┌─────────────────┐
│ Stripe Checkout │
│  (Hosted Page)  │
└────────┬────────┘
         │
         ├─ User completes payment
         │
         ▼
┌─────────────────────┐
│   Stripe Backend    │
│ (Payment Processing)│
└────────┬────────────┘
         │
         ├─ Payment successful
         │
         ├─ Send webhook to backend
         │
         ▼
┌──────────────────────────┐
│  Saraiva Vision Backend  │
│   (Express API)          │
│  /api/webhooks/stripe    │
└────────┬─────────────────┘
         │
         ├─ Verify webhook signature
         │
         ├─ Process event
         │
         ├─ Activate subscription
         │
         ├─ Send welcome email
         │
         ▼
┌─────────────────┐
│  User Email     │
│  Confirmation   │
└─────────────────┘
```

## Subscription Management

### Customer Portal

**URL**: Managed by Stripe (auto-generated links)

**Features Available to Customers**:
- View subscription details
- Update payment method
- Download invoices
- Cancel subscription (immediate or end of period)
- View payment history

**Integration**:
- Link generated via Stripe API
- Can be embedded in user dashboard
- Requires customer ID from webhook data

### Subscription Lifecycle

**States**:
1. **Active**: Subscription active, customer has access
2. **Past Due**: Payment failed, in dunning process
3. **Unpaid**: Multiple payment failures, customer has limited time to pay
4. **Cancelled**: Customer cancelled, access ends at period end
5. **Incomplete**: Checkout started but not completed
6. **Incomplete Expired**: Checkout abandoned, subscription expired

**Handling Each State**:
- **Active**: Normal operation, full access
- **Past Due**: Retry payments automatically (Stripe Smart Retries), notify customer
- **Unpaid**: Final notice to customer, grace period before access revocation
- **Cancelled**: Maintain access until period end, then revoke
- **Incomplete**: Send reminder email with checkout link
- **Incomplete Expired**: Clean up orphaned records

## Testing

### Test Mode

**Test Publishable Key**:
```
pk_test_51OJdAcLs8MC0aCdj... (get from Stripe Dashboard)
```

**Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Test Mode Features**:
- No real money processed
- Webhooks work identically to live mode
- Separate dashboard for test transactions
- Clock can be advanced to test billing cycles

### Testing Checklist

- [ ] Create test subscription in test mode
- [ ] Verify webhook receives `customer.subscription.created`
- [ ] Verify customer can access subscription in portal
- [ ] Test payment failure scenario (use decline card)
- [ ] Verify dunning emails sent on failed payment
- [ ] Test cancellation flow
- [ ] Verify webhook receives `customer.subscription.deleted`
- [ ] Test checkout abandonment scenario

## Monitoring & Analytics

### Stripe Dashboard

**Key Metrics to Monitor**:
- Monthly Recurring Revenue (MRR)
- Active subscriptions count
- Churn rate
- Failed payment rate
- Customer Lifetime Value (LTV)

**Access**: https://dashboard.stripe.com

### Error Monitoring

**Webhook Failures**:
- Check Stripe Dashboard > Developers > Webhooks
- View failed attempts and retry history
- Manually retry failed webhooks if needed

**Payment Failures**:
- Check Stripe Dashboard > Payments
- Filter by "Failed" status
- Review decline codes and reasons

### Logging

**Frontend**:
- Log Stripe script load errors to console
- Track pricing table render errors
- Monitor CSP violations in browser console

**Backend**:
- Log all webhook events (level: INFO)
- Log webhook signature verification failures (level: ERROR)
- Log payment processing errors (level: ERROR)
- Store webhook raw data for debugging

## Troubleshooting

### Issue: Pricing Table Not Rendering

**Symptoms**: Blank space on page where table should appear

**Diagnosis**:
1. Check browser console for CSP violations
2. Check network tab for Stripe script load
3. Verify pricing table ID is correct

**Solution**:
```bash
# Verify CSP allows Stripe domains
curl -I https://saraivavision.com.br/planosflex | grep -i content-security

# Test script load manually
curl https://js.stripe.com/v3/pricing-table.js

# Verify pricing table ID in component
grep -r "prctbl_1SLTeeLs8MC0aCdjujaEGM3N" src/
```

### Issue: Webhook Not Received

**Symptoms**: Subscription created but not activated in system

**Diagnosis**:
1. Check Stripe Dashboard > Webhooks for delivery status
2. Check API logs for webhook requests
3. Verify webhook endpoint is accessible

**Solution**:
```bash
# Check API service is running
sudo systemctl status saraiva-api

# Check webhook endpoint is accessible
curl -X POST https://saraivavision.com.br/api/webhooks/stripe

# Check API logs for webhook errors
sudo journalctl -u saraiva-api -n 100 | grep webhook
```

### Issue: Payment Fails Silently

**Symptoms**: Customer reports payment not working, no error shown

**Diagnosis**:
1. Check Stripe Dashboard for attempted payment
2. Review decline code in payment details
3. Check customer's payment method

**Solution**:
- Most declines are due to card issues (insufficient funds, expired card)
- Advise customer to try different payment method
- Check Stripe Dashboard for specific decline reason
- Verify payment methods enabled in Stripe settings (card, PIX, boleto)

## References

### Stripe Documentation

- **Pricing Table**: https://stripe.com/docs/payments/checkout/pricing-table
- **Webhooks**: https://stripe.com/docs/webhooks
- **Subscriptions**: https://stripe.com/docs/billing/subscriptions/overview
- **Testing**: https://stripe.com/docs/testing

### Internal Documentation

- **Feature Documentation**: `/home/saraiva-vision-site/docs/features/planos-flex.md`
- **Webhook Guide**: `/home/saraiva-vision-site/docs/Webhooks-API-Guide.md`
- **Project Documentation**: `/home/saraiva-vision-site/CLAUDE.md`

### Support

- **Stripe Support**: https://support.stripe.com
- **Stripe Status**: https://status.stripe.com
- **API Reference**: https://stripe.com/docs/api

---

**Last Updated**: 2025-10-23
**Integration Owner**: Dr. Philipe Saraiva Cruz
**Stripe Account**: production (saraivavision.com.br)
