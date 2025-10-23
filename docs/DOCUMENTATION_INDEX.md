# Documentation Index - Saraiva Vision

Complete guide to all project documentation.

## Core Documentation

### Project Overview
- **[CLAUDE.md](/home/saraiva-vision-site/CLAUDE.md)** - Main project documentation for Claude Code
  - Architecture overview
  - Development commands
  - File structure
  - Deployment process
  - Troubleshooting guide

- **[README.md](/home/saraiva-vision-site/README.md)** - Quick start guide
  - Quick deploy instructions
  - Tech stack overview
  - Basic commands

## Features Documentation

### Subscription Plans
- **[Planos Flex](/home/saraiva-vision-site/docs/features/planos-flex.md)** - Detailed feature documentation
  - Feature overview and business value
  - Technical implementation
  - User experience flow
  - Testing strategy
  - Troubleshooting
  - Future enhancements

- **[Planos Flex Summary](/home/saraiva-vision-site/docs/PLANOS_FLEX_SUMMARY.md)** - Quick reference
  - Key information
  - Configuration values
  - Common issues
  - Quick commands

## Integration Guides

### Payment Processing
- **[Stripe Integration](/home/saraiva-vision-site/docs/integrations/stripe-integration.md)** - Technical reference
  - API configuration
  - Frontend implementation
  - Backend webhooks
  - Payment flow
  - Subscription management
  - Monitoring and troubleshooting

### Webhooks
- **[Webhooks API Guide](/home/saraiva-vision-site/docs/Webhooks-API-Guide.md)** - Comprehensive webhook documentation
  - Webhook architecture
  - Event handling
  - Security best practices

- **[Webhooks Quickstart](/home/saraiva-vision-site/docs/Webhooks-Quickstart.md)** - Quick setup guide
  - Basic configuration
  - Testing webhooks
  - Common patterns

## Deployment Documentation

### Deployment Guides
- **[Deployment Guide](/home/saraiva-vision-site/docs/deployment/DEPLOYMENT_GUIDE.md)** - Complete deployment documentation
  - Environment setup
  - Build process
  - Deployment strategies
  - Rollback procedures

### Deployment Scripts
- **[DEPLOY_NOW.sh](/home/saraiva-vision-site/DEPLOY_NOW.sh)** - One-command deployment script
- **[deploy-atomic.sh](/home/saraiva-vision-site/scripts/deploy-atomic.sh)** - Atomic deployment with rollback
- **[deploy-atomic-local.sh](/home/saraiva-vision-site/scripts/deploy-atomic-local.sh)** - Local atomic deployment

## Operational Documentation

### System Health
- **[System Health Check](/home/saraiva-vision-site/scripts/system-health-check.sh)** - Full system diagnostics
  - Nginx status
  - API health
  - SSL certificates
  - Resource usage

- **[Security Health Check](/home/saraiva-vision-site/scripts/security-health-check.sh)** - Security audit
  - Security headers
  - Rate limiting
  - Vulnerability scanning

### Troubleshooting
- **[TROUBLESHOOTING.md](/home/saraiva-vision-site/TROUBLESHOOTING.md)** - Common issues and solutions
  - Build problems
  - Deployment issues
  - Runtime errors

### Security
- **[SECURITY.md](/home/saraiva-vision-site/SECURITY.md)** - Security practices
  - Security policies
  - Vulnerability reporting
  - Compliance requirements

## Architecture Documentation

### System Architecture
- **[Architecture Review](/home/saraiva-vision-site/docs/architecture-review.md)** - System design overview
  - Component architecture
  - Data flow
  - Integration patterns

### API Documentation
- Located in `api/src/` directory
  - Express server configuration
  - Route handlers
  - Middleware
  - Webhook handlers

## Testing Documentation

### Test Files
- **Unit Tests**: `src/**/__tests__/*.test.js`
- **Integration Tests**: `api/__tests__/**/*.test.js`
- **API Tests**: `api/__tests__/api/*.test.js`
- **Frontend Tests**: `src/**/__tests__/*.test.jsx`

### Testing Commands
```bash
npm run test              # Run all tests in watch mode
npm run test:run          # Run tests once
npm run test:comprehensive # Full test suite
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests only
npm run test:api          # API tests only
npm run test:frontend     # Frontend tests only
npm run test:coverage     # Tests with coverage report
```

## Report Locations

### System Reports
- **System Checkups**: `reports/system-checkup/`
  - Nginx performance
  - API health
  - Resource usage
  - Security status

### Build Reports
- **Build Reports**: Root directory
  - `BUILD_REPORT.md` - Build analysis
  - `FETCH_ERRORS_EXECUTIVE_SUMMARY.md` - Error summaries

## Configuration Files

