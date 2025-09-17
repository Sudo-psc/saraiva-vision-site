# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is **Saraiva Vision** - a medical clinic website specializing in ophthalmology services. The site serves the Brazilian market with Portuguese as the primary language, focusing on accessibility, medical compliance, and trust signals for healthcare services.

**Key Business Requirements:**
- CFM (Medical Council) compliance for physician credentials
- LGPD (Brazilian data protection law) compliance
- WCAG 2.1 AA accessibility standards for healthcare
- Google Business Profile integration for local SEO
- WhatsApp Business integration for Brazilian communication patterns

## 📚 Quick Navigation

**New to the project?** Start here:
- [🚀 Developer Quick Start](./DEVELOPER_QUICK_START.md) - 5-minute setup guide
- [🌟 Complete Getting Started](./GETTING_STARTED.md) - Comprehensive beginner guide
- [📚 Documentation Index](./DOCUMENTATION_INDEX.md) - Navigate all documentation

**Need help?** Check these:
- [🔧 Troubleshooting Guide](./TROUBLESHOOTING.md) - Solutions for common problems
- [🔌 API Documentation](./docs/API_DESIGN_SPECIFICATION.md) - Complete API reference

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:5173 (port 3002 in vite.config)
- `npm run build` - Build for production (includes prebuild: generate-apple-icon)
- `npm run preview` - Preview production build
- `npm run serve` - Serve production build on port 3000

### Full Stack Development
- `npm run dev:full` - Interactive development menu via ./dev.sh script
- `npm run start:api` - Start API server only on port 3001 (node server.js)
- `npm run start` - Alias for vite development server

### Testing & Quality Assurance
- `npm run test` - Run tests in watch mode (Vitest)
- `npm run test:ui` - Run tests with UI interface
- `npm run test:run` - Run all tests once
- `npm run test:coverage` - Generate test coverage report with v8 provider
- `npm run test:gtm` - Run GTM-specific tests
- `npm run smoke:test` - Run smoke tests via bash script

### Verification & Validation
- `npm run verify` - Full verification suite (build + GTM + links + HTML + Lighthouse)
- `npm run verify:gtm` - Verify Google Tag Manager integration
- `npm run verify:links` - Check for broken links using linkinator
- `npm run verify:html` - Validate HTML using html-validate
- `npm run verify:lighthouse` - Run Lighthouse CI tests
- `npm run verify:docs` - Validate documentation structure

### Image & Asset Pipeline
- `npm run images:build` - Build optimized images using pipeline
- `npm run images:check` - Check image optimization status
- `npm run images:optimize` - Run image optimization script
- `npm run audio:duration` - Calculate audio file durations

### Deployment
- `npm run deploy:local` - Deploy locally using sudo ./deploy.sh
- `./dev.sh` - Interactive development environment setup
- `sudo ./deploy.sh` - Production deployment with atomic releases

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with Vite 7.1.3, Tailwind CSS 3.3.3, Framer Motion 10.16.4
- **UI Components**: Radix UI primitives with custom design system (comprehensive palette)
- **Routing**: React Router v6.16.0 with lazy loading for all pages
- **Internationalization**: React i18next 23.11.5 with pt/en support
- **Backend**: 
  - Supabase 2.30.0 for data storage
  - Node.js server (server.js) for API routes development
  - Serverless functions in `/api` for production
- **Testing**: Vitest 2.0.0 + React Testing Library 16.3.0 + jsdom
- **Maps**: Google Maps API with @googlemaps/js-api-loader 1.16.10
- **Analytics**: Web Vitals 5.1.0 monitoring + Google Tag Manager integration
- **CMS**: WordPress headless integration for blog functionality
- **PWA**: Workbox service worker with custom plugin
- **Image Processing**: Sharp 0.33.5 for optimization pipeline

### Code Organization

#### `/src` Structure
- `/components` - Reusable UI components
  - `/ui` - Base components (Button, Toast, etc.)
  - `/icons` - Custom icons (flags, service icons)
  - `/ServiceDetail` - Service page specific components
  - `/__tests__` - Component tests
- `/pages` - Route components with lazy loading
- `/hooks` - Custom React hooks
- `/lib` - Core utilities and configurations
- `/contexts` - React context providers
- `/locales` - i18n translation files (pt.json, en.json)
- `/utils` - Helper functions and utilities

