# 📚 Saraiva Vision - Comprehensive Project Documentation Index

*Generated on: 2025-09-01*

## 🎯 Quick Navigation

| Category | Description | Quick Links |
|----------|-------------|-------------|
| [**🚀 Getting Started**](#-getting-started) | Setup, installation, development | [Installation](#installation), [Development](#development) |
| [**🏗️ Architecture**](#️-project-architecture) | System design, structure, patterns | [Tech Stack](#tech-stack), [File Structure](#file-structure) |
| [**🧩 Components**](#-components-reference) | UI components, API reference | [Component API](#component-api), [Design System](#design-system) |
| [**📋 Documentation**](#-existing-documentation) | All project docs, guides, reports | [Technical Docs](#technical-documentation), [Reports](#reports--analysis) |
| [**🛠️ Development**](#️-development-resources) | Tools, scripts, configuration | [Scripts](#npm-scripts), [Testing](#testing-framework) |
| [**🚀 Deployment**](#-deployment--production) | Build, deploy, monitoring | [Build Process](#build-configuration), [Security](#security-implementation) |

---

## 🚀 Getting Started

### Installation
```bash
git clone https://github.com/your-org/saraiva-vision-site.git
cd saraiva-vision-site
npm install
```

### Development Commands
- `npm run dev` - Development server (localhost:5173)
- `npm run dev:full` - Full stack with API server
- `npm run build` - Production build
- `npm run test` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Environment Setup
Create `.env` file with:
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps integration
- `VITE_GOOGLE_PLACE_ID` - Google Business Profile
- `VITE_SUPABASE_URL` - Backend service
- `VITE_SUPABASE_ANON_KEY` - Database access

---

## 🏗️ Project Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **UI Components**: Radix UI primitives with custom design system
- **Routing**: React Router v6 with lazy loading
- **Internationalization**: React i18next (pt/en)
- **Backend**: Supabase + serverless functions
- **Testing**: Vitest + React Testing Library
- **Build**: Vite with optimized production configuration

### File Structure
```
saraiva-vision-site/
├── public/                    # Static assets
│   ├── img/                  # Images and media
│   ├── robots.txt           # SEO crawler rules
│   └── sitemap.xml          # Generated sitemap
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── icons/          # Custom icons
│   │   ├── ServiceDetail/  # Service-specific components
│   │   └── __tests__/      # Component tests
│   ├── pages/              # Route components (lazy loaded)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Core utilities & config
│   ├── contexts/           # React context providers
│   ├── locales/            # i18n translation files
│   ├── utils/              # Helper functions
│   └── data/               # Static data & configuration
├── api/                    # Serverless functions
├── docs/                   # Project documentation
├── scripts/                # Utility scripts
└── Configuration Files:
    ├── vite.config.js      # Build configuration
    ├── tailwind.config.js  # Styling system
    ├── vitest.config.js    # Testing setup
    └── nginx.conf          # Production server config
```

### Architecture Patterns
- **Component-First**: Modular, reusable UI components
- **Lazy Loading**: Route-based code splitting for performance
- **Centralized Configuration**: `clinicInfo.js` for business data
- **Performance Optimization**: Manual chunking, asset optimization
- **Security-First**: CSP headers, input validation, HTTPS enforcement

---

## 🧩 Components Reference

### Core Components
- **Navigation**: `Navbar.jsx` - Responsive navigation with mobile menu
- **Hero Section**: Landing page with call-to-actions
- **Services**: Medical services presentation
- **Contact System**: Form with validation & reCAPTCHA
- **Reviews Integration**: Google Reviews widget
- **Accessibility**: WCAG 2.1 AA compliant components

### UI System
- **Design Tokens**: Centralized in `tailwind.config.js`
- **Component Library**: Based on Radix UI primitives
- **Custom Icons**: Medical-specific iconography
- **Responsive Design**: Mobile-first approach
- **Animation System**: Framer Motion integration

### Component API
Refer to:
- [`/docs/COMPONENTS_API.md`](/home/saraiva-vision-site/docs/COMPONENTS_API.md) - Complete API reference
- [`/docs/COMPONENT_DESIGN_SYSTEM.md`](/home/saraiva-vision-site/docs/COMPONENT_DESIGN_SYSTEM.md) - Design system guide
- [`/docs/DESIGN_SYSTEM_INDEX.md`](/home/saraiva-vision-site/docs/DESIGN_SYSTEM_INDEX.md) - Style guide index

---

## 📋 Existing Documentation

### Technical Documentation
| Document | Purpose | Location |
|----------|---------|----------|
| [**System Architecture**](/home/saraiva-vision-site/docs/SYSTEM_ARCHITECTURE.md) | Technical architecture overview | `/docs/` |
| [**API Design Specification**](/home/saraiva-vision-site/docs/API_DESIGN_SPECIFICATION.md) | Backend API documentation | `/docs/` |
| [**Implementation Guide**](/home/saraiva-vision-site/docs/IMPLEMENTATION_GUIDE.md) | Development workflows | `/docs/` |
| [**Testing Guide**](/home/saraiva-vision-site/docs/TESTING_GUIDE.md) | Testing strategies & patterns | `/docs/` |
| [**Claude.md**](/home/saraiva-vision-site/CLAUDE.md) | AI development guidelines | Root |

### Brand & Content
| Document | Purpose | Location |
|----------|---------|----------|
| [**Brand Guide**](/home/saraiva-vision-site/docs/BRAND_GUIDE.md) | Visual identity & brand standards | `/docs/` |
| [**Medical Content Strategy**](/home/saraiva-vision-site/docs/MEDICAL_CONTENT_STRATEGY.md) | Content guidelines for healthcare | `/docs/` |
| [**Design System**](/home/saraiva-vision-site/DESIGN_SYSTEM.md) | UI design standards | Root |

### Reports & Analysis
| Document | Purpose | Location |
|----------|---------|----------|
| [**SEO Audit Report**](/home/saraiva-vision-site/SEO_AUDIT_REPORT.md) | SEO analysis & recommendations | Root |
| [**SEO Implementation Summary**](/home/saraiva-vision-site/SEO_IMPLEMENTATION_SUMMARY.md) | SEO improvements tracking | Root |
| [**Performance Test Report**](/home/saraiva-vision-site/performance-test.md) | Performance metrics & optimization | Root |
| [**Accessibility Report**](/home/saraiva-vision-site/accessibility-report.md) | WCAG compliance analysis | Root |
| [**Test Report**](/home/saraiva-vision-site/TEST_REPORT.md) | Testing coverage & results | Root |

### Development & Maintenance
| Document | Purpose | Location |
|----------|---------|----------|
| [**TODOs**](/home/saraiva-vision-site/TODOS.md) | Development roadmap | Root |
| [**Security Fixes**](/home/saraiva-vision-site/SECURITY_FIXES.md) | Security implementations | Root |
| [**CSP Corrections Summary**](/home/saraiva-vision-site/CSP_CORRECTIONS_SUMMARY.md) | Content Security Policy | Root |
| [**Migration Success**](/home/saraiva-vision-site/MIGRATION_SUCCESS.md) | Platform migration notes | Root |

---

## 🛠️ Development Resources

### NPM Scripts
```json
{
  "dev": "vite",                              // Development server
  "build": "vite build",                      // Production build
  "preview": "vite preview",                  // Preview production build
  "test": "vitest",                           // Run tests (watch mode)
  "test:run": "vitest run",                   // Run tests (single run)
  "test:coverage": "vitest run --coverage",   // Coverage report
  "start:api": "node server.js",             // API server only
  "dev:full": "./dev.sh",                    // Full stack development
  "serve": "vite preview --port 3000",       // Serve production build
  "deploy:local": "sudo ./deploy.sh"         // Local deployment
}
```

### Testing Framework
- **Test Runner**: Vitest with JSDOM environment
- **Component Testing**: React Testing Library
- **Coverage**: V8 coverage reports
- **Test Organization**: Co-located `__tests__` directories
- **Mocking**: External APIs (Google Maps, Supabase)

### Build Configuration
**Vite Configuration** (`vite.config.js`):
- **Development Server**: Hot reload, CORS enabled, security headers
- **Production Build**: Terser minification, manual chunking, asset optimization
- **Code Splitting**: Vendor libraries separated, lazy-loaded routes
- **CSP Integration**: Content Security Policy headers for security

**Tailwind Configuration** (`tailwind.config.js`):
- **Design System**: Custom color palette, typography scale
- **Component Variants**: Class Variance Authority integration
- **Responsive Design**: Mobile-first breakpoints
- **Performance**: JIT compilation, CSS purging

---

## 🚀 Deployment & Production

### Build Process
1. **Environment Validation**: Check required environment variables
2. **Asset Optimization**: Image compression, CSS minification
3. **Code Splitting**: Vendor chunks, lazy-loaded routes
4. **Bundle Analysis**: Manual chunking for optimal loading
5. **Sitemap Generation**: Automatic sitemap.xml creation
6. **Service Worker**: Workbox PWA integration (production)

### Security Implementation
- **HTTPS Enforcement**: SSL/TLS required
- **CSP Headers**: Strict Content Security Policy
- **Input Validation**: Form data sanitization
- **reCAPTCHA**: Spam protection for contact forms
- **LGPD Compliance**: Brazilian data protection compliance

### Performance Optimization
- **Core Web Vitals**: Lighthouse scores 90+
- **Lazy Loading**: Images and routes
- **Caching Strategy**: Service worker with Workbox
- **Bundle Optimization**: Vendor separation, tree shaking
- **CDN Ready**: Asset organization for CDN deployment

### Production Environment
- **Server**: Nginx with optimized configuration
- **SSL**: Let's Encrypt certificate management
- **Monitoring**: Performance and uptime monitoring
- **Backup**: Automated backup strategies
- **Deployment**: Docker support with deployment scripts

---

## 🔧 Configuration Files Reference

| File | Purpose | Key Features |
|------|---------|-------------|
| `vite.config.js` | Build configuration | Dev server, production optimization, API endpoints |
| `tailwind.config.js` | Styling system | Design tokens, responsive breakpoints, components |
| `vitest.config.js` | Testing setup | Test environment, coverage, mocking |
| `postcss.config.js` | CSS processing | Tailwind integration, autoprefixer |
| `package.json` | Dependencies & scripts | NPM scripts, dependency management |
| `nginx.conf` | Production server | Security headers, gzip, SPA routing |

---

## 📈 Performance Metrics

### Current Performance
- **Lighthouse Score**: 90+ on all metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Cumulative Layout Shift**: <0.1
- **Bundle Size**: Initial <500KB, Total <2MB

### Monitoring
- **Web Vitals**: Real-time performance monitoring
- **Error Tracking**: Global error handlers
- **Analytics**: Google Analytics integration
- **Performance Budgets**: Automated threshold monitoring

---

## 🤝 Contributing Guidelines

1. **Development Workflow**: Feature branches, pull requests
2. **Code Standards**: ESLint configuration, component patterns
3. **Testing Requirements**: Component tests, integration tests
4. **Documentation**: Update relevant docs with changes
5. **Performance**: Maintain performance budgets
6. **Accessibility**: WCAG 2.1 AA compliance required

---

## 📞 Project Information

**Saraiva Vision - Clínica Oftalmológica**
- **Location**: Caratinga, MG, Brazil
- **Address**: Rua Catarina Maria Passos, 97 - Santa Zita
- **Phone**: +55 33 99860-1427
- **Email**: saraivavision@gmail.com
- **Instagram**: [@saraiva_vision](https://www.instagram.com/saraiva_vision/)

**Technical Specifications**:
- **Medical Compliance**: CFM (Conselho Federal de Medicina) compliant
- **Data Protection**: LGPD (Brazilian GDPR) compliant
- **Accessibility**: WCAG 2.1 AA standard
- **Performance**: Core Web Vitals optimized
- **Security**: HTTPS, CSP, input validation

---

*This documentation index is maintained automatically. Last updated: 2025-09-01*
*For specific technical questions, refer to individual documentation files linked above.*