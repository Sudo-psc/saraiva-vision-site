# Planos Presenciais Flex - Feature Documentation

## Overview

**Feature Name**: Planos Presenciais Flex - Sem Fidelidade
**Status**: ✅ Production (Deployed 2025-10-23)
**Route**: `/planosflex`
**Component**: `src/modules/payments/pages/PlanosFlexPage.jsx`

## Purpose

Provide flexible, no-commitment subscription plans for presential contact lens service in Caratinga/MG. This feature targets customers who want the convenience of subscription plans without the 12-month commitment required by annual plans.

## Target Audience

- **Primary**: Existing and new patients in Caratinga/MG and surrounding region
- **Demographics**: Contact lens users who value flexibility
- **Pain Point**: Customers who want subscription convenience but are hesitant about annual commitment
- **Preference**: Presential medical care at the clinic

## Business Value

- **Revenue Stream**: Recurring monthly revenue via Stripe subscriptions
- **Customer Acquisition**: Lower barrier to entry compared to annual plans
- **Retention**: Flexible plans may convert to annual plans after customer trust is established
- **Market Differentiation**: "No commitment" positioning differentiates from competitors

## Technical Implementation

### Frontend Architecture

**Component Location**: `src/modules/payments/pages/PlanosFlexPage.jsx`

**Key Technologies**:
- React 18 with functional components
- React Router v6 for navigation
- Lucide React for icons
- SEO optimization via SEOHead component
- Lazy loading via `createLazyComponent()` utility

**Design System**:
- **Primary Color**: Green gradient (indicates flexibility)
- **Layout**: Responsive (mobile-first, breakpoints: md, lg)
- **Typography**: Tailwind utility classes
- **Components**: EnhancedFooter, JotformChatbot, SEOHead

### Stripe Integration

**Pricing Table**:
- **Component Type**: Custom Web Component (`<stripe-pricing-table>`)
- **Pricing Table ID**: `prctbl_1SLTeeLs8MC0aCdjujaEGM3N`
- **Publishable Key**: `pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH`
- **Script Source**: `https://js.stripe.com/v3/pricing-table.js`

**Implementation Pattern**:
```javascript
useEffect(() => {
  // Load Stripe pricing table script
  const script = document.createElement('script');
  script.src = 'https://js.stripe.com/v3/pricing-table.js';
  script.async = true;
  document.body.appendChild(script);

  return () => {
    // Cleanup: remove script when component unmounts
    if (document.body.contains(script)) {
      document.body.removeChild(script);
    }
  };
}, []);
```

**Payment Flow**:
1. User views pricing table on `/planosflex`
2. Clicks "Subscribe" button (managed by Stripe)
3. Redirected to Stripe Checkout (hosted by Stripe)
4. Completes payment via Stripe's secure interface
5. Subscription activated immediately
6. Webhooks notify backend for fulfillment

### Navigation Flow

**Entry Points**:
- Direct URL: `https://saraivavision.com.br/planosflex`
- From `/planos` (PlansPage) - Link in hero section
- From site navigation (if added to menu)

**Exit Points**:
- Back to `/planos` - "Voltar para Planos Presenciais" link
- CTA to `/planos` - "Ver Planos Anuais Presenciais" (for customers seeking savings)
- CTA to `/planosonline` - "Ver Planos Online" (for remote customers)

### SEO Configuration

```javascript
{
  title: 'Planos Flex - Sem Fidelidade | Saraiva Vision',
  description: 'Planos flexíveis de lentes de contato sem fidelidade. Cancele quando quiser, sem burocracia.',
  keywords: 'planos sem fidelidade, lentes contato flexível, planos mensais lentes',
  canonicalUrl: 'https://saraivavision.com.br/planosflex',
  ogImage: 'https://saraivavision.com.br/og-image.jpg'
}
```

## Feature Benefits

### User Benefits

1. **No Commitment**: Cancel anytime without penalties or long-term contracts
2. **Flexibility**: Pause or resume subscription based on needs
3. **Presential Care**: In-person consultations at clinic in Caratinga/MG
4. **Regular Delivery**: Monthly contact lens delivery to Caratinga and region
5. **Convenience**: Automated monthly payments via Stripe

### Business Benefits

1. **Lower Friction**: Easier customer acquisition without annual commitment requirement
2. **Recurring Revenue**: Predictable monthly income stream
3. **Payment Automation**: Stripe handles billing, retries, and dunning management
4. **Subscription Analytics**: Stripe Dashboard provides churn, MRR, and retention metrics
5. **Compliance**: PCI-compliant payment processing (Stripe Level 1 PCI DSS)

## Integration Points

### Frontend Routes (App.jsx)

