# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- **Type**: React SPA with Vite (frontend) + Next.js (minimal API backend)
- **Location**: Caratinga, MG, Brazil 🇧🇷
- **VPS**: 31.97.129.78 (native, no Docker)
- **Production**: `/var/www/saraivavision/current/` served by Nginx
- **Status**: ✅ Production | 🏥 Healthcare | ⚖️ CFM/LGPD Compliant

## Architecture Overview

### Dual Architecture Pattern
```
Frontend (Vite/React SPA) → Backend (Next.js API minimal)
        ↓                           ↓
   Static Files (Nginx)      Node.js Express Service
        ↓                           ↓
   /var/www/saraivavision/current   API Endpoints only
```

### Key Components
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Next.js (API routes only, no pages)
- **Blog**: 100% static data in `src/data/blogPosts.js`
- **Cache**: Redis for Google Reviews only
- **Web Server**: Nginx (static files + API proxy)

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
│   ├── lib/                # Utilities + LGPD compliance
│   ├── data/               # Static data (blogPosts.js)
│   ├── utils/              # Helper functions
│   ├── services/           # API service functions
│   └── __tests__/          # Frontend tests
├── api/                    # Backend API (Node.js/Express)
│   ├── src/                # API source code
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── utils/              # API utilities
│   └── __tests__/          # API tests
├── public/                 # Static assets
├── scripts/                # Build and deployment scripts
└── docs/                   # Project documentation
```

### Build Flow
```
Source Code → Build → Deploy
src/ → dist/ (Vite) → /var/www/saraivavision/current/
api/ → .next/ (Next.js) → API routes only
```

### Key Configuration Files
- `vite.config.js` - Frontend build configuration
- `next.config.js` - Backend API configuration (minimal)
- `src/lib/clinicInfo.js` - Frontend clinic configuration
- `api/src/lib/clinicInfo.js` - Backend clinic configuration
- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Styling configuration

### Build Outputs
- ✅ `/dist/` - Vite build output (USE THIS)
- ❌ `/.next/` - Next.js build (API routes only, NOT for frontend)
- ✅ `/var/www/saraivavision/current/` - Production files served by Nginx

## Environment Variables

### Required Environment Variables
```bash
# Frontend (Vite)
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anonymous key
VITE_GOOGLE_MAPS_API_KEY=    # Google Maps API key
VITE_GOOGLE_PLACES_API_KEY=  # Google Places API key
VITE_GOOGLE_PLACE_ID=        # Google Place ID for clinic
VITE_BASE_URL=               # Base URL (production: https://saraivavision.com.br)

# Backend (API)
RESEND_API_KEY=              # Resend email service key
NODE_ENV=production          # Environment mode
```

### Optional but Recommended
```bash
# Analytics
VITE_GA_ID=                  # Google Analytics 4 ID
VITE_GTM_ID=                 # Google Tag Manager ID
VITE_POSTHOG_KEY=            # PostHog analytics key

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
- **Files**: Use `.jsx` for React components, `.js` for utilities
- **Imports**: Use `@/` alias for `src/` directory
- **Testing**: Co-locate tests with source files using `__tests__/` or `.test.js`

### File Organization
```
src/
├── components/      # Reusable UI components
├── pages/          # Route-level components (lazy loaded)
├── hooks/          # Custom React hooks
├── lib/            # Core utilities + LGPD compliance
├── data/           # Static data (blogPosts.js)
├── utils/          # Helper functions
├── services/       # API integration
└── __tests__/      # Test files
```

### Performance Guidelines
- **Lazy Loading**: All route components use lazy loading
- **Bundle Size**: Keep chunks under 200KB for optimal loading
- **Images**: Optimize with WebP/AVIF formats
- **Code Splitting**: Automatic via Vite with manual chunk optimization
- **Prerendering**: Static pages prerendered for SEO

### Healthcare Compliance
- **CFM**: Medical content validation required
- **LGPD**: PII detection and consent management
- **Accessibility**: WCAG 2.1 AA compliance
- **Data Privacy**: No patient data in frontend code

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
npm run dev  # Start Next.js dev server
curl http://localhost:3000/api/health
```

## Key Features & Integrations

### Core Features
- **Google Reviews Integration**: 136+ reviews (4.9/5 rating), 30 req/min rate limit
- **Static Blog System**: SEO-friendly with client-side search, zero dependencies
- **Appointment System**: Integrated with WhatsApp and contact forms
- **Medical Content**: CFM-compliant healthcare information
- **Podcast Platform**: Medical podcast episodes with streaming

### Third-Party Integrations
- **Google Maps/Places**: Clinic location and directions
- **Resend**: Transactional email service
- **Instagram**: Social media integration
- **WhatsApp**: Contact and appointment booking
- **Spotify**: Podcast streaming integration

### Performance Features
- **Lazy Loading**: All route components load on-demand
- **Service Worker**: Offline caching and updates
- **Image Optimization**: WebP/AVIF with fallbacks
- **Bundle Splitting**: Optimized chunks for healthcare platform
- **Prerendering**: SEO-critical pages pre-rendered

## Development Workflow

### Making Changes
1. **Read existing code** before making changes
2. **Plan approach** (use TodoWrite for multi-step tasks)
3. **Test locally** with `npm run dev:vite` and `npm run test:run`
4. **Build** with `npm run build:vite`
5. **Deploy** with `npm run deploy:quick`
6. **Verify** deployment in production

### Git Workflow
- Always create feature branches (never work directly on main)
- Use descriptive commit messages: `type(scope): description`
- Run `git status` before committing
- Never auto-commit without review

### Testing Strategy
```bash
# Run comprehensive test suite before major changes
npm run test:comprehensive

# Test specific areas
npm run test:api         # API endpoints
npm run test:frontend    # Frontend components
npm run test:cover-images # Blog image validation
```

## Production Considerations

### Healthcare Compliance
- All medical content must be CFM compliant
- LGPD consent management required
- No patient data in frontend code
- Accessibility (WCAG 2.1 AA) mandatory

### Performance Monitoring
- Monitor bundle sizes (<200KB per chunk)
- Check Core Web Vitals regularly
- Verify image optimization
- Test loading performance

### Security Requirements
- PII detection and protection
- Secure API endpoint design
- Regular security audits
- SSL certificate management

## Additional Documentation

- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Security**: `SECURITY.md`
- **Project Overview**: `docs/saraiva-vision-comprehensive-documentation.md`

---

**Last Updated**: 2025-01-08
**Version**: 3.0.0
**Status**: ✅ Production Ready
