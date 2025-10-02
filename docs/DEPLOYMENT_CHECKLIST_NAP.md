# 🚀 NAP Standardization - Deployment Checklist

**Date**: October 2, 2025  
**Sprint**: 1 (80% Complete)  
**Tasks Completed**: A4 (NAP), A5 (Component Consolidation)  

---

## ✅ Pre-Deployment Verification

### 1. **Critical Configuration Updates**

- [ ] **Google Place ID** - Update in `src/lib/napCanonical.js`
  ```javascript
  // Line 83: Replace placeholder
  mapUrl: 'https://maps.app.goo.gl/YOUR_ACTUAL_PLACE_ID',
  ```
  
  **How to Get**:
  1. Go to [Google Business Profile](https://business.google.com/)
  2. Select your clinic
  3. Copy the "Share" link OR use Place ID Finder: https://developers.google.com/maps/documentation/places/web-service/place-id
  
  **Current Fallback**: `ChIJVUKww7WRugARF7u2lAe7BeE` (configured in `clinicInfo.js`)

- [ ] **Geo Coordinates Verification**
  ```javascript
  // Verify these match your actual location
  latitude: -19.789444,
  longitude: -42.137778,
  ```
  
  **Verification Tool**: [Google Maps Coordinate Finder](https://www.google.com/maps)
  - Right-click on clinic location → "What's here?"
  - Copy lat/long to `napCanonical.js` lines 84-85

- [ ] **Social Media URLs** - Verify all links work
  ```javascript
  // src/lib/napCanonical.js lines 90-100
  instagram: 'https://instagram.com/saraivavision',
  facebook: 'https://facebook.com/saraivavision',
  youtube: 'https://youtube.com/@saraivavision',
  ```
  
  **Test**: Click each link, ensure profiles are active

---

### 2. **Environment Variables**

- [ ] **Production .env** - Add Google Place ID
  ```bash
  # .env.production
  VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
  ```

- [ ] **Verify reCAPTCHA Key** (if not already set)
  ```bash
  REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_key_here
  ```

---

### 3. **Build Verification**

- [x] ✅ **Build Passes** (27.59s, 0 errors)
  ```bash
  npm run build
  ```

- [ ] **Bundle Size Check**
  - Current: 351.73 kB (react-core) - acceptable
  - Target: < 400 kB for main chunks
  - Action: Monitor `dist/assets/` after build

- [ ] **Pre-rendering Works**
  ```bash
  # Should output: "✅ Pre-rendered: / → index.html"
  npm run build
  ```

- [ ] **Lint Clean** (only pre-existing warnings)
  ```bash
  npm run lint
  ```

---

### 4. **Content Verification**

- [ ] **JSON-LD Schema Validation**
  1. Build project: `npm run build`
  2. Open `dist/index.html` in browser
  3. View source → search for `<script type="application/ld+json">`
  4. Copy JSON content
  5. Validate at: https://search.google.com/test/rich-results
  
  **Expected Output**:
  ```json
  {
    "@type": "MedicalBusiness",
    "name": "Clínica Saraiva Vision",
    "telephone": "+5533998601427",
    "address": { ... }
  }
  ```

- [ ] **NAP Consistency Check**
  - Phone displays as: `+55 33 99860-1427`
  - Address shows: `Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299`
  - Doctor name: `Dr. Philipe Saraiva Cruz (CRM-MG 69.870)`

---

## 🌐 Deployment Steps

### Option 1: VPS Deployment (Recommended)

```bash
# 1. Build locally
npm run build

# 2. Verify build
ls -lh dist/

# 3. Deploy to VPS (adjust path as needed)
sudo cp -r dist/* /var/www/html/

# 4. Verify permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# 5. Clear CDN/cache if using Cloudflare
# Go to Cloudflare Dashboard → Caching → Purge Everything
```

### Option 2: Vercel Deployment

```bash
# 1. Commit changes
git add .
git commit -m "feat: NAP standardization + component consolidation"

# 2. Push to main
git push origin main

# 3. Vercel auto-deploys on push
# Monitor at: https://vercel.com/your-project/deployments

# 4. Verify production URL
curl -I https://saraivavision.com.br
```

---

## 🔍 Post-Deployment Verification

### 1. **Immediate Checks (Within 5 minutes)**

- [ ] **Homepage Loads**
  - Visit: https://saraivavision.com.br
  - Check: No console errors in DevTools

- [ ] **Phone Numbers Clickable**
  - Click phone link: `tel:+5533998601427`
  - On mobile: Should open phone dialer

- [ ] **WhatsApp Button Works**
  - Click WhatsApp CTA
  - Should open: `https://wa.me/5533998601427?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta.`

- [ ] **Google Maps Link**
  - Click "Como chegar" / "Ver no mapa"
  - Should open Google Maps with clinic location

- [ ] **Social Links Active**
  - Instagram: https://instagram.com/saraivavision
  - Facebook: https://facebook.com/saraivavision
  - YouTube: https://youtube.com/@saraivavision

---

### 2. **SEO Validation (Within 1 hour)**

- [ ] **Google Rich Results Test**
  1. Go to: https://search.google.com/test/rich-results
  2. Enter: https://saraivavision.com.br
  3. Click "Test URL"
  4. Verify: "LocalBusiness" schema detected with NO errors

  **Expected Results**:
  - ✅ Business Name: Clínica Saraiva Vision
  - ✅ Address: Rua Catarina Maria Passos, 97
  - ✅ Phone: +5533998601427
  - ✅ Opening Hours: Monday-Friday 08:00-18:00
  - ✅ Aggregate Rating: 4.9 (127 reviews)

- [ ] **Schema Markup Validator**
  1. Go to: https://validator.schema.org/
  2. Paste JSON-LD from page source
  3. Verify: 0 errors, 0 warnings

- [ ] **Mobile-Friendly Test**
  - URL: https://search.google.com/test/mobile-friendly
  - Enter: https://saraivavision.com.br
  - Expected: ✅ Page is mobile-friendly

---

### 3. **Google Search Console (Within 24 hours)**

- [ ] **Submit Sitemap** (if not already done)
  ```
  Sitemap URL: https://saraivavision.com.br/sitemap.xml
  Submit at: Google Search Console → Sitemaps → Add sitemap
  ```

- [ ] **Request Indexing**
  1. Go to: [Google Search Console](https://search.google.com/search-console)
  2. URL Inspection → Enter `https://saraivavision.com.br`
  3. Click "Request Indexing"
  4. Wait 24-48h for reindexing

- [ ] **Monitor Coverage Report**
  - Check for: New valid pages with structured data
  - Alert if: Errors in LocalBusiness schema

---

### 4. **Google Business Profile Update (Critical!)**

- [ ] **Verify NAP Match 100%**
  
  **Google Business Profile** MUST match exactly:
  
  | Field | Canonical Value | GBP Match? |
  |-------|----------------|------------|
  | **Name** | Clínica Saraiva Vision | ☐ |
  | **Address** | Rua Catarina Maria Passos, 97<br>Santa Zita, Caratinga - MG<br>35300-299 | ☐ |
  | **Phone** | +55 33 99860-1427 | ☐ |
  | **Website** | https://saraivavision.com.br | ☐ |
  | **Hours** | Mon-Fri: 08:00-18:00<br>Sat-Sun: Closed | ☐ |

  **How to Update**:
  1. Go to: https://business.google.com/
  2. Select clinic → Info → Edit
  3. Match ALL fields exactly
  4. Click "Apply" → Wait 3-5 days for verification

---

## 📊 Monitoring & Metrics (Week 1-4)

### Week 1: Technical Validation

- [ ] **Google Search Console**
  - Valid structured data pages: Should increase from 0 → 1+
  - Coverage: No errors for LocalBusiness schema

- [ ] **PageSpeed Insights**
  - URL: https://pagespeed.web.dev/
  - Test: https://saraivavision.com.br
  - Target: Performance > 85, SEO = 100

- [ ] **Mobile Usability**
  - Google Search Console → Mobile Usability
  - Target: 0 errors

---

### Week 2-4: SEO Impact

- [ ] **Local Pack Ranking**
  - **Query**: "oftalmologista caratinga"
  - **Tool**: Google Maps search (incognito)
  - **Baseline**: Record current position
  - **Target**: Top 3 in 4 weeks

- [ ] **Organic CTR**
  - Google Search Console → Performance
  - Filter: Pages containing "saraivavision.com.br"
  - **Baseline**: Record current CTR
  - **Target**: +15% increase

- [ ] **Rich Results Impressions**
  - GSC → Performance → Search Appearance
  - Filter: "Rich results"
  - **Target**: +30% impressions

- [ ] **Google Business Profile Insights**
  - Go to: Google Business Profile → Insights
  - Monitor:
    - Profile views: Target +25%
    - Direction requests: Target +20%
    - Phone calls: Target +15%

---

## 🐛 Troubleshooting

### Issue: Schema Validation Errors

**Symptom**: Google Rich Results Test shows errors

**Fix**:
```bash
# 1. Inspect live JSON-LD
curl -s https://saraivavision.com.br | grep -A 100 'application/ld+json'

# 2. Validate at schema.org
# Paste output to: https://validator.schema.org/

# 3. Common fixes:
# - Check latitude/longitude format (decimals, not DMS)
# - Verify phone format: +5533998601427 (E.164)
# - Ensure all URLs use HTTPS
```

---

### Issue: NAP Mismatch Warning

**Symptom**: Google shows inconsistent business info

**Action**:
1. Audit all citations:
   - Google Business Profile
   - Facebook Page
   - Yelp/TripAdvisor listings
   - Local directories

2. Update to match canonical:
   ```
   Name: Clínica Saraiva Vision
   Phone: +55 33 99860-1427
   Address: Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299
   ```

3. Wait 2-4 weeks for Google to re-crawl

---

### Issue: Phone Links Not Working on Mobile

**Symptom**: `tel:` links don't open dialer

**Fix**:
```javascript
// Verify in browser DevTools
document.querySelector('a[href^="tel:"]').href
// Should output: "tel:+5533998601427" (no spaces)

// If incorrect, check:
// src/lib/napCanonical.js line 74
href: 'tel:+5533998601427', // ✅ No spaces, no dashes
```

---

## 📞 Rollback Plan

If critical issues arise:

```bash
# 1. Revert to previous version
git revert HEAD
git push origin main

# 2. Redeploy old build
npm run build
sudo cp -r dist/* /var/www/html/

# 3. Clear cache
# Cloudflare: Purge cache
# Browser: Hard refresh (Ctrl+Shift+R)

# 4. Notify team
# Report issue to development team
```

---

## 🎯 Success Metrics (4-Week Target)

| Metric | Baseline | Week 1 | Week 2 | Week 4 | Target |
|--------|----------|--------|--------|--------|--------|
| **Local Pack Rank** ("oftalmologista caratinga") | TBD | - | - | - | Top 3 |
| **Organic CTR** | TBD | - | - | - | +15% |
| **Rich Results Impressions** | 0 | - | - | - | +30% |
| **GBP Views** | TBD | - | - | - | +25% |
| **Phone Clicks** | TBD | - | - | - | +20% |
| **Schema Errors** | - | 0 | 0 | 0 | 0 |

---

## 📝 Deployment Sign-Off

- [ ] All pre-deployment tasks completed
- [ ] Build verified locally
- [ ] Environment variables set
- [ ] Google Place ID updated
- [ ] Deployed to production
- [ ] Post-deployment checks passed
- [ ] Google Search Console updated
- [ ] Monitoring enabled

**Deployed By**: _________________  
**Date**: _________________  
**Production URL**: https://saraivavision.com.br  
**Deployment Method**: ☐ VPS  ☐ Vercel  

---

## 🔗 Quick Links

- **Google Business Profile**: https://business.google.com/
- **Google Search Console**: https://search.google.com/search-console
- **Rich Results Test**: https://search.google.com/test/rich-results
- **Schema Validator**: https://validator.schema.org/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

---

**Next Steps After Deployment**: Complete Sprint 2 tasks (see project roadmap in session summary)