#### Key Architecture Patterns

**Lazy Loading**: All pages are lazy-loaded to optimize initial bundle size and TTI
```javascript
const HomePage = lazy(() => import('@/pages/HomePage'));
```

**Design System**: Comprehensive design system with:
- Brand colors (brand-blue, brand-green, medical-blue, trust-green)
- Typography scale (display-xl to caption)
- 8pt spacing grid system
- Custom animations and keyframes

**Internationalization**: 
- Automatic language detection
- URL structure maintains `/` for PT, future `/en` support
- Centralized translations in `/locales`

**Performance Optimization**:
- Code splitting by routes and features
- Manual chunk configuration for vendor libraries
- Asset optimization with organized output structure
- Core Web Vitals monitoring

### Component Patterns

**Medical Clinic Focus**: 
- Service-oriented components (Services, ServiceDetail)
- Contact/scheduling integration (Contact, GoogleMap)
- Trust signals (Testimonials, GoogleReviews)
- Accessibility compliance (WCAG 2.1 AA)

**Responsive Design**:
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl, 2xl)
- Adaptive navigation (mobile menu in Navbar)

**SEO Optimization**:
- React Helmet for meta tags
- Schema markup for medical business
- Sitemap generation during build
- Social media meta tags

### Data Management

**Centralized Configuration**: `/lib/clinicInfo.js` contains all clinic information
- Address, contact details
- Google Places integration
- Social media links
- Physician credentials (CFM compliance)
- LGPD compliance data

**External Integrations**:
- Google Maps API (with fallback)
- Google Reviews (serverless function)
- WhatsApp Business integration
- Supabase for contact forms

### Testing Strategy

**Test Organization**: Tests co-located in `__tests__` directories
- Component tests for UI behavior
- Integration tests for user flows
- Coverage reporting with Vitest

**Key Test Patterns**:
- React Testing Library for component testing
- Mock external APIs (Google Maps, Supabase)
- Accessibility testing included

### Deployment & Infrastructure

**Build Configuration**:
- Terser minification with console removal
- CSS minification with esbuild
- Asset organization by type
- Source map disabled for production

**Nginx Configuration**: Included in repo root
- Security headers
- Gzip compression
- SPA fallback routing

**Environment Variables**:
- Google Maps API key
- Supabase configuration
- Google Place ID for reviews

## Development Guidelines

### Component Development
- Use functional components with hooks
- Implement proper TypeScript-style prop destructuring
- Follow accessibility patterns (WCAG 2.1 AA)
- Use design system tokens from Tailwind config

### Styling Conventions
- Tailwind CSS utility-first approach
- Custom design system colors and typography
- Responsive design with mobile-first breakpoints
- Consistent spacing using 8pt grid system

### Performance Requirements
- Lighthouse score 90+ on all metrics
- Core Web Vitals compliance
- Lazy loading for all routes
- Image optimization with WebP

### Medical Compliance
- CFM (Conselho Federal de Medicina) compliance for physician info
- LGPD (Brazilian data protection) compliance
- Accessibility standards for healthcare websites
- Professional medical content review required

### Internationalization
- All user-facing strings must use i18next
- Default language: Portuguese (pt)
- Secondary language: English (en)
- Cultural considerations for medical terminology

## API Endpoints

### Development Server
- `/api/reviews` - Google Reviews integration (dev proxy)
- `/api/contact` - Contact form submission
- `/api/env-debug` - Environment variable debug info

### Serverless Functions (Production)
- `/api/reviews.js` - Google Places API reviews
- `/api/contact.js` - Contact form processing

## Development Commands Details

### Interactive Development
```bash
./dev.sh                    # Interactive menu: frontend only, full stack, or build+preview
```

### Testing Commands
```bash
npm run test                # Watch mode with Vitest
npm run test:ui            # Visual test interface
npm run test:run           # Single run, all tests
npm run test:coverage      # Coverage report (v8 provider)
npm run test:gtm           # GTM integration tests only
npm run smoke:test         # Basic functionality smoke tests
```

### Quality Assurance
```bash
npm run verify             # Complete verification suite
npm run verify:gtm         # Google Tag Manager validation
npm run verify:links       # Link checker (linkinator)
npm run verify:html        # HTML validation
npm run verify:lighthouse  # Performance audit
npm run verify:docs        # Documentation validation
```

