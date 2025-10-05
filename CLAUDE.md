# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Saraiva Vision** - Medical ophthalmology platform with CFM/LGPD compliance for the Brazilian healthcare market.

## 🎯 Project Overview

**Type**: Medical clinic website (Ophthalmology)
**Location**: Caratinga, MG, Brazil
**Status**: ✅ Production | 🏥 Healthcare | 🇧🇷 Brasil | ⚖️ CFM/LGPD Compliant
**URL**: https://saraivavision.com.br

## 🛠 Tech Stack & Architecture

### Hybrid Architecture (Critical Understanding)

**Frontend Layer**: React 18 SPA built with Vite, served as static files by Nginx
**API Layer**: Next.js 15 standalone server (PM2 managed, port 3002) handles `/api/ninsaude/*` routes
**Backend Layer**: Minimal Node.js/Express API (port 3001) for legacy endpoints
**Infrastructure**: Native VPS deployment (no Docker), Nginx reverse proxy, Redis cache

**Request Flow**:
- Static files (HTML/JS/CSS/images) → Nginx serves directly from `/var/www/saraivavision/current/`
- `/api/ninsaude/*` → Nginx proxies to Next.js standalone (port 3002)
- `/api/*` (other) → Nginx proxies to Express backend (port 3001)

### Tech Details

**Frontend**: React 18.3 + TypeScript 5.x + Vite 7.x + Tailwind CSS 3.3 + Radix UI + React Router v6
**API Routes**: Next.js 15 (standalone mode) for Ninsaúde scheduling integration
**Backend**: Node.js 22+ (ES modules) + Express.js (minimal)
**Storage**: Redis (caching), static data in `src/data/blogPosts.js` (no CMS)
**Server**: Nginx (static + reverse proxy) + PM2 (Next.js process manager)
**Testing**: Vitest 3.x + React Testing Library + jsdom

### Critical Integrations

**Ninsaúde Clinic API** (Online Scheduling):
- OAuth2 authentication (15 min access, 15 day refresh tokens)
- Next.js API Routes in `app/api/ninsaude/`: auth, units, professionals, patients, available-slots, appointments
- LGPD compliance mandatory for all patient data
- See `docs/NINSAUDE_INTEGRATION_SUCCESS.md` for complete docs

**Google APIs**:
- Places API (reviews, clinic info) with rate limiting (30 req/min)
- Maps API (location, directions)
- Real-time reviews display (136 reviews, 4.9/5.0 rating)

**Other APIs**: Resend (email), Instagram Graph API (social feed), WhatsApp/Spotify (minor features)

## 🚀 Essential Commands

### Development
```bash
npm run dev              # Vite dev server (port 3002)
npm run dev:next         # Next.js dev server (for API route testing)
npm run build            # Production build: Vite (dist/) + Next.js (.next/)
npm run build:vite       # Vite only (when no Next.js changes)
npm run start            # Preview Vite build locally
```

### Testing
```bash
npm test                            # Watch mode
npm run test:comprehensive          # Full suite (unit + integration + API + frontend)
npm run test:api                    # API tests only
npm run test:frontend               # Frontend tests only
npx vitest run path/to/file.test.js # Single file

# Ninsaúde Integration Tests
node scripts/test-ninsaude-complete.cjs     # Test Ninsaúde API directly
node scripts/test-nextjs-api-routes.cjs     # Test Next.js routes (dev server must be running)
```

### Deployment
```bash
npm run deploy              # Full hybrid deploy (Vite + Next.js + Nginx reload)
npm run deploy:quick        # Fast deploy for frontend-only changes (90% of cases)
npm run deploy:health       # Health check post-deploy
npm run validate:api        # Validate API syntax/encoding
```

### Utilities
```bash
npm run optimize:images     # Optimize blog images
npm run verify:blog-images  # Validate image references
```

## 🏗 Code Architecture

### Project Structure
```
├── app/                    # Next.js App Router (API Routes only)
│   └── api/
│       └── ninsaude/      # Ninsaúde scheduling endpoints
├── src/                    # React frontend source
│   ├── components/        # React components (PascalCase.jsx)
│   │   ├── ui/           # Radix UI components
│   │   ├── compliance/   # CFM/LGPD compliance components
│   │   └── scheduling/   # Appointment scheduling UI
│   ├── pages/            # Routes (lazy-loaded)
│   ├── hooks/            # Custom hooks (camelCase.js)
│   ├── lib/              # Utilities + LGPD helpers
│   │   ├── lgpd/        # Consent management, anonymization
│   │   └── ninsaude/    # Ninsaúde utilities
│   ├── data/            # Static data (blogPosts.js)
│   └── __tests__/       # Frontend tests
├── api/                  # Express.js backend (minimal, legacy)
│   └── __tests__/       # API tests
├── scripts/             # Build scripts, test scripts, deploy automation
├── docs/                # Comprehensive documentation
└── dist/                # Vite build output (production)
```