```javascript
// Line 24 in App.jsx
const PlanosFlexPage = createLazyComponent(() =>
  import('@/modules/payments/pages/PlanosFlexPage.jsx')
);

// Line 84 in App.jsx
<Route path="/planosflex" element={<PlanosFlexPage />} />
```

### PlansPage Integration

**Location**: `src/modules/payments/pages/PlansPage.jsx`

**Integration Type**: Hero section CTA linking to `/planosflex`

**Purpose**: Provide flex plan option for customers viewing annual plans

### PlanosOnlinePage Integration

**Previous State**: Had link to flex plans (removed during implementation)
**Current State**: Focus on online-only plans without presential flex option

### Backend Webhooks

**Location**: `api/src/webhooks/` (Stripe webhook handlers)

**Events Handled**:
- `customer.subscription.created` - New subscription started
- `customer.subscription.updated` - Subscription modified
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Monthly payment successful
- `invoice.payment_failed` - Payment failed (dunning process)

**Purpose**: Fulfill subscriptions, manage access, handle cancellations

## User Experience Flow

### Happy Path

1. **Discovery**: User lands on `/planosflex` via link from `/planos` or direct URL
2. **Education**: Reads benefits section highlighting flexibility and no commitment
3. **Selection**: Views Stripe Pricing Table with available flex plans
4. **Checkout**: Clicks plan, redirected to Stripe Checkout
5. **Payment**: Completes payment via Stripe (card, PIX, boleto supported)
6. **Confirmation**: Receives email confirmation from Stripe
7. **Fulfillment**: Backend webhook triggers subscription activation
8. **Service Delivery**: Customer receives welcome email with next steps

### Error States

**Script Load Failure**:
- Stripe script fails to load (network issue)
- Fallback: Pricing table won't render, page structure remains intact
- User sees layout but no pricing table
- Consider adding loading state or error message in future iteration

**Payment Failure**:
- Handled by Stripe Checkout with built-in retry logic
- User receives payment failure email from Stripe
- Smart retries configured in Stripe Dashboard

## Testing Strategy

### Manual Testing Checklist

- [ ] Page loads correctly on desktop (Chrome, Firefox, Safari)
- [ ] Page loads correctly on mobile (iOS Safari, Android Chrome)
- [ ] Stripe Pricing Table renders without console errors
- [ ] Navigation links work correctly (back to /planos, CTA to /planosonline)
- [ ] SEO meta tags present in page source
- [ ] Green gradient theme applied correctly
- [ ] Responsive layout works at breakpoints (320px, 768px, 1024px, 1280px)
- [ ] JotformChatbot loads and functions
- [ ] EnhancedFooter renders correctly
- [ ] Icons (Lucide React) display properly

### Integration Testing

- [ ] Stripe Checkout completes successfully (test mode)
- [ ] Webhook receives subscription.created event
- [ ] Customer can access subscription in Stripe Customer Portal
- [ ] Cancellation flow works (test mode)
- [ ] Monthly billing cycle triggers correctly

### SEO Testing

- [ ] Canonical URL set correctly
- [ ] Open Graph tags present
- [ ] Page indexed by Google (verify in Search Console)
- [ ] Rich results preview displays correctly
- [ ] Keywords appear in page content naturally

## Performance Considerations

### Bundle Size

**Component**: Lazy-loaded via React.lazy()
**Estimated Size**: ~15-20KB (gzipped)
**External Scripts**: Stripe Pricing Table (~50KB, cached)
**Images**: None (icons are SVG via Lucide React)

### Loading Strategy

1. **Initial Load**: Page skeleton renders immediately
2. **Stripe Script**: Loads asynchronously via `script.async = true`
3. **Pricing Table**: Renders after Stripe script loads
4. **Cleanup**: Script removed on component unmount to prevent memory leaks

### Caching

- **Static Assets**: Cached by Nginx with appropriate headers
- **Stripe Script**: Cached by CDN with long TTL
- **Pricing Table Data**: Fetched from Stripe API (real-time pricing)

## Security Considerations

### Content Security Policy (CSP)

**Required Directives**:
```nginx
script-src: https://js.stripe.com
frame-src: https://js.stripe.com
connect-src: https://api.stripe.com
```

**Status**: Already configured in `/etc/nginx/sites-enabled/saraivavision`

### Payment Security

- **PCI Compliance**: All payment data handled by Stripe (Level 1 PCI DSS)
- **No Card Storage**: No credit card data touches Saraiva Vision servers
- **Secure Checkout**: Stripe Checkout is hosted and secured by Stripe
- **Webhook Validation**: Stripe signature verification in webhook handlers

### Data Privacy (LGPD)

- **Minimal Data Collection**: Only necessary subscription data collected
- **Stripe Privacy Policy**: Customer data governed by Stripe's privacy policy
- **Consent**: Privacy policy link present in EnhancedFooter
- **Right to Cancel**: Easy cancellation via Stripe Customer Portal