### Frontend Configuration
- **[vite.config.js](/home/saraiva-vision-site/vite.config.js)** - Vite build configuration
  - Bundle splitting
  - Build optimization
  - Plugin configuration

- **[tailwind.config.js](/home/saraiva-vision-site/tailwind.config.js)** - Tailwind CSS configuration
  - Custom colors
  - Theme extensions
  - Plugin setup

- **[package.json](/home/saraiva-vision-site/package.json)** - NPM configuration
  - Dependencies
  - Scripts
  - Project metadata

### Backend Configuration
- **API Config**: `api/src/lib/`
  - Clinic information
  - API settings
  - Integration configs

### Server Configuration
- **Nginx**: `/etc/nginx/sites-enabled/saraivavision`
  - Routing rules
  - CSP headers
  - Rate limiting

- **Systemd**: API service configuration
  - Service definition
  - Auto-restart
  - Environment variables

## Data Files

### Static Content
- **[Blog Posts](/home/saraiva-vision-site/src/data/blogPosts.js)** - Blog content
- **[Podcast Episodes](/home/saraiva-vision-site/src/data/podcastEpisodes.js)** - Podcast content
- **[Clinic Info](/home/saraiva-vision-site/src/lib/clinicInfo.js)** - Clinic configuration

### Assets
- **Blog Images**: `public/Blog/`
- **Podcast Covers**: `public/Podcasts/`

## Development Guides

### Getting Started
1. Read [README.md](/home/saraiva-vision-site/README.md) for quick overview
2. Read [CLAUDE.md](/home/saraiva-vision-site/CLAUDE.md) for detailed project information
3. Review [CONTRIBUTING.md](/home/saraiva-vision-site/CONTRIBUTING.md) (if exists) for contribution guidelines

### Working with Features
1. Check `docs/features/` for feature-specific documentation
2. Review integration documentation in `docs/integrations/`
3. Follow development workflow in CLAUDE.md

### Deployment Workflow
1. Local development: `npm run dev:vite`
2. Build: `npm run build:vite`
3. Test: `npm run test:run`
4. Deploy: `sudo npm run deploy:quick`
5. Monitor: `npm run deploy:health`

## External Documentation

### Technologies
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **React Router**: https://reactrouter.com

### Integrations
- **Stripe**: https://stripe.com/docs
- **Supabase**: https://supabase.com/docs
- **Google Maps**: https://developers.google.com/maps
- **Resend**: https://resend.com/docs

### Tools
- **Vitest**: https://vitest.dev
- **ESLint**: https://eslint.org
- **Prettier**: https://prettier.io

## Quick Reference Sheets

### Commands Cheatsheet
```bash
# Development
npm run dev:vite          # Frontend dev server
npm run dev               # API dev server
npm test                  # Run tests

# Build
npm run build:vite        # Production build

# Deploy
sudo npm run deploy:quick # Quick deployment
npm run deploy:health     # Health check

# System
npm run check:system      # Full system diagnostic
sudo systemctl status saraiva-api  # API status
```

### File Locations Cheatsheet
```
Frontend: src/
Backend: api/
Docs: docs/
Scripts: scripts/
Config: Root directory
Production: /var/www/saraivavision/current/
```

### Port Cheatsheet
```
Frontend Dev: 3002 (Vite)
API Dev: 3000 (Next.js compatibility)
API Production: 3001 (Express)
Nginx: 443 (HTTPS)
```

## Documentation Maintenance

### When to Update
- New features deployed → Create feature documentation
- Integration added → Create integration guide
- Major changes → Update CLAUDE.md
- Bug fixes → Update TROUBLESHOOTING.md
- API changes → Update API documentation

### Documentation Standards
- Use Markdown format
- Include code examples
- Add troubleshooting sections
- Provide quick reference summaries
- Keep changelog at bottom of feature docs

### Review Schedule
- **Weekly**: Check accuracy of quick reference docs
- **Monthly**: Review and update main documentation
- **After Deploy**: Update relevant feature documentation
- **Quarterly**: Comprehensive documentation audit

## Contributing to Documentation

### Adding New Documentation
1. Determine appropriate location (features/, integrations/, etc.)
2. Follow existing documentation structure
3. Include all required sections
4. Update this index file
5. Link from related documents

### Documentation Structure Template
```markdown
# [Feature/Topic Name]

## Overview
Brief description and purpose

## [Relevant Sections]
Detailed content

## Quick Reference
Key information

## Troubleshooting
Common issues

## Related Documentation
Links to related docs

---
Last Updated: YYYY-MM-DD
Status: Production/Beta/Draft
```

## Support & Contact

**Project Owner**: Dr. Philipe Saraiva Cruz
**Production URL**: https://saraivavision.com.br
**Environment**: Production VPS (31.97.129.78)

---

**Last Updated**: 2025-10-23
**Documentation Version**: 1.0.0
**Project Version**: 3.4.0