### Key Architectural Patterns

**Static Blog System**: All blog posts in `src/data/blogPosts.js`, no external CMS
**Lazy Loading**: All routes in `src/pages/` loaded on-demand via React Router
**Code Splitting**: Strategic vendor chunks (React, Router, UI, Motion)
**State Management**: React Context + local state (no Redux/Zustand)
**Import Alias**: `@/` → `src/` (always use absolute imports)

**Hybrid Build System**:
- Vite builds React SPA → `dist/` (served by Nginx as static files)
- Next.js builds standalone server → `.next/` (runs via PM2, handles API routes)
- Atomic deployment with symlinks ensures zero-downtime updates

## 📋 Development Guidelines

### Naming Conventions
- Components: `PascalCase.jsx` (e.g., `AppointmentScheduler.jsx`)
- Hooks: `camelCase.js` with `use*` prefix (e.g., `usePhoneMask.js`)
- Tests: `*.test.js` or `*.test.jsx` in `__tests__/` directories
- Utils: `camelCase.js`

### Code Style
- TypeScript: Enabled but **not strict mode** (strict: false)
- Styling: **Tailwind CSS only** (no CSS modules, no inline styles)
- ESLint: Enforced, run `npm run lint` before commits
- Environment: Variables prefixed with `VITE_` (frontend) or no prefix (backend/Next.js)

### Development Workflow
1. Dev server runs on port 3002 (Vite HMR enabled)
2. CORS configured for `/api/*` proxy during development
3. Hot reload for all React/TypeScript changes
4. Environment variables loaded from `.env.local`

## ⚡ Performance & Compliance

### Performance Targets
- Page load: <3s on 3G (Brazil mobile networks)
- Bundle: Chunks <250KB
- SEO: Prerendering for all static pages
- Caching: Assets cached 1 year, HTML/API no-cache
- Optimization: Tree shaking, minification, lazy loading, IntersectionObserver

### CFM Compliance (Brazilian Medical Council)
- Medical disclaimers on all clinical content
- PII detection and validation
- Professional identification (CRM) validation
- Compliance scoring system
- See `src/lib/compliance/` for implementation

### LGPD Compliance (Brazilian Data Protection)
- Consent management (`src/lib/lgpd/consentManager.js`)
- Data anonymization with SHA-256 hashing
- Audit logging for all patient data access
- Right to deletion workflows
- **Critical**: All Ninsaúde appointment creation requires explicit LGPD consent

