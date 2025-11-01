# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL BUILD RULE

**THIS PROJECT USES VITE, NOT NEXT.JS FOR PRODUCTION!**

```bash
# ✅ ALWAYS USE (production)
npm run build:vite

# ❌ NEVER USE for deploy
npm run build
```

### Why This Matters

- **Vite** builds the frontend into `dist/` → deployed to production
- **Next.js** is ONLY used for API routes compatibility during development
- The `.next/` directory is NOT deployed and can be ignored
- `npm run build` creates Next.js build that serves NO PURPOSE in production
- **Always verify**: Production serves files from `/var/www/saraivavision/current/` which must contain Vite output

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
- **Backend**: Node.js/Express (port 3001) with systemd service management
- **Blog**: Sanity CMS with static fallback (hybrid architecture for 100% uptime)
- **Cache**: Redis for Google Reviews only
- **Web Server**: Nginx (static files + API proxy + rate limiting)
- **Testing**: Vitest (unit, integration, E2E) with jsdom for React component testing

### Critical Architecture Details

**Blog Content System (Sanity CMS + Static Fallback):**
- **Primary Source**: Sanity CMS (Project ID: 92ocrdmp, 25 posts)
- **Fallback**: Static posts in `src/data/blogPosts.js` for 100% uptime
- **Architecture**: `sanityBlogService.js` → Sanity API → Fallback on error
- **Circuit Breaker**: 5-second timeout with exponential retry
- **Services**:
  - `src/lib/sanityClient.js` - Universal client (Vite + Node.js compatible)
  - `src/lib/sanityUtils.js` - GROQ queries and transformations
  - `src/services/sanityBlogService.js` - Main blog data service
  - `src/components/PortableTextRenderer.jsx` - Content rendering
- **Images**: `public/Blog/` with WebP/AVIF optimization
- **Podcast**: `src/data/podcastEpisodes.js`

**Google Business Integration:**
- `src/services/googleBusinessService.js` - Main service class
- `src/services/googleBusinessSecurity.js` - Security and sanitization (DOMPurify-based)
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

### API Service Management
```bash
# Service control
sudo systemctl status saraiva-api    # Check API service status
sudo systemctl restart saraiva-api   # Restart API server
sudo systemctl start saraiva-api     # Start API server
sudo systemctl stop saraiva-api      # Stop API server

# Logs and monitoring
sudo journalctl -u saraiva-api -f    # View real-time API logs
sudo journalctl -u saraiva-api -n 100 # View last 100 log entries

# Alternative restart via npm
npm run restart-api                  # Restart using npm script
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
npm run test:watch          # Run tests in watch mode
npm run test:ui             # Open Vitest UI for interactive testing
```

### Sanity CMS Commands
```bash
# Blog content management
npm run sanity:build        # Fetch posts from Sanity at build time
npm run sanity:export       # Export static posts to Sanity
npm run sanity:validate     # Validate Sanity schema
npm run sanity:query        # Run ad-hoc GROQ query
npm run sanity:delete       # Delete posts from Sanity (use with caution)

# Integration testing
node scripts/test-sanity-integration.js  # Run 9-test integration suite
```

### System Health & Monitoring
```bash
# Comprehensive system health check
npm run check:system

# Install automated cron job (runs every 6 hours by default)
CRON_SCHEDULE="0 */6 * * *" npm run install:checkup-cron

# Manual health checks
npm run deploy:health                 # Quick production health check
bash scripts/system-health-check.sh   # Full system diagnostics
bash scripts/security-health-check.sh # Security audit
bash scripts/check-nginx-status.sh    # Nginx status check
```

Reports are stored in `reports/system-checkup/` and cover:
- Nginx configuration and performance
- API service health and uptime
- SSL certificate validity
- Disk space and system resources
- Security headers and rate limiting
- Database connections (Redis)

## File Structure & Organization

