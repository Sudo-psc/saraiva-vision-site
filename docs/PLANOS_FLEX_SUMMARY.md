# Planos Flex - Quick Reference Summary

## Feature Overview

**Planos Presenciais Flex** - Flexible subscription plans for contact lenses without long-term commitment.

- **Route**: `/planosflex`
- **Status**: ✅ Production (Deployed 2025-10-23)
- **Integration**: Stripe Pricing Table
- **Target**: Presential customers in Caratinga/MG

## Key Information

### Component Location
```
src/modules/payments/pages/PlanosFlexPage.jsx
```

### Route Configuration
```javascript
// App.jsx line 24
const PlanosFlexPage = createLazyComponent(() =>
  import('@/modules/payments/pages/PlanosFlexPage.jsx')
);

// App.jsx line 84
<Route path="/planosflex" element={<PlanosFlexPage />} />
```

### Stripe Configuration

**Pricing Table ID**:
```
prctbl_1SLTeeLs8MC0aCdjujaEGM3N
```

**Publishable Key**:
```
pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH
```

**Script URL**:
```
https://js.stripe.com/v3/pricing-table.js
```

## Navigation Flow

### Entry Points
- Direct URL: `https://saraivavision.com.br/planosflex`
- From `/planos` page (link in hero section)

### Exit Points
- Back to `/planos` (annual presential plans)
- Link to `/planosonline` (online plans)

## Key Features

1. **No Commitment** - Cancel anytime without penalties
2. **Monthly Billing** - Automated via Stripe
3. **Presential Care** - In-clinic consultations in Caratinga/MG
4. **Regular Delivery** - Monthly lens delivery to Caratinga region
5. **Flexible Management** - Pause or resume via Stripe portal

## Design Theme

- **Primary Color**: Green gradient (flexibility indicator)
- **Layout**: Responsive mobile-first design
- **Icons**: Lucide React (Package, CheckCircle, ArrowLeft)
- **Components**: SEOHead, EnhancedFooter, JotformChatbot

## SEO Configuration

```javascript
{
  title: 'Planos Flex - Sem Fidelidade | Saraiva Vision',
  description: 'Planos flexíveis de lentes de contato sem fidelidade. Cancele quando quiser, sem burocracia.',
  keywords: 'planos sem fidelidade, lentes contato flexível, planos mensais lentes',
  canonicalUrl: 'https://saraivavision.com.br/planosflex'
}
```

## CSP Requirements (Nginx)

```nginx
script-src: https://js.stripe.com
frame-src: https://js.stripe.com
connect-src: https://api.stripe.com
```

**Status**: ✅ Already configured in `/etc/nginx/sites-enabled/saraivavision`

## Testing Quick Commands

```bash
# Build and deploy
npm run build:vite
sudo npm run deploy:quick

# Test locally
npm run dev:vite
# Visit: http://localhost:3002/planosflex

# Check production
curl -I https://saraivavision.com.br/planosflex

# Verify Stripe script in page
curl -s https://saraivavision.com.br/planosflex | grep "stripe"

# Check API logs for webhooks
sudo journalctl -u saraiva-api -f | grep stripe
```

## Common Issues & Solutions

### Pricing Table Not Showing

**Check**:
1. Browser console for CSP errors
2. Network tab for Stripe script load
3. Pricing table ID matches Stripe Dashboard

**Fix**:
```bash
# Verify CSP headers
curl -I https://saraivavision.com.br/planosflex | grep -i content-security

# Check component
cat src/modules/payments/pages/PlanosFlexPage.jsx | grep prctbl_
```

### Webhook Not Working

**Check**:
1. Stripe Dashboard > Webhooks for delivery status
2. API service is running
3. Webhook signature verification passing

**Fix**:
```bash
# Restart API service
sudo systemctl restart saraiva-api

# Check webhook endpoint
curl -X POST https://saraivavision.com.br/api/webhooks/stripe

# View logs
sudo journalctl -u saraiva-api -n 50
```

## Related Files Modified

### Created
- `src/modules/payments/pages/PlanosFlexPage.jsx` - Main component
- `docs/features/planos-flex.md` - Feature documentation
- `docs/integrations/stripe-integration.md` - Stripe technical reference
- `docs/PLANOS_FLEX_SUMMARY.md` - This file

### Modified
- `src/App.jsx` - Added route (line 24, 84)
- `src/modules/payments/pages/PlansPage.jsx` - Added link to flex plans
- `CLAUDE.md` - Updated project documentation
- `README.md` - Added Stripe to tech stack

## Documentation References

### Full Documentation
- **Feature Details**: `/home/saraiva-vision-site/docs/features/planos-flex.md`
- **Stripe Integration**: `/home/saraiva-vision-site/docs/integrations/stripe-integration.md`
- **Project Docs**: `/home/saraiva-vision-site/CLAUDE.md`

### External Resources
- **Stripe Pricing Table**: https://stripe.com/docs/payments/checkout/pricing-table
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Stripe Dashboard**: https://dashboard.stripe.com

## Deployment Checklist

- [x] Component created and tested
- [x] Route added to App.jsx
- [x] Links added from PlansPage
- [x] SEO configured
- [x] Stripe integration tested
- [x] CSP headers verified
- [x] Documentation created
- [x] Deployed to production
- [ ] Monitor Stripe Dashboard for subscriptions
- [ ] Submit sitemap to Google Search Console

## Quick Stats

- **Lines of Code**: ~187 (PlanosFlexPage.jsx)
- **Bundle Size**: ~15-20KB (gzipped)
- **External Scripts**: Stripe Pricing Table (~50KB, cached)
- **Load Time**: <1s (lazy loaded)

## Contact

**Feature Owner**: Dr. Philipe Saraiva Cruz
**Deployed**: 2025-10-23
**Version**: 1.0.0
**Status**: ✅ Production Ready

---

For detailed information, see full documentation in `/home/saraiva-vision-site/docs/features/planos-flex.md`
