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

- **Vite** builds the frontend into `dist/` → deployed to `/var/www/saraivavision/current/`
- `npm run build` creates a Next.js build that is NOT used in production
- `.next/` directory can be ignored

## Project Context

**Saraiva Vision** - Medical ophthalmology clinic platform (Brazil)
- **Frontend**: React 18 + Vite + Tailwind CSS (SPA)
- **Backend**: Node.js/Express (port 3001), systemd service `saraiva-api`
- **Infra**: Nginx reverse proxy, Let's Encrypt SSL

## Common Commands

### Development
```bash
npm run dev:vite          # Frontend dev server (port 3002)
npm run dev               # Next.js dev for API routes (port 3000)
npm run lint
```

### Build & Deploy
```bash
npm run build:vite         # Production build → dist/
npm run build:norender     # Build without prerendering
sudo npm run deploy:quick  # Build + deploy (90% of cases)
sudo ./scripts/deploy-atomic.sh  # Atomic deploy with rollback
npm run deploy:health      # Production health check
```

### Testing
```bash
npm run test:run           # Run tests once
npm run test               # Watch mode
npm run test:comprehensive # Unit + integration + API + frontend
npx vitest run path/to/file.test.jsx  # Single file
npm run test:coverage
```

### API Service
```bash
sudo systemctl status saraiva-api
sudo systemctl restart saraiva-api
sudo journalctl -u saraiva-api -f
```

### Sanity CMS
```bash
npm run sanity:build       # Fetch posts at build time
npm run sanity:validate
node scripts/test-sanity-integration.js  # 9-test suite
```

## Architecture

### Build Pipeline
```
src/ → npm run build:vite → dist/ → deploy → /var/www/saraivavision/current/
```

**Critical**: The prerender script (`scripts/prerender-pages.js`) runs AFTER Vite and **replaces** `dist/index.html` with its own template. Any `<head>` changes (preloads, meta tags) must be made in **both** the source `index.html` AND the prerender template.

### App Shell Pattern
`App.jsx` wraps route content in `<div id="app-content">` inside `<WidgetProvider>`. Persistent floating widgets (WhatsApp bubble, analytics, IRPLAnnouncement, DeferredWidgets) are rendered **outside** `#app-content` via `React.Suspense`. This prevents the CSS `transform` + `position:fixed` stacking context bug — never move widgets inside `#app-content`.

### `check.` Subdomain
When `window.location.hostname` starts with `check.`, the app serves `CheckPage` at `/` instead of `HomePageLayout`. All other routes redirect to `/`.

### Blog System (Hybrid)
- **Primary**: Sanity CMS (Project: `92ocrdmp`, dataset: `production`)
- **Fallback**: `src/data/blogPosts.js` static data (zero-network, always available)
- **Circuit breaker**: 5s timeout with exponential retry in `src/services/sanityBlogService.js`
- **Sanity client** (`src/lib/sanityClient.js`) uses a universal `getEnv()` that works in both Vite (`import.meta.env`) and Node.js (`process.env`) contexts

### Google Business Reviews
Layered architecture: `GoogleBusinessApiService` → `GoogleBusinessSecurity` (DOMPurify sanitization) → `CachedGoogleBusinessService` (Redis) → `GoogleBusinessMonitor`. Rate limit: 30 req/min via Nginx.

### Payment Plans (Stripe)
- **Presential annual**: `/planos`, `/planobasico`, `/planopadrao`, `/planopremium`
- **Flex (no commitment)**: `/planosflex` — uses Stripe Pricing Table `prctbl_1SLTeeLs8MC0aCdjujaEGM3N`
- **Online/telemedicine**: `/planosonline`
- **Payment pages**: `/pagamentobasico`, `/pagamentopadrao`, `/pagamentopremium` (presential) and `/pagamentobasicoonline`, `/pagamentopadraoonline`, `/pagamentopremiumonline` (online)
- **Stripe publishable key**: `pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH`

### Key Config Files
- `src/lib/clinicInfo.js` — canonical clinic NAP data (frontend)
- `api/src/lib/clinicInfo.js` — same data for backend
- `src/config/createConfig.js` — runtime config factory
- `vite.config.js` — manual chunk splitting, `<200KB` per chunk target
- `/etc/nginx/sites-enabled/saraivavision` — CSP headers (line ~339), rate limits, SPA fallback

### SEO Components
- **`SafeHelmet`**: Simple pages (admin, agendamento, podcast). Handles null/undefined strings. ~3KB.
- **`SEOHead`**: Medical/content pages needing i18n, geo tags, structured data. ~14KB with i18n.

### Testing: ConfigProvider Requirement
Components using `useConfig` hook must be wrapped:
```javascript
import { ConfigProvider } from '@/config/ConfigProvider';
render(<ConfigProvider><HelmetProvider><YourComponent /></HelmetProvider></ConfigProvider>);
```