### Directory Layout
```
/home/saraiva-vision-site/
├── src/                     # Frontend source code
│   ├── components/          # React components (PascalCase.jsx)
│   ├── pages/              # Route components with lazy loading
│   ├── modules/            # Feature modules (blog, payments, core)
│   │   ├── blog/           # Blog feature module
│   │   ├── payments/       # Payment plans and subscription features
│   │   │   └── pages/      # Plan pages (PlansPage, PlanosFlexPage, etc.)
│   │   └── core/           # Core shared components
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
│   │   ├── webhooks/       # Webhook handlers (Stripe integration)
│   │   ├── lib/            # API libraries and config
│   │   └── utils/          # API utilities
│   └── *.js                # Legacy serverless functions (now using Express routes)
├── public/                 # Static assets
│   ├── Blog/              # Blog post images (WebP/AVIF)
│   └── Podcasts/          # Podcast cover images
├── scripts/                # Build and deployment scripts
├── docs/                   # Project documentation
├── reports/                # System health reports
├── archive/                # Historical files (reports, configs, scripts, tests)
│   ├── reports/           # Old implementation and deployment reports
│   ├── configs/           # Legacy nginx configurations
│   ├── scripts/           # Deprecated build/deploy scripts
│   └── tests/             # Old test and diagnostic files
└── AGENTS.md               # Build commands and code style for AI agents
```

### Build Flow
```
Source Code → Build → Deploy
src/ → dist/ (Vite) → /var/www/saraivavision/current/
api/ → Express server (systemd service on port 3001)
```

### Key Configuration Files
- `vite.config.js` - Frontend build with manual chunk splitting (healthcare-optimized)
- `next.config.js` - Legacy (dev compatibility only, NOT used in production)
- `src/lib/clinicInfo.js` - Frontend clinic configuration (NAP canonical data)
- `api/src/lib/clinicInfo.js` - Backend clinic configuration
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Styling configuration
- `/etc/nginx/sites-enabled/saraivavision` - Nginx configuration (CSP, rate limits, proxies)

### Build Outputs
- ✅ `/dist/` - Vite build output (USE THIS FOR DEPLOYMENT)
- ❌ `/.next/` - Next.js build (NOT USED, legacy only, can be ignored)
- ✅ `/var/www/saraivavision/current/` - Production files served by Nginx

## Environment Variables

### Required Environment Variables
```bash
# Frontend (Vite) - Required
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anonymous key
VITE_GOOGLE_MAPS_API_KEY=    # Google Maps API key
VITE_GOOGLE_PLACES_API_KEY=  # Google Places API key
VITE_GOOGLE_PLACE_ID=        # Google Place ID (fallback: ChIJVUKww7WRugARF7u2lAe7BeE)
VITE_BASE_URL=               # Base URL (production: https://saraivavision.com.br)

# Backend (API) - Required
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

# Email Configuration
DOCTOR_EMAIL=philipe_cruz@outlook.com        # Doctor's email
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br  # Contact form sender

# Sanity CMS (optional - uses defaults if omitted)
VITE_SANITY_PROJECT_ID=92ocrdmp             # Sanity project ID
VITE_SANITY_DATASET=production              # Sanity dataset
VITE_SANITY_TOKEN=                          # Optional: for draft/preview content
```

### Environment Setup
See `.env.example` for complete list of available variables. Copy and configure:
```bash
cp .env.example .env
# Edit .env with your actual values
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

### Design Guidelines

**Complete Documentation:** See `docs/guidelines/NAVBAR_DESIGN_GUIDELINES.md` for detailed rationale

#### Color Palette Decision (2025-11-01)
- **Primary Brand Color:** Cyan (#06B6D4) - `cyan-600/700` in Tailwind
- **Rationale:** Technology-forward positioning, innovation, modernity
- **Not Teal:** Rejected teal (#0F766E) - too conservative for brand identity
- **Usage:** All CTAs, active states, hover effects, mobile menu highlights

#### Navbar UX Principles
1. **Simplified Navigation (50+ audience)**
   - No icons in main nav links (reduces visual clutter)
   - Icons ONLY in CTAs (Phone, Calendar) for action clarity

2. **Clear Active State**
   - Cyan gradient background on current page
   - 2px border for emphasis
   - Immediate wayfinding for users

3. **Accessibility (WCAG 2.1 AA/AAA)**
   - Minimum 16px font size (`text-base`)
   - 7:1 contrast ratio (slate-900 on white)
   - 44px minimum touch targets on mobile

4. **Microinteractions**
   - Hover: scale + shadow + animated underline
   - Active: scale-down feedback
   - Sticky: shrink effect on scroll

**When modifying Navbar:** Consult design guidelines document first to maintain consistency.

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
- Allows: Google Analytics, GTM, Supabase, Maps, Spotify, Ninsaude, Stripe
- Add new domains to: `script-src`, `connect-src`, `frame-src` as needed

**Stripe Integration**:
- `script-src`: Includes `https://js.stripe.com` for Pricing Table script
- `frame-src`: Includes `https://js.stripe.com` for embedded checkout
- Pricing table loads dynamically via custom element `<stripe-pricing-table>`

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

