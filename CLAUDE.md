# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL SECURITY ISSUES

### **RESOLVED: XSS Vulnerability in Google Business Security Service**
- **File**: `src/services/googleBusinessSecurity.js` (lines 61-87)
- **Issue**: Fragile regex-based sanitization that removed dangerous prefixes but left payload content
- **Fix Applied**: **2025-10-08**
  - Replaced regex-based sanitization with robust DOMPurify integration
  - Added strict input validation with length limits and pattern detection
  - Enhanced rate limiting (reduced from 100 to 30 req/min)
  - Added comprehensive security audit logging
  - Implemented strict sanitization mode (no HTML allowed by default)
- **Mitigations**:
  - All inputs validated before processing
  - Automatic truncation of oversized payloads
  - Real-time security violation monitoring
  - Enhanced audit trail for all sanitization events

### **RESOLVED: API Analytics Routes Missing Validation**
- **File**: `api/src/routes/analytics.js` (lines 6-22)
- **Issue**: POST endpoints without body validation and catch-all router.use
- **Fix Applied**: **2025-10-08**
  - Added comprehensive Zod schemas for GA/GTM payload validation
  - Replaced router.use with explicit router.post for each endpoint
  - Implemented rate limiting (60 req/min per IP)
  - Added detailed error responses with 400 status codes
  - Enhanced logging for monitoring and debugging

### **RESOLVED: Webhook Memory Exhaustion Vulnerability**
- **File**: `api/src/webhooks/base-webhook.js` (line 96) & `api/src/middleware/webhook-validator.js`
- **Issue**: getRawBody called without maximum size enforcement
- **Fix Applied**: **2025-10-08**
  - Added configurable size limit parameter (default: 1MB)
  - Implemented real-time size checking during chunk processing
  - Added memory protection with immediate rejection of oversized payloads
  - Enhanced monitoring with payload size logging

### **RESOLVED: Appointment Webhook Missing Security Layers**
- **File**: `api/webhook-appointment.js` (lines 22-54)
- **Issue**: Missing security middleware, input validation, and proper error handling
- **Fix Applied**: **2025-10-08**
  - Added comprehensive Zod schema validation for appointment payloads
  - Implemented rate limiting (10 req/min per IP)
  - Added Helmet security headers and CSP protection
  - Configured CORS with approved origin whitelist
  - Replaced console.error with structured logger
  - Added request ID tracking and response time monitoring
  - Implemented generic 500 responses (no error exposure)
  - Enhanced security with strict validation and audit logging

## 🚨 CRITICAL BUILD RULE

**THIS PROJECT USES VITE, NOT NEXT.JS FOR PRODUCTION!**

```bash
# ✅ ALWAYS USE (production)
npm run build:vite

# ❌ NEVER USE for deploy (only Next.js API routes)
npm run build
```

## Project Context

**Saraiva Vision** - Medical ophthalmology clinic platform with CFM/LGPD compliance
- **Type**: React SPA with Vite (frontend) + Node.js/Express (backend API)
- **Location**: Caratinga, MG, Brazil 🇧🇷
- **VPS**: 31.97.129.78 (native, no Docker)
- **Production**: `/var/www/saraivavision/current/` served by Nginx
- **Status**: ✅ Production | 🏥 Healthcare | ⚖️ CFM/LGPD Compliant

## Architecture Overview

### Dual Architecture Pattern
```
Frontend (Vite/React SPA)     Backend (Node.js/Express API)
        ↓                              ↓
   Static Files                  API Endpoints
        ↓                              ↓
   Nginx (port 443)            Nginx proxy → :3001
        ↓                              ↓
   /var/www/saraivavision/     127.0.0.1:3001
```

### Key Components
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Router
- **Backend**: Node.js/Express (port 3001) with Vercel-style serverless adapters
- **Blog**: 100% static data in `src/data/blogPosts.js` (no CMS)
- **Cache**: Redis for Google Reviews only
- **Web Server**: Nginx (static files + API proxy + rate limiting)

### Critical Architecture Details

**Static Content System:**
- Blog posts are defined in `src/data/blogPosts.js` as JS objects
- No database or CMS - completely static for performance
- Images stored in `public/Blog/` with WebP/AVIF optimization
- Podcast episodes in `src/data/podcastEpisodes.js`

