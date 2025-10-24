# Saraiva Vision - Documentation Index

This directory contains comprehensive documentation for the Saraiva Vision medical website project.

## Documentation Structure

### 📋 Main Documentation
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** - Complete project documentation (3,000+ lines)
  - Project overview and architecture
  - Frontend and backend implementation details
  - Recent improvements and WordPress compatibility layer
  - Component system and API integration patterns
  - Development workflows and testing strategies
  - Deployment guide and VPS configuration
  - Troubleshooting and maintenance procedures

### 🏗️ Architecture Documents
- **[CLAUDE.md](../CLAUDE.md)** - Project context for Claude Code
- **[NATIVE_VPS_DEPLOYMENT.md](../NATIVE_VPS_DEPLOYMENT.md)** - Native VPS deployment guide
- **[TROUBLESHOOTING.md](../TROUBLESHOOTING.md)** - Common issues and solutions

### 📝 CMS Migration Planning (Sanity.io)

**🎯 Quick Start:** Read [Executive Summary PT](./SANITY_MIGRATION_EXECUTIVE_SUMMARY_PT.md) for business overview (10 min)

Complete documentation for migrating blog from static JS to Sanity.io CMS:

**For Decision Makers:**
- **[SANITY_MIGRATION_EXECUTIVE_SUMMARY_PT.md](./SANITY_MIGRATION_EXECUTIVE_SUMMARY_PT.md)** ⭐ START HERE
  - Portuguese business summary
  - ROI: R$ 8,100/year savings, 16-month payback
  - Publishing speed: 30x faster (60min → 2min)
  - Cost: R$ 11k implementation + R$ 0-500/mês
  - FAQ and decision criteria

**For Technical Review:**
- **[SANITY_MIGRATION_QUICKSTART.md](./SANITY_MIGRATION_QUICKSTART.md)** - Quick reference (15 min)
  - Before/after comparison
  - Architecture diagram
  - Go/No-Go decision matrix
  
- **[SANITY_TECHNICAL_COMPARISON.md](./SANITY_TECHNICAL_COMPARISON.md)** - CMS evaluation (20 min)
  - 5 options compared (Sanity 9.1/10 ✅ RECOMMENDED)
  - Detailed scoring and ROI analysis

**For Implementation:**
- **[SANITY_MIGRATION_PLAN.md](./SANITY_MIGRATION_PLAN.md)** - Complete technical spec (30 min)
  - Architecture design (build-time fetching)
  - Sanity schemas with code examples
  - Migration strategy and integration guide
  - 7-9 weeks timeline, phase breakdown
  - Testing and compliance requirements
  
- **[SANITY_MIGRATION_CHECKLIST.md](./SANITY_MIGRATION_CHECKLIST.md)** - Implementation guide
  - 7 phases, 180+ actionable tasks
  - Progress tracking template
  - Testing requirements per phase

**Key Metrics:**
- Current: 32 posts, 60min to publish, dev dependency
- After: Visual editor, 2min to publish, zero dev dependency
- Timeline: 7-9 weeks implementation
- Cost: R$ 11k dev + R$ 0/mês (Free tier) or R$ 500/mês (Growth)
- ROI: 121% in 3 years

### 🚀 Quick Start Guides

#### For Developers
```bash
# 1. Clone and setup
git clone https://github.com/Sudo-psc/saraiva-vision-site.git
cd saraiva-vision-site
npm install

# 2. Configure environment
cp .env.example .env
# Fill in required environment variables

# 3. Start development
npm run dev
```

#### For DevOps
```bash
# 1. VPS setup
wget https://raw.githubusercontent.com/Sudo-psc/saraiva-vision-site/main/setup-vps-native.sh
chmod +x setup-vps-native.sh
sudo ./setup-vps-native.sh

# 2. Deploy application
./deploy-vps-native.sh
```

## Key Features Documented

### ✅ Technical Architecture
- **React 18** with TypeScript and Vite
- **Native VPS deployment** without Docker
- **Hybrid database** (Supabase + MySQL)
- **WordPress headless CMS** integration
- **Medical compliance** (CFM + LGPD)

### ✅ Recent Achievements
- **VPS Migration**: Complete migration from Vercel to native VPS
- **WordPress Compatibility**: GraphQL integration with backward compatibility
- **ReferenceError Resolution**: Fixed ES module compatibility issues
- **Performance Optimization**: Sub-3 second load times achieved
- **Security Enhancement**: Comprehensive input validation and monitoring

### ✅ Development Excellence
- **Type Safety**: Full TypeScript implementation
- **Testing Coverage**: Unit, integration, and E2E tests
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance Monitoring**: Real-time metrics and Core Web Vitals
- **Error Resilience**: Comprehensive error boundaries

### ✅ Operational Readiness
- **Automated Deployment**: Single-command deployment with validation
- **Health Monitoring**: Comprehensive service monitoring
- **Backup Systems**: Daily, weekly, and monthly automated backups
- **Security Monitoring**: SSL, vulnerability scanning, and log analysis

## Quick Navigation