### Asset Pipeline
```bash
npm run images:build       # Generate optimized images
npm run images:check       # Verify image optimization
npm run images:optimize    # Run optimization scripts
npm run audio:duration     # Calculate audio file durations
```

## Key Architectural Decisions

1. **Lazy Loading All Pages**: Improves TTI for home page, all routes code-split in App.jsx
2. **Centralized Clinic Info**: `/lib/clinicInfo.js` as single source of truth with validation
3. **Widget System**: Fixed widgets outside transform container to avoid CSS positioning issues
4. **Service Worker Integration**: Custom Workbox plugin for caching and offline functionality
5. **Atomic Deployments**: Release-based deployment with symlinks for zero-downtime updates
6. **WordPress Headless**: CMS integration via REST API for blog functionality
7. **Medical Compliance First**: CFM/LGPD compliance built into data structures
8. **Performance Monitoring**: Real User Metrics (RUM) with Web Vitals collection
9. **Security-First**: CSP headers, input validation, API key restrictions
10. **Accessibility Focus**: WCAG 2.1 AA compliance with dedicated accessibility component

## Important Configuration Files

### Core Configuration
- **`vite.config.js`** - Development server (port 3002), WordPress proxy, Workbox plugin
- **`vitest.config.js`** - Test configuration with jsdom, coverage settings, path aliases
- **`tailwind.config.js`** - Comprehensive design system with medical-focused color palette
- **`server.js`** - Development API server for `/api/*` routes (port 3001)

### Deployment & Infrastructure
- **`deploy.sh`** - Production deployment script with atomic releases and verification
- **`dev.sh`** - Interactive development environment setup
- **`nginx*.conf`** - Various nginx configurations for different environments
- **`package.json`** - Complete scripts including verification, image processing, testing

### Environment & Secrets
- **`.env.example`** - Template with all required environment variables
- **`.env`** - Actual secrets (not in repo) - Google APIs, Supabase, GTM, etc.

## Medical & Legal Compliance Notes

**CRITICAL**: This is a medical clinic website serving Brazilian patients:

1. **CFM Compliance**: All physician information must include CRM number and state registration
2. **LGPD Compliance**: Data protection officer contact required, consent management implemented
3. **Accessibility**: WCAG 2.1 AA minimum for healthcare accessibility requirements
4. **Brazilian Standards**: Portuguese language, Brazilian phone formatting, local business schema
5. **Security**: HTTPS only, CSP headers, input validation, secure cookie handling

## WordPress Integration Architecture

The project uses WordPress as a headless CMS for blog functionality:

- **Development**: Proxy `/wp-json/*` to `localhost:8083`
- **Production**: Direct API calls to WordPress REST API
- **Components**: BlogPage, PostPage, CategoryPage consume WordPress data
- **Admin**: Separate WordPress admin interface accessed via AdminLoginPage

## Performance & Monitoring

- **Web Vitals**: Real user metrics collection via `/api/web-vitals`
- **GTM Integration**: Google Tag Manager with consent management
- **Image Pipeline**: Sharp-based optimization with WebP conversion
- **Service Worker**: Workbox caching strategies for offline functionality
- **Lighthouse CI**: Automated performance auditing in verification suite

## 📖 Additional Resources

For comprehensive documentation and guides:
- **[📚 Documentation Index](./DOCUMENTATION_INDEX.md)** - Complete documentation navigation
- **[🚀 Quick Start Guide](./DEVELOPER_QUICK_START.md)** - Fast setup for experienced developers
- **[🌟 Getting Started](./GETTING_STARTED.md)** - Complete guide for beginners
- **[🔧 Troubleshooting](./TROUBLESHOOTING.md)** - Solutions for common development issues
- **[🔌 API Reference](./docs/API_DESIGN_SPECIFICATION.md)** - Complete API documentation
- **[🎨 Brand Guide](./docs/BRAND_GUIDE.md)** - Design system and visual guidelines
- **[🧪 Testing Guide](./docs/TESTING_GUIDE.md)** - Comprehensive testing strategies
- **[🏗️ System Architecture](./docs/SYSTEM_ARCHITECTURE.md)** - Technical architecture overview