**Google Business Integration:**
- `src/services/googleBusinessService.js` - Main service class
- `src/services/googleBusinessSecurity.js` - Security and sanitization
- `src/services/cachedGoogleBusinessService.js` - Redis caching layer
- Rate limiting: 30 req/min via Nginx
- 136+ reviews cached with 4.9/5 rating

**Healthcare Compliance:**
- `src/lib/clinicInfo.js` - Central clinic configuration (NAP data)
- `src/utils/healthcareCompliance.js` - LGPD/CFM validation
- All medical content validated against CFM requirements
- PII detection and consent management throughout

## Common Development Commands

### Development
```bash
npm run dev:vite          # Frontend dev server (port 3002)
npm run dev               # Next.js dev for API routes (port 3000)
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:comprehensive # Full test suite (unit + integration + API + frontend)
npm run lint              # ESLint check
npm run validate:api      # API syntax and encoding validation
```

### Build Commands
```bash
npm run build:vite        # Production frontend build (ALWAYS use this)
npm run build:norender    # Build without prerendering
npm run preview           # Local preview of build
npm run build             # Next.js build (API routes only, NEVER for frontend)
```

### Deploy Commands
```bash
sudo npm run deploy:quick           # Quick deploy (90% of cases)
sudo ./scripts/deploy-atomic.sh     # Atomic deploy with rollback
sudo ./scripts/deploy-atomic-local.sh # Local atomic deploy
npm run deploy:health               # Production health check
```

### Testing Commands
```bash
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e            # End-to-end tests
npm run test:api            # API tests only
npm run test:frontend       # Frontend tests only
npm run test:coverage       # Tests with coverage report
npm run test:cover-images   # Blog cover images validation
```

## File Structure & Organization

### Directory Layout
```
/home/saraiva-vision-site/
├── src/                     # Frontend source code
│   ├── components/          # React components (PascalCase.jsx)
│   ├── pages/              # Route components with lazy loading
│   ├── hooks/              # Custom React hooks (camelCase.js)
│   ├── lib/                # Core utilities + LGPD compliance
│   ├── data/               # Static data (blogPosts.js, podcastEpisodes.js)
│   ├── utils/              # Helper functions
│   ├── services/           # API service functions + Google Business
│   └── __tests__/          # Frontend tests
├── api/                    # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── server.js       # Main Express server (port 3001)
│   │   ├── routes/         # Express route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── webhooks/       # Webhook handlers
│   │   └── utils/          # API utilities
│   └── *.js                # Vercel-style serverless functions (adapted)
├── public/                 # Static assets
│   ├── Blog/              # Blog post images (WebP/AVIF)
│   └── Podcasts/          # Podcast cover images
├── scripts/                # Build and deployment scripts
└── docs/                   # Project documentation
```

### Build Flow
```
Source Code → Build → Deploy
src/ → dist/ (Vite) → /var/www/saraivavision/current/
api/ → Express server (systemd service on port 3001)
```

### Key Configuration Files
- `vite.config.js` - Frontend build with manual chunk splitting (healthcare-optimized)
- `next.config.js` - Legacy (not used in production, only for dev compatibility)
- `src/lib/clinicInfo.js` - Frontend clinic configuration (NAP canonical data)
- `api/src/lib/clinicInfo.js` - Backend clinic configuration
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Styling configuration
- `/etc/nginx/sites-enabled/saraivavision` - Nginx configuration (CSP, rate limits, proxies)

### Build Outputs
- ✅ `/dist/` - Vite build output (USE THIS FOR DEPLOYMENT)
- ❌ `/.next/` - Next.js build (NOT USED, legacy only)
- ✅ `/var/www/saraivavision/current/` - Production files served by Nginx

## Environment Variables

### Required Environment Variables
```bash
# Frontend (Vite)
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anonymous key
VITE_GOOGLE_MAPS_API_KEY=    # Google Maps API key
VITE_GOOGLE_PLACES_API_KEY=  # Google Places API key
VITE_GOOGLE_PLACE_ID=        # Google Place ID (fallback: ChIJVUKww7WRugARF7u2lAe7BeE)
VITE_BASE_URL=               # Base URL (production: https://saraivavision.com.br)

# Backend (API)
RESEND_API_KEY=              # Resend email service key
NODE_ENV=production          # Environment mode
```

