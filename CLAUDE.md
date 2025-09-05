# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:coverage` - Generate test coverage report

### Full Stack Development
- `npm run dev:full` - Run full development stack with API server (uses ./dev.sh)
- `npm run start:api` - Start API server only (node server.js)

### Deployment
- `npm run deploy:local` - Deploy locally using sudo ./deploy.sh
- `npm run serve` - Serve production build on port 3000

## Project Architecture

### Tech Stack
- **Frontend**: React 18 with Vite, Tailwind CSS, Framer Motion
- **UI Components**: Radix UI primitives with custom design system
- **Routing**: React Router v6 with lazy loading for performance
- **Internationalization**: React i18next with pt/en support
- **Backend**: Supabase for data, serverless functions in `/api`
- **Testing**: Vitest + React Testing Library
- **Maps**: Google Maps API integration
- **Analytics**: Web Vitals monitoring

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

## Testing Commands

Run specific test suites:
```bash
npm run test -- --run components  # Test components only
npm run test -- --run pages      # Test pages only
npm run test:coverage             # Full coverage report
```

## Known Architectural Decisions

1. **Lazy Loading All Pages**: Improves TTI for home page at cost of slight delay on navigation
2. **Centralized Clinic Info**: Single source of truth prevents inconsistencies across components
3. **No SSR**: SPA approach chosen for deployment simplicity and dynamic content
4. **Tailwind Over CSS Modules**: Utility-first for rapid medical site development
5. **Radix UI Base**: Accessibility-first component library for healthcare compliance

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