# Restart API if needed
sudo systemctl restart saraiva-api
npm run restart-api  # Alternative using npm script
```

## Key Features & Integrations

### Core Features
- **Google Reviews Integration**: Cached reviews with Redis, 30 req/min rate limit
- **Blog System**: Sanity CMS with static fallback, SEO-friendly, client-side search
- **Appointment System**: WhatsApp integration + contact forms
- **Medical Content**: CFM-compliant healthcare information
- **Podcast Platform**: Spotify integration with streaming
- **Subscription Plans**: Multiple tiers with Stripe integration
  - **Presential Plans**: Annual commitment (Basico, Padrao, Premium)
  - **Flex Plans**: No commitment, monthly subscription via Stripe
  - **Online Plans**: Telemedicine with national coverage

### Third-Party Integrations
- **Sanity.io**: Headless CMS for blog content (Project: 92ocrdmp)
- **Google Maps/Places**: Clinic location (Place ID: ChIJVUKww7WRugARF7u2lAe7BeE)
- **Resend**: Transactional email service
- **Supabase**: Backend services and authentication
- **WhatsApp**: Contact and appointment booking
- **Spotify**: Podcast streaming integration
- **Stripe**: Payment processing and subscription management
  - **Pricing Table ID**: `prctbl_1SLTeeLs8MC0aCdjujaEGM3N` (Planos Flex)
  - **Publishable Key**: `pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH`
  - **Webhooks**: Configured for subscription lifecycle events

### Security Architecture
- **Rate Limiting**: Nginx-based (contact: 5/min, API: 30/min, general: 100/min)
- **CSP Headers**: Content Security Policy in Report-Only mode
- **Input Sanitization**: DOMPurify + custom sanitization in googleBusinessSecurity.js
- **XSS Protection**: HTML tag removal, JS protocol filtering, event handler stripping

## Critical Implementation Notes

### React Router & Code Splitting Architecture
The app uses React Router v6 with aggressive code splitting:
- All route components are lazy-loaded via `createLazyComponent()` utility (see `src/utils/lazyLoading.jsx`)
- Retry logic built into lazy loading for failed chunk loads
- Manual chunk splitting configured in `vite.config.js` targets <200KB per chunk
- Healthcare-specific chunking strategy separates medical content, analytics, maps, and UI libraries

**Payment & Subscription Routes:**
- `/planos` - Presential annual plans (PlansPage)
- `/planosflex` - Presential flex plans without commitment (PlanosFlexPage)
- `/planosonline` - Online telemedicine plans (PlanosOnlinePage)
- `/planobasico`, `/planopadrao`, `/planopremium` - Individual plan detail pages
- `/pagamentobasico`, `/pagamentopadrao`, `/pagamentopremium` - Payment pages for presential plans
- `/pagamentobasicoonline`, `/pagamentopadraoonline`, `/pagamentopremiumonline` - Payment pages for online plans

### Google Business Service Architecture
The Google Business integration has layered architecture:
1. `GoogleBusinessApiService` - Raw API communication
2. `GoogleBusinessSecurity` - Input sanitization and XSS protection (DOMPurify-based)
3. `CachedGoogleBusinessService` - Redis caching layer
4. `GoogleBusinessMonitor` - Health monitoring and error tracking

### Static Content System
Blog posts are defined as JavaScript objects in `src/data/blogPosts.js`:
- No database queries at runtime
- All content bundled at build time via `scripts/build-blog-posts.js` (runs automatically before build)
- Images referenced as `/Blog/image-name.jpg` (public folder)
- Client-side search via array filtering
- Prerendering for SEO via `scripts/prerender-pages.js` (runs after build)

### API Service Management
Backend API runs as systemd service `saraiva-api`:
```bash
sudo systemctl status saraiva-api    # Check service status
sudo systemctl restart saraiva-api   # Restart API server
sudo journalctl -u saraiva-api -f    # View real-time logs
```

### Nginx Configuration
Production Nginx at `/etc/nginx/sites-enabled/saraivavision`:
- Serves static files from `/var/www/saraivavision/current/`
- Proxies `/api/*` to `http://127.0.0.1:3001`
- Rate limiting zones: contact_limit, api_limit, general_limit, webhook_limit
- CSP headers on HTML responses (line 339)
- SPA routing support with `try_files` fallback to `index.html`

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

# Security service tests
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

## Security Notes

### Resolved Security Issues (2025-10-08)
All critical security vulnerabilities have been addressed:

1. **XSS Protection**: Replaced fragile regex-based sanitization with DOMPurify integration
2. **API Validation**: Added Zod schemas for all API endpoints with rate limiting
3. **Webhook Security**: Implemented payload size limits and memory exhaustion protection
4. **Input Validation**: Comprehensive validation with length limits and pattern detection

For detailed security history, see commit logs from 2025-10-08.

## Additional Documentation

- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Security Practices**: `SECURITY.md`
- **Quick Start**: `README.md`

## SEO Component Architecture

### SafeHelmet vs SEOHead Decision Matrix

**SafeHelmet** (`@/components/SafeHelmet`):
- **Use for**: Simple pages, forms, admin areas, pages without complex structured data
- **Features**: String validation (prevents null/undefined errors), automatic fallbacks, basic Open Graph
- **Bundle**: ~3KB, no i18n overhead
- **Examples**: `/admin`, `/agendamento`, `/assinatura`, `/podcast`

**SEOHead** (`@/components/SEOHead`):
- **Use for**: Medical pages, main content pages, pages requiring i18n/hreflang
- **Features**: Full i18n integration, geo tags, medical business metadata, structured data
- **Bundle**: ~14KB with i18n
- **Examples**: `/`, `/servicos`, `/blog`, `/lentes`, `/faq`

**Critical Rule**: Always validate strings before passing to Helmet components. Both SafeHelmet and SEOHead handle null/undefined gracefully, but SafeHelmet is specifically designed for this.

See `docs/guidelines/SEO_COMPONENTS_GUIDE.md` for complete usage guide.

## Testing Architecture

### Test Organization
- **Unit Tests**: `src/**/__tests__/*.test.js` or `*.test.js` co-located with source
- **Integration Tests**: `src/__tests__/integration/`
- **API Tests**: `api/src/__tests__/`
- **E2E Tests**: `tests/e2e/`

### ConfigProvider Requirement
Components using `useConfig` hook **must** be wrapped with `ConfigProvider` in tests:
```javascript
import { ConfigProvider } from '@/config/ConfigProvider';

render(
  <ConfigProvider>
    <HelmetProvider>
      <YourComponent />
    </HelmetProvider>
  </ConfigProvider>
);
```

### Common Test Commands
```bash
npm run test:unit           # Fast unit tests only
npm run test:integration    # Integration tests
npm run test:comprehensive  # Full suite (unit + integration + API + frontend)
npm run test:ui             # Vitest UI for debugging
npx vitest run path/to/file.test.jsx  # Single test file
```

## Documentation Structure

📚 **[Complete Documentation Index](docs/README.md)** - Central hub for all project documentation

### Core Documentation
- **CLAUDE.md** (this file) - Primary development guide for AI assistants
- **README.md** - Quick start and project overview
- **AGENTS.md** - Build commands and code style for all AI agents
- **SECURITY.md** - Security practices and compliance
- **TROUBLESHOOTING.md** - Common issues and solutions

### Architecture Documentation (`/docs/architecture/`)
- **BLOG_ARCHITECTURE.md** - Blog system architecture (Sanity CMS + static fallback)
- **SANITY_INTEGRATION_GUIDE.md** - Complete Sanity CMS integration documentation
- Document author: Dr. Philipe Saraiva Cruz

### Guidelines (`/docs/guidelines/`)
- **SEO_COMPONENTS_GUIDE.md** - SafeHelmet vs SEOHead decision matrix

### Deployment (`/docs/deployment/`)
- **DEPLOYMENT_GUIDE.md** - Complete deployment procedures

### Feature Specifications (`/specs/`)

📊 **[Spec Status Tracking](specs/README.md)** - Implementation status for all feature specifications

- 001-backend-integration-strategy - API integration architecture (✅ Complete)
- 001-medical-appointment-api - Appointment system (✅ Complete)
- 002-resend-contact-form - Email contact forms (✅ Complete)
- 003-backend-integration-strategy - Backend patterns (✅ Complete)
- 005-wordpress-external-integration - WordPress migration documentation (🔄 Replaced with static blog)
- 009-frontend-performance-optimization - Performance improvements (⏳ Planning phase)
- 404-page - Custom error page implementation (✅ Complete)

### Archive (`/archive/`)
- Historical reports, configs, and deprecated scripts
- Organized 2025-10-10 for cleaner project root

## Sanity CMS Integration

### Architecture Overview
The blog uses a **hybrid architecture** combining Sanity CMS (primary) with static fallback (reliability):

```
BlogPage Component
       ↓
sanityBlogService.js
       ↓
┌──────┴──────────────────────┐
│  Try: Sanity CMS            │
│  - 25 posts via API         │
│  - 5s timeout               │
│  - Exponential retry        │
└──────┬──────────────────────┘
       │ (on success)
       ├──────→ Return Sanity data
       │
       │ (on failure)
       ↓
┌─────────────────────────────┐
│  Fallback: Static Posts     │
│  - src/data/blogPosts.js    │
│  - Always available         │
│  - Zero network dependency  │
└──────┬──────────────────────┘
       │
       └──────→ Return static data
```

### Key Files
- **`src/lib/sanityClient.js`**: Universal client (Vite + Node.js compatible via `getEnv()`)
- **`src/lib/sanityUtils.js`**: GROQ queries, image optimization, data transformations
- **`src/services/sanityBlogService.js`**: Main service with circuit breaker pattern
- **`src/components/PortableTextRenderer.jsx`**: Renders Portable Text content
- **`scripts/test-sanity-integration.js`**: 9-test integration suite

### Environment Compatibility
The Sanity client uses a universal `getEnv()` function that works in both contexts:
- **Vite (browser/build)**: Uses `import.meta.env`
- **Node.js (scripts)**: Uses `process.env`

This allows the same code to run in build scripts and production bundles.

### Testing
```bash
# Run full integration test suite (9 tests)
node scripts/test-sanity-integration.js

# Tests cover:
# 1. Sanity health check
# 2. Fetch metadata (25 posts)
# 3. Get post by slug
# 4. Recent posts (3)
# 5. Featured posts (3)
# 6. Posts by category
# 7. Search functionality
# 8. Cache statistics
# 9. Cache clear operation
```

### Content Management
```bash
# Export static posts to Sanity (one-time migration)
npm run sanity:export

# Fetch posts from Sanity during build
npm run sanity:build

# Validate Sanity schema
npm run sanity:validate
```

### Performance
- **Chunk**: `sanity-cms-*.js` ~53KB (18KB gzipped)
- **Cache**: In-memory caching for metadata and full posts
- **Optimization**: Lazy loading, CDN-backed reads, image optimization

### Fallback Behavior
- Sanity unreachable → Automatically uses static posts
- No user-visible errors
- Transparent switching between sources
- Circuit breaker prevents repeated failures

## Recent Changes

### 2025-10-26
- ✅ Sanity CMS integration complete with static fallback
- ✅ Fixed Node.js/Vite compatibility (universal `getEnv()` function)
- ✅ Fixed ESM imports with .js extensions
- ✅ Build optimization: 53KB Sanity chunk (18KB gzip)
- ✅ 9/9 integration tests passing
- ✅ Deployed to production: https://saraivavision.com.br

### 2025-10-24
- ✅ Path inconsistencies resolved (`./pages` → `src/views/`)
- ✅ SafeHelmet migration completed (5 pages migrated)
- ✅ SEO components documentation created (`docs/guidelines/SEO_COMPONENTS_GUIDE.md`)
- ✅ Blog architecture documented (`docs/architecture/BLOG_ARCHITECTURE.md`)
- ✅ Organized root directory: moved 68 files to `/archive/`
- ✅ Added `AGENTS.md` with build commands and code style guidelines

### 2025-10-08
- ✅ Resolved all critical security vulnerabilities
- ✅ Replaced regex-based sanitization with DOMPurify
- ✅ Added Zod schemas for API validation
- ✅ Implemented webhook security improvements

---

**Last Updated**: 2025-10-25
**Version**: 3.5.1
**Status**: ✅ Production Ready
