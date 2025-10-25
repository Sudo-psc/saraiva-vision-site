# Saraiva Vision - Documentation Index

**Última Atualização**: 2025-10-25
**Mantenedor**: Dr. Philipe Saraiva Cruz
**Status**: ✅ Production Ready

## 🚀 Quick Links

### Essential Guides
- [📖 README](../README.md) - Quick start and project overview
- [🤖 CLAUDE.md](../CLAUDE.md) - Complete development guide for AI assistants
- [⚙️ AGENTS.md](../AGENTS.md) - Build commands and code style for all AI agents
- [🔒 SECURITY.md](../SECURITY.md) - Security practices and compliance
- [🔧 TROUBLESHOOTING.md](../TROUBLESHOOTING.md) - Common issues and solutions

### Quick Deploy
```bash
# On VPS (already logged in)
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

### Development
```bash
npm run dev:vite          # Frontend dev server (port 3002)
npm run build:vite        # Production build (ALWAYS use this)
sudo npm run deploy:quick # Quick deploy (90% of cases)
```

---

## 📐 Architecture Documentation

### System Architecture
- **[Blog Architecture](architecture/BLOG_ARCHITECTURE.md)** - 100% static blog system (no CMS/WordPress)
  - Static content workflow with `src/data/blogPosts.js`
  - Image optimization (WebP/AVIF)
  - SEO and performance optimization
  - Build and deployment process

### Development Guidelines
- **[SEO Components Guide](guidelines/SEO_COMPONENTS_GUIDE.md)** - SafeHelmet vs SEOHead decision matrix
  - When to use SafeHelmet (~3KB, simple pages)
  - When to use SEOHead (~14KB, medical pages with i18n)
  - Component testing requirements

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js/Express (port 3001) + systemd service
- **Blog**: 100% static (JS objects, no CMS)
- **Cache**: Redis (Google Reviews only)
- **Server**: Nginx (static files + API proxy)
- **Testing**: Vitest (unit, integration, E2E)

---

## 🔧 Deployment & Operations

### Deployment Guides
- **[Deployment Guide](deployment/DEPLOYMENT_GUIDE.md)** - Complete deployment procedures
- **[Deploy Quick Guide](DEPLOY_GUIDE.md)** - Fast deployment reference

### System Health
```bash
npm run check:system                  # Comprehensive health check
npm run deploy:health                 # Production health check
bash scripts/system-health-check.sh   # Full system diagnostics
```

### Service Management
```bash
# API Service Control
sudo systemctl status saraiva-api     # Check status
sudo systemctl restart saraiva-api    # Restart API
sudo journalctl -u saraiva-api -f     # View logs