### Security
- Input validation using Zod schemas
- Rate limiting on API endpoints
- CORS configuration
- Security headers via Nginx
- HTTPS enforced (Let's Encrypt SSL)
- Secrets never in codebase (use `.env.local`)

## 🎯 SEO & Schema.org

**Structured Data**: `src/lib/schemaMarkup.js` implements Schema.org types:
- `MedicalClinic` - Clinic business information
- `Physician` - Doctor profiles with credentials
- `LocalBusiness` - NAP (Name, Address, Phone) consistency
- `MedicalProcedure` - Service descriptions
- `FAQPage` - FAQ structured data

**SEO Utilities**:
- `src/hooks/useSEO.js` - Dynamic SEO hook for all pages
- `src/utils/schemaValidator.js` - Schema validation
- Prerendering via `scripts/prerender-pages.js`

## 🛠 Common Development Tasks

### Adding a Blog Post
1. Edit `src/data/blogPosts.js`
2. Follow existing structure (slug, title, excerpt, content, coverImage, etc.)
3. Add `CFMCompliance` field if medical content
4. Ensure cover image exists in `public/images/blog/covers/`
5. Run `npm run build` (includes validation)
6. Deploy with `npm run deploy`

### Adding a React Component
1. Create in `src/components/` with `PascalCase.jsx` naming
2. Use Tailwind CSS for styling
3. Add test in `src/components/__tests__/`
4. Export from component file
5. Import using `@/components/ComponentName` alias
6. Ensure WCAG 2.1 AA compliance (use Radix UI primitives)

### Adding a Next.js API Route (Ninsaúde)
1. Create route handler in `app/api/ninsaude/[endpoint]/route.ts`
2. Implement GET/POST/DELETE as needed
3. Add input validation (Zod schemas)
4. Handle authentication (OAuth2 tokens)
5. Add LGPD compliance checks for patient data
6. Create test in `app/api/ninsaude/__tests__/`
7. Test with `node scripts/test-nextjs-api-routes.cjs` (dev server running)

### Adding an Express API Endpoint (Legacy)
1. Create route in `api/` directory
2. Add test in `api/__tests__/`
3. Use middleware for validation/auth
4. Update CORS config if needed
5. Run `npm run test:api` to validate

## 🚀 Deployment

### VPS Native Deployment (Production)

**Infrastructure**: Nginx + PM2 + Node.js 22+ on Ubuntu VPS (31.97.129.78)
**Process**: Atomic releases with symlink swapping for zero-downtime

**Deploy Methods**:
1. **Full Deploy** (`npm run deploy`): Builds Vite + Next.js, updates Nginx config, restarts PM2
2. **Quick Deploy** (`npm run deploy:quick`): Frontend changes only (90% of cases)
3. **Manual Deploy**: SSH to VPS, run scripts in `/home/saraiva-vision-site/scripts/`

**File Structure on VPS**:
```
/var/www/saraivavision/
├── current → releases/YYYYMMDD_HHMMSS/dist  # Symlink (atomic swap)
├── releases/
│   ├── YYYYMMDD_HHMMSS/
│   │   ├── dist/              # Vite build (Nginx serves this)
│   │   ├── .next/             # Next.js build (PM2 runs this)
│   │   ├── app/               # Next.js source
│   │   └── .env.local         # Environment variables
│   └── (older releases kept for rollback)
└── shared/
    └── .next-cache/           # Shared Next.js cache
```

**Health Check**: `curl -f https://saraivavision.com.br/health` or `npm run deploy:health`

### Required Environment Variables

**Frontend (VITE_* prefix)**:
```bash
VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_PLACES_API_KEY=...
VITE_GOOGLE_PLACE_ID=...
```

**Backend/Next.js (no prefix)**:
```bash
# Ninsaúde API (Scheduling)
NINSAUDE_API_URL=https://api.ninsaude.com/v1
NINSAUDE_ACCOUNT=saraivavision
NINSAUDE_USERNAME=philipe
NINSAUDE_PASSWORD=Psc451992*
NINSAUDE_ACCOUNT_UNIT=1

# Next.js
NEXT_PUBLIC_API_URL=https://saraivavision.com.br

# Email
RESEND_API_KEY=...
```

**⚠️ CRITICAL**: These credentials are tested and working. Never commit to Git.

## 🔧 Troubleshooting

### Build Issues
- Ensure Node.js 22+ is installed (`node --version`)
- Check all environment variables are set in `.env.local`
- Clear caches: `rm -rf node_modules .next dist && npm install`
- Validate API files: `npm run validate:api`

### Next.js API Routes Return 502
- Check PM2 status: `pm2 status` (should show `saraiva-nextjs` running)
- Check logs: `pm2 logs saraiva-nextjs --lines 50`
- Test directly: `curl http://localhost:3002/api/ninsaude/auth`
- Restart: `pm2 restart saraiva-nextjs`

### Nginx Issues
- Check logs: `journalctl -u nginx --since "1 hour ago"`
- Test config: `sudo nginx -t`
- Reload: `sudo systemctl reload nginx`

### SSL Certificate Issues
- Renew: `sudo certbot renew`
- Check expiry: `sudo certbot certificates`

### Performance Degradation
- Check Web Vitals in browser DevTools
- Verify Redis cache is active
- Check Nginx cache headers (`Cache-Control` in response)
- Review bundle sizes: Look for chunks >250KB

### Ninsaúde Integration Issues
- Test OAuth directly: `node scripts/test-ninsaude-complete.cjs`
- Verify credentials in `.env.local` match production
- Check token expiry (15 min access, 15 day refresh)
- See `docs/NINSAUDE_INTEGRATION_SUCCESS.md` for troubleshooting

## 📚 Documentation

**Main Docs**:
- `docs/NINSAUDE_INTEGRATION_SUCCESS.md` - Complete Ninsaúde integration guide
- `docs/DEPLOY_HYBRID_GUIDE.md` - Detailed deployment procedures
- `docs/ARCHITECTURE_SUMMARY.md` - System architecture overview
- `docs/PROJECT_DOCUMENTATION.md` - Comprehensive project documentation

**Copilot/Cursor Instructions**: See `.github/copilot-instructions.md` for IDE-specific conventions

## 🎯 Project Priorities

1. **Medical Standards**: CFM compliance, patient safety, professional ethics
2. **Regulatory Compliance**: LGPD data protection, accessibility (WCAG 2.1 AA)
3. **Performance**: Sub-3s load times, optimized for Brazilian mobile networks
4. **Accessibility**: Screen reader support, keyboard navigation, semantic HTML
5. **Brazilian Market**: Portuguese language, local payment methods, regional SEO