## Analytics & Tracking

### Google Analytics Events

**Recommended Events to Track**:
- `page_view` - Page visits (automatic)
- `view_pricing_table` - User sees pricing table
- `begin_checkout` - User clicks Stripe plan button
- `purchase` - Subscription completed (via webhook)
- `cancel_subscription` - User cancels (via webhook)

**Implementation**: Configure in Google Tag Manager via dataLayer

### Stripe Analytics

**Available Metrics in Stripe Dashboard**:
- Monthly Recurring Revenue (MRR)
- Active subscriptions count
- Churn rate
- Customer Lifetime Value (LTV)
- Failed payment rate
- Revenue by plan

## Future Enhancements

### Phase 1 (Immediate)

- [ ] Add loading state while Stripe script loads
- [ ] Add error boundary for Stripe script failures
- [ ] Configure Google Analytics conversion tracking
- [ ] Add FAQ accordion for common questions

### Phase 2 (Short-term)

- [ ] A/B test different pricing displays
- [ ] Add customer testimonials section
- [ ] Implement referral program for flex plans
- [ ] Create comparison table: Flex vs Annual plans

### Phase 3 (Long-term)

- [ ] Build custom checkout flow (migrate away from Stripe Pricing Table)
- [ ] Add trial period option (7-day or 14-day trial)
- [ ] Implement usage-based billing for addon services
- [ ] Create customer portal for subscription management

## Troubleshooting

### Pricing Table Not Rendering

**Symptoms**: White space where pricing table should appear

**Causes**:
1. Stripe script blocked by CSP (check browser console)
2. Network error loading Stripe script
3. Invalid pricing table ID
4. Stripe API outage

**Solutions**:
1. Verify CSP allows `https://js.stripe.com`
2. Check network tab for script load errors
3. Verify pricing table ID in Stripe Dashboard
4. Check Stripe Status Page (status.stripe.com)

### Payment Not Processing

**Symptoms**: Customer completes checkout but subscription not activated

**Causes**:
1. Webhook not configured in Stripe Dashboard
2. Webhook endpoint not accessible (firewall, DNS)
3. Webhook signature validation failing
4. Backend service down

**Solutions**:
1. Configure webhook endpoint in Stripe Dashboard
2. Verify webhook endpoint is publicly accessible
3. Check webhook secret matches in environment variables
4. Check API service status: `sudo systemctl status saraiva-api`

### Navigation Broken

**Symptoms**: Links don't work or redirect incorrectly

**Causes**:
1. React Router configuration error
2. Missing route in App.jsx
3. Link components using wrong path

**Solutions**:
1. Verify route exists in App.jsx line 84
2. Check Link component `to` prop matches route path
3. Test navigation in development: `npm run dev:vite`

## Deployment Checklist

### Pre-Deployment

- [x] Component created and tested locally
- [x] Route added to App.jsx
- [x] Links added from PlansPage
- [x] SEO configuration complete
- [x] Stripe Pricing Table ID verified
- [x] CSP updated for Stripe domains
- [x] Documentation created

### Deployment

- [x] Build frontend: `npm run build:vite`
- [x] Verify build output includes PlanosFlexPage chunk
- [x] Deploy to production: `sudo npm run deploy:quick`
- [x] Verify Nginx config includes CSP for Stripe
- [x] Verify API webhooks configured in Stripe Dashboard

### Post-Deployment

- [x] Test page loads in production
- [x] Verify Stripe Pricing Table renders
- [x] Test navigation from /planos
- [x] Submit sitemap update to Google Search Console
- [ ] Monitor Stripe Dashboard for first subscriptions
- [ ] Monitor error logs for issues

## Related Documentation

- **Main Project Documentation**: `/home/saraiva-vision-site/CLAUDE.md`
- **Stripe Webhooks Guide**: `/home/saraiva-vision-site/docs/Webhooks-API-Guide.md`
- **Stripe Quickstart**: `/home/saraiva-vision-site/docs/Webhooks-Quickstart.md`
- **Deployment Guide**: `/home/saraiva-vision-site/docs/deployment/DEPLOYMENT_GUIDE.md`
- **README**: `/home/saraiva-vision-site/README.md`

## Changelog

### Version 1.0.0 (2025-10-23)

- **Initial Release**: Planos Flex feature deployed to production
- **Component**: PlanosFlexPage.jsx created
- **Integration**: Stripe Pricing Table embedded
- **Navigation**: Links added from PlansPage
- **SEO**: Meta tags configured
- **Documentation**: Feature documentation created

---

**Feature Owner**: Dr. Philipe Saraiva Cruz
**Last Updated**: 2025-10-23
**Status**: ✅ Production Ready
**Route**: https://saraivavision.com.br/planosflex