## Directory Structure
```
src/
  views/          # Route-level page components
  components/     # Shared React components
  modules/
    blog/         # Blog feature (Sanity + static fallback)
    payments/     # Subscription plans + Stripe
    core/         # DeferredWidgets and shared module components
  hooks/          # Custom React hooks
  lib/            # Core utils: sanityClient, clinicInfo, schemaMarkup
  services/       # API services: sanityBlogService, googleBusiness*, cachedGoogleBusiness*
  data/           # Static data: blogPosts.js, podcastEpisodes.js
  config/         # Runtime config, plans, CFM rules
  utils/          # lazyLoading.jsx (createLazyComponent with retry), analytics, widgetManager
api/src/
  server.js       # Express entry (port 3001)
  routes/         # Express route handlers
  webhooks/       # Stripe webhook handlers
  services/       # telegramService.js
scripts/          # Build and deploy scripts
public/
  Blog/           # Blog images (WebP/AVIF)
  Podcasts/       # Podcast covers
```

## Route Map

All routes are lazy-loaded via `createLazyComponent()` with retry logic (`src/utils/lazyLoading.jsx`):

| Path | Component |
|------|-----------|
| `/` | `HomePageLayout` (eager) |
| `/servicos`, `/servicos/:serviceId` | `ServicesPage`, `ServiceDetailPage` |
| `/olho-seco` | `OlhoSecoPage` |
| `/olho-seco/teste-rapido` | `TesteOlhoSecoPage` |
| `/luz-pulsada-irpl` | `IRPLPage` |
| `/meibografia` | `MeibografiaPage` |
| `/blefaroplastia-jato-plasma` | `BlefaroplastiaJatoPlasmaPage` |
| `/tratamento-dgm-caratinga` | `TratamentoDGMPage` |
| `/irpl-e-eye-vale-do-aco` | `IRPLValeDoAcoPage` |
| `/lentes-esclerais-olho-seco` | `LentesEscleraisPage` |
| `/consulta-primeira-vez-olho-seco` | `ConsultaOlhoSecoPage` |
| `/lentes`, `/lentes/wiki` | `LensesPage`, `ContactLensWikiPage` |
| `/blog`, `/blog/:slug` | `BlogPage` |
| `/podcast`, `/podcast/:slug` | `PodcastPageConsolidated` |
| `/agendamento` | `AgendamentoPage` |
| `/questionario-olho-seco` | `QuestionarioOlhoSecoPage` |
| `/campanha/outubro-olho-seco` | `CampanhaOutubroOlhoSecoPage` |
| `/avaliacoes` | `ReviewsPage` |
| `/faq` | `FAQPage` |
| `/planos`, `/planosflex`, `/planosonline` | Plan pages |
| `/privacy` | `PrivacyPolicyPage` |

## Environment Variables

```bash
# Frontend (Vite) — Required
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_PLACES_API_KEY=
VITE_GOOGLE_PLACE_ID=        # fallback: ChIJVUKww7WRugARF7u2lAe7BeE
VITE_BASE_URL=               # production: https://saraivavision.com.br

# Backend (API)
RESEND_API_KEY=
NODE_ENV=production

# Analytics (optional)
VITE_GA_ID=G-LXWRK8ELS6
VITE_GTM_ID=GTM-KF2NP85D

# Sanity (optional — defaults work)
VITE_SANITY_PROJECT_ID=92ocrdmp
VITE_SANITY_DATASET=production
```

## Troubleshooting

### Changes Not Appearing in Production
```bash
# 1. Check which bundle is served
curl -s "https://saraivavision.com.br/" | grep 'index-.*\.js'
# 2. Rebuild with correct command
npm run build:vite
# 3. Remove stale bundles and redeploy
rm /var/www/saraivavision/current/assets/index-*.js
sudo cp -r dist/* /var/www/saraivavision/current/
sudo systemctl reload nginx
```

### CSP Blocking Third-Party Scripts
Edit `/etc/nginx/sites-enabled/saraivavision` line ~339. Add new domains to `script-src`, `connect-src`, `frame-src` as needed.

### Prerender Template vs source index.html
If `<head>` changes (fonts, preloads) appear in dev but not production: also update the template in `scripts/prerender-pages.js`.

## Healthcare Compliance

- **CFM**: Medical content must be reviewed by CFM-qualified professional
- **LGPD**: PII detection in `src/utils/healthcareCompliance.js`, consent management required
- **Accessibility**: WCAG 2.1 AA mandatory
- **Design color**: Cyan (`cyan-600/700`) — technology-forward brand identity. See `docs/guidelines/NAVBAR_DESIGN_GUIDELINES.md`

## Documentation Index

- `docs/architecture/BLOG_ARCHITECTURE.md` — Blog hybrid system
- `docs/architecture/SANITY_INTEGRATION_GUIDE.md` — Sanity CMS setup
- `docs/guidelines/SEO_COMPONENTS_GUIDE.md` — SafeHelmet vs SEOHead decision matrix
- `docs/guidelines/NAVBAR_DESIGN_GUIDELINES.md` — Design rationale
- `docs/deployment/DEPLOYMENT_GUIDE.md` — Full deployment procedures
- `specs/` — Feature specifications (see `specs/README.md` for status)