### Optional but Recommended
```bash
# Analytics
VITE_GA_ID=G-LXWRK8ELS6                              # Google Analytics 4 ID
VITE_GTM_ID=GTM-KF2NP85D                             # Google Tag Manager ID
VITE_POSTHOG_KEY=phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp  # PostHog analytics

# Development
VITE_DEV_MODE=true           # Enable development features
```

## Deployment Process

### Standard Deployment Workflow
```bash
# 1. Local build and test
cd /home/saraiva-vision-site
npm run build:vite
npm run test:run

# 2. Verify build output
ls -lh dist/assets/index-*.js
grep -o 'src="[^"]*index[^"]*\.js"' dist/index.html

# 3. Deploy to production
sudo npm run deploy:quick

# 4. Verify deployment
curl -I https://saraivavision.com.br
curl -s "https://saraivavision.com.br/" | grep -o 'src="[^"]*index[^"]*\.js"'
```

### Quick Deploy Script (90% of cases)
```bash
sudo npm run deploy:quick
```
This script:
- ✅ Builds frontend with Vite
- ✅ Validates build output
- ✅ Creates backup of current production
- ✅ Copies new files to production
- ✅ Reloads Nginx
- ✅ Runs health checks

## Development Standards

### Code Conventions
- **Components**: PascalCase (`ContactForm.jsx`)
- **Hooks/Utils**: camelCase (`useAuth.js`)
- **Services**: camelCase classes (`googleBusinessService.js`)
- **Files**: Use `.jsx` for React components, `.js` for utilities
- **Imports**: Use `@/` alias for `src/` directory
- **Testing**: Co-locate tests with source files using `__tests__/` or `.test.js`

### Performance Guidelines
- **Lazy Loading**: All route components use React.lazy()
- **Bundle Size**: Target <200KB per chunk (configured in vite.config.js)
- **Images**: Optimize with WebP/AVIF formats, store in `public/Blog/`
- **Code Splitting**: Manual chunks in vite.config.js for healthcare platform
- **Prerendering**: `scripts/prerender-pages.js` runs after build

### Healthcare Compliance
- **CFM**: Medical content validation required (all blog posts must be accurate)
- **LGPD**: PII detection and consent management (see `src/utils/healthcareCompliance.js`)
- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **Data Privacy**: No patient data in frontend code, all sensitive data in backend only

## Troubleshooting

### Build Issues
**Problem**: Build fails or changes don't appear on site

**Diagnosis**:
```bash
# Check which build output is being served
curl -s "https://saraivavision.com.br/" | grep 'index-.*\.js'

# List bundles on server
ls -lh /var/www/saraivavision/current/assets/index-*.js

# Check bundle content for specific changes
strings /var/www/saraivavision/current/assets/index-*.js | grep "EXPECTED_TEXT"
```

**Solution**:
1. Use correct build: `npm run build:vite`
2. Remove old bundles: `rm /var/www/saraivavision/current/assets/index-*.js`
3. Deploy new build: `sudo cp -r dist/* /var/www/saraivavision/current/`
4. Reload Nginx: `sudo systemctl reload nginx`
5. Clear browser cache (Ctrl+Shift+R)

### CSP Issues (Content Security Policy)
**Problem**: Scripts blocked by CSP (Google Analytics, GTM, etc.)

**Location**: `/etc/nginx/sites-enabled/saraivavision` line 339

**Current CSP** (Report-Only mode):
- Allows: Google Analytics, GTM, Supabase, Maps, Spotify, Ninsaude
- Add new domains to: `script-src`, `connect-src`, `frame-src` as needed

### Environment Variable Issues
```bash
# Validate environment variables
npm run build:vite

# Check for missing required variables
# Look for "Missing required environment variables" error
```