# Nginx Control
sudo systemctl reload nginx           # Reload config
sudo systemctl status nginx           # Check status
```

---

## 📋 Feature Specifications

All feature specs are located in `/specs/` directory. See [Spec Status Tracking](../specs/README.md) for implementation status.

### Active Specs
1. **[001-backend-integration-strategy](../specs/001-backend-integration-strategy/)** - API integration architecture
2. **[001-medical-appointment-api](../specs/001-medical-appointment-api/)** - Appointment system
3. **[002-resend-contact-form](../specs/002-resend-contact-form/)** - Email contact forms
4. **[003-backend-integration-strategy](../specs/003-backend-integration-strategy/)** - Backend patterns
5. **[005-wordpress-external-integration](../specs/005-wordpress-external-integration/)** - WordPress migration
6. **[009-frontend-performance-optimization](../specs/009-frontend-performance-optimization/)** - Performance improvements
7. **[404-page](../specs/404-page/)** - Custom error page

---

## 🧪 Testing Documentation

### Test Commands
```bash
npm run test              # Tests in watch mode
npm run test:run          # Run tests once
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:api          # API tests only
npm run test:frontend     # Frontend tests only
npm run test:comprehensive # Full test suite
npm run test:ui           # Vitest UI
```

### Test Strategy
- **Unit Tests**: `src/**/__tests__/*.test.js`
- **Integration Tests**: `src/__tests__/integration/`
- **API Tests**: `api/src/__tests__/`
- **E2E Tests**: `tests/e2e/`

### Coverage Requirements
- ConfigProvider wrapper required for components using `useConfig` hook
- See [Testing Architecture](../CLAUDE.md#testing-architecture) for details

---

## 🔌 Integrations

### Third-Party Services
- **[Google Business Integration](GOOGLE_REVIEWS_INTEGRATION.md)** - Reviews caching and display
- **[Analytics Setup](ANALYTICS_IMPLEMENTATION.md)** - GA4, GTM, PostHog
- **[Contact Forms](CONTACT_FORM_BACKEND.md)** - Resend email integration
- **[Stripe Integration](integrations/)** - Payment and subscriptions

### API Documentation
- **[API Functions Guide](API-Functions-Guide.md)** - Backend API reference
- **[Webhooks Guide](WEBHOOK-SETUP.md)** - Webhook setup and handling

---

## 🎨 Frontend Development

### Component Guidelines
- **Components**: PascalCase (`ContactForm.jsx`)
- **Hooks/Utils**: camelCase (`useAuth.js`)
- **Services**: camelCase classes (`googleBusinessService.js`)
- **Imports**: Use `@/` alias for `src/` directory

### Performance
- **[Performance Optimization](PERFORMANCE_OPTIMIZATION.md)** - Optimization strategies
- **[Image Optimization](IMAGE_OPTIMIZATION_GUIDE.md)** - WebP/AVIF optimization
- **Bundle Size**: Target <200KB per chunk
- **Lazy Loading**: All routes use React.lazy()

### Blog Development
- **[Blog Integration Guide](BLOG_INTEGRATION_GUIDE.md)** - Working with blog system
- **[Blog Image Guidelines](BLOG_IMAGE_GUIDELINES.md)** - Image requirements
- **[Blog Posts Audit](BLOG_POSTS_AUDIT_REPORT.md)** - Content quality audit

---

## 🔒 Security & Compliance

### Security Documentation
- **[Security Practices](../SECURITY.md)** - Security overview
- **[LGPD Compliance](LGPD_COMPLIANCE_REQUIREMENTS.md)** - Data protection requirements
- **[CSP Implementation](CSP-Implementation-Guide.md)** - Content Security Policy

### Recent Security Updates (2025-10-08)
- ✅ XSS Protection with DOMPurify
- ✅ API Validation with Zod schemas
- ✅ Webhook Security improvements
- ✅ Input Validation with length limits

### Healthcare Compliance
- **CFM**: Medical content validation required
- **LGPD**: PII detection and consent management
- **Accessibility**: WCAG 2.1 AA compliance
- **Data Privacy**: No patient data in frontend

---

## 📊 Monitoring & Analytics

### System Monitoring
- **[Logging & Monitoring](LOGGING_MONITORING_SYSTEM.md)** - System monitoring setup
- **[Production Error Diagnosis](Production-Error-Diagnosis.md)** - Error tracking
- **Reports**: Stored in `reports/system-checkup/`

### Analytics
- Google Analytics 4: `G-LXWRK8ELS6`
- Google Tag Manager: `GTM-KF2NP85D`
- PostHog: `phc_bpyxyy0AVVh2E9LhjkDfZhi2vlfEsQhOBkijyjvyRSp`

---

## 🗄️ Archive

Historical documentation stored in `/archive/`:
- Old implementation reports
- Legacy Nginx configurations
- Deprecated build/deploy scripts
- Historical test files

**Archive Organization Date**: 2025-10-10 (68 files moved)

---

## 📝 Documentation Standards

### Document Metadata
All documentation should include:
```markdown
**Autor**: Dr. Philipe Saraiva Cruz
**Data**: YYYY-MM-DD
**Status**: [Draft | Review | Approved | Deprecated]
```

### Version Control
- Documentation changes commit with `docs:` prefix
- Use conventional commits format
- Update "Last Updated" dates when modifying

### Review Schedule
- **Core Guides**: Monthly or on major changes
- **Architecture Docs**: Quarterly or on architectural changes
- **Feature Specs**: After implementation completion
- **Security Docs**: After security updates

---

## 🆘 Getting Help

### Common Issues
See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for:
- Build issues (Vite vs Next.js confusion)
- CSP/Security header problems
- Environment variable issues
- API service problems
- Deployment failures

### Development Workflow
See [CLAUDE.md - Development Workflow](../CLAUDE.md#development-workflow) for:
1. Reading existing code
2. Running tests
3. Local testing
4. Building
5. Deploying
6. Verification

### Support Resources
- **Project Repository**: Git history and issues
- **System Health Reports**: `reports/system-checkup/`
- **Error Solutions Index**: [ERROR_SOLUTIONS_INDEX.md](ERROR_SOLUTIONS_INDEX.md)

---

## 🎯 Project Status

**Current Version**: 3.5.1
**Status**: ✅ Production
**URL**: https://saraivavision.com.br
**Compliance**: CFM + LGPD
**Location**: Caratinga, MG, Brazil 🇧🇷

### Recent Updates (October 2025)
- ✅ SEO component architecture documented
- ✅ Blog architecture fully documented
- ✅ SafeHelmet migration completed
- ✅ Path inconsistencies resolved
- ✅ Root directory organized
- ✅ Security vulnerabilities resolved

---

**Mantenedor**: Dr. Philipe Saraiva Cruz
**Revisão**: Monthly or on significant changes
**Feedback**: Report issues or suggest improvements via Git