| Topic | Document Section | Description |
|-------|------------------|-------------|
| **Getting Started** | [Development Workflows](./PROJECT_DOCUMENTATION.md#development-workflows) | Local setup and development |
| **Architecture** | [Architecture & Technology Stack](./PROJECT_DOCUMENTATION.md#architecture--technology-stack) | System design and components |
| **CMS Migration** | [Sanity Migration Plan](./SANITY_MIGRATION_PLAN.md) | Blog migration to Sanity.io |
| **Recent Changes** | [Recent Improvements & Fixes](./PROJECT_DOCUMENTATION.md#recent-improvements--fixes) | Latest updates and fixes |
| **API Integration** | [API Integration Patterns](./PROJECT_DOCUMENTATION.md#api-integration-patterns) | External service integrations |
| **Deployment** | [Deployment Guide](./PROJECT_DOCUMENTATION.md#deployment-guide) | VPS deployment procedures |
| **Troubleshooting** | [Troubleshooting](./PROJECT_DOCUMENTATION.md#troubleshooting) | Common issues and solutions |
| **Maintenance** | [Maintenance & Monitoring](./PROJECT_DOCUMENTATION.md#maintenance--monitoring) | Ongoing operational tasks |

## Project Context

**Saraiva Vision** is a modern medical clinic website for ophthalmology services in Caratinga, Minas Gerais, Brazil. The project serves as a comprehensive digital healthcare platform featuring:

- **Patient Management**: Registration, profiles, and appointment booking
- **Medical Content**: Blog articles, podcast episodes, educational resources
- **Multi-channel Communication**: Email, SMS, WhatsApp integration
- **Social Integration**: Instagram feed, Google Reviews, testimonials
- **Regulatory Compliance**: CFM (Brazilian Medical Council) and LGPD compliance
- **Accessibility**: Full WCAG 2.1 AA compliance for inclusive healthcare

## Technology Highlights

### Frontend Stack
- **React 18.2.0** with concurrent features
- **TypeScript 5.9.2** for type safety
- **Vite 7.1.7** for fast builds
- **Tailwind CSS 3.3.3** for styling
- **Framer Motion 12.23.19** for animations

### Backend Stack
- **Node.js 22+** with ES modules
- **Supabase 2.30.0** for primary database
- **MySQL** for WordPress and caching
- **Redis** for session management
- **Nginx** for web server and proxy

### Development Tools
- **Vitest 3.2.4** for testing
- **ESLint 9.36.0** for code quality
- **Radix UI** for accessible components
- **React Testing Library** for component testing

## Recent Major Updates

### VPS Deployment Optimization (September 2024)
- ✅ Complete migration from Vercel to native VPS
- ✅ ES module compatibility fixes (ReferenceError resolution)
- ✅ WordPress GraphQL integration with compatibility layer
- ✅ Performance optimization and build system improvements
- ✅ Security enhancements and monitoring systems
- ✅ Automated deployment scripts and health checks

### Medical Compliance Integration
- ✅ CFM (Brazilian Medical Council) compliance validation
- ✅ LGPD (Brazilian GDPR) data protection implementation
- ✅ Medical content disclaimer systems
- ✅ Patient data anonymization and security
- ✅ Audit logging for regulatory compliance

## Support and Maintenance

### For Immediate Issues
1. Check [Troubleshooting Section](./PROJECT_DOCUMENTATION.md#troubleshooting)
2. Review [Common Issues and Solutions](./PROJECT_DOCUMENTATION.md#common-issues-and-solutions)
3. Use emergency recovery procedures if site is down

### For Development Questions
1. Review [Development Workflows](./PROJECT_DOCUMENTATION.md#development-workflows)
2. Check [Component System](./PROJECT_DOCUMENTATION.md#component-system) documentation
3. Consult [API Integration Patterns](./PROJECT_DOCUMENTATION.md#api-integration-patterns)

### For Deployment and Operations
1. Follow [Deployment Guide](./PROJECT_DOCUMENTATION.md#deployment-guide)
2. Use [VPS Deployment Scripts](../NATIVE_VPS_DEPLOYMENT.md)
3. Implement [Monitoring Systems](./PROJECT_DOCUMENTATION.md#maintenance--monitoring)

## Contributing

When contributing to this project:

1. **Read the Documentation**: Start with the main PROJECT_DOCUMENTATION.md
2. **Follow Conventions**: Adhere to the established coding standards and patterns
3. **Test Thoroughly**: Ensure all tests pass and add new tests for new features
4. **Update Documentation**: Keep documentation current with any changes
5. **Security First**: Always consider medical data protection and compliance

## Contact and Support

- **Repository**: [GitHub - Saraiva Vision Site](https://github.com/Sudo-psc/saraiva-vision-site)
- **Live Site**: [https://saraivavision.com.br](https://saraivavision.com.br)
- **Documentation**: This docs/ directory contains all technical documentation

---

*This documentation is maintained to provide comprehensive guidance for developers, DevOps engineers, and system administrators working with the Saraiva Vision medical website project.*