### API Issues
```bash
# Check API service status
sudo systemctl status saraiva-api
sudo journalctl -u saraiva-api -f

# Test API endpoints locally
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

## Key Features & Integrations

### Core Features
- **Google Reviews Integration**: Cached reviews with Redis, 30 req/min rate limit
- **Static Blog System**: SEO-friendly, client-side search, zero CMS dependencies
- **Appointment System**: WhatsApp integration + contact forms
- **Medical Content**: CFM-compliant healthcare information
- **Podcast Platform**: Spotify integration with streaming

### Third-Party Integrations
- **Google Maps/Places**: Clinic location (Place ID: ChIJVUKww7WRugARF7u2lAe7BeE)
- **Resend**: Transactional email service
- **Supabase**: Backend services and authentication
- **WhatsApp**: Contact and appointment booking
- **Spotify**: Podcast streaming integration

### Security Architecture
- **Rate Limiting**: Nginx-based (contact: 5/min, API: 30/min, general: 100/min)
- **CSP Headers**: Content Security Policy in Report-Only mode
- **Input Sanitization**: DOMPurify + custom sanitization in googleBusinessSecurity.js
- **XSS Protection**: HTML tag removal, JS protocol filtering, event handler stripping

## Critical Implementation Notes

### Google Business Service Architecture
The Google Business integration has layered architecture:
1. `GoogleBusinessApiService` - Raw API communication
2. `GoogleBusinessSecurity` - Input sanitization and XSS protection
3. `CachedGoogleBusinessService` - Redis caching layer
4. `GoogleBusinessMonitor` - Health monitoring and error tracking

**Known Issue**: XSS sanitization in `googleBusinessSecurity.js:61-87` has incomplete regex patterns. Current implementation removes dangerous prefixes but leaves payload content. See test failures in `src/services/__tests__/googleBusinessSecurity.test.js`.

### Static Content System
Blog posts are defined as JavaScript objects in `src/data/blogPosts.js`:
- No database queries at runtime
- All content bundled at build time
- Images referenced as `/Blog/image-name.jpg` (public folder)
- Client-side search via array filtering

### Nginx Configuration
Production Nginx at `/etc/nginx/sites-enabled/saraivavision`:
- Serves static files from `/var/www/saraivavision/current/`
- Proxies `/api/*` to `http://127.0.0.1:3001`
- Rate limiting zones: contact_limit, api_limit, general_limit, webhook_limit
- CSP headers on HTML responses (line 339)

## Development Workflow

### Making Changes
1. **Read existing code** before making changes
2. **Run tests** with `npm run test:run` to understand current behavior
3. **Test locally** with `npm run dev:vite` (frontend) and `npm run dev` (API)
4. **Build** with `npm run build:vite`
5. **Deploy** with `sudo npm run deploy:quick`
6. **Verify** in production browser (hard refresh: Ctrl+Shift+R)

### Working with Blog Content
```bash
# Blog posts are in src/data/blogPosts.js
# Add new post as JavaScript object with structure:
# { id, slug, title, excerpt, content, image, author, date, category, tags }

# Validate blog images
npm run verify:blog-images

# Optimize images
npm run optimize:images
```

### Working with Services
```bash
# Google Business service tests
npm run test src/services/__tests__/googleBusiness*.test.js

# Security service has known XSS issues - see test failures
npm run test src/services/__tests__/googleBusinessSecurity.test.js
```

## Production Considerations

### Healthcare Compliance Checklist
- [ ] Medical content reviewed by CFM-qualified professional
- [ ] LGPD consent management implemented
- [ ] No patient PII in frontend code
- [ ] Accessibility tested (WCAG 2.1 AA)
- [ ] Security headers configured (CSP, XSS, HSTS)

### Performance Monitoring
- Monitor bundle sizes: `npm run build:vite` reports compressed sizes
- Target: <200KB per chunk (configured in vite.config.js manual chunks)
- Check Core Web Vitals in production
- Verify image optimization (WebP/AVIF)

### Security Requirements
- PII detection via `src/utils/healthcareCompliance.js`
- Input sanitization for all user inputs (DOMPurify + custom)
- Rate limiting enforced at Nginx level
- SSL certificate auto-renewal via Let's Encrypt

## Additional Documentation

- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Security Practices**: `SECURITY.md`
- **Quick Start**: `README.md`

---

**Last Updated**: 2025-10-08
**Version**: 3.1.0
**Status**: ✅ Production Ready
