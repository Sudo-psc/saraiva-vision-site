<!-- Sync Impact Report -->
**Version Change**: 1.0.0 → 1.0.1
**Modified Principles**: None (initial constitution)
**Added Sections**: Core Principles, Accessibility Standards, Development Workflow
**Removed Sections**: None
**Templates Updated**:
- ✅ plan-template.md (constitution check section validated)
- ⚠ spec-template.md (requires accessibility compliance validation)
- ⚠ tasks-template.md (requires accessibility task categories)
**Follow-up TODOs**: None

# Saraiva Vision Constitution

## Core Principles

### I. Accessibility-First Development
Every component and feature MUST be developed with WCAG 2.1 AA compliance as a fundamental requirement. Accessibility is not an add-on but the foundation of all development work. All user interactions MUST be keyboard navigable, screen reader compatible, and meet color contrast standards. This principle supersedes aesthetic considerations when conflicts arise.

### II. Hybrid Architecture Integrity
The project operates on a strict hybrid architecture: React/Vite frontend on Vercel CDN, containerized backend services on VPS. Frontend and backend MUST remain separate with clear API boundaries. No backend logic shall be embedded in the frontend build process. All cross-component communication MUST flow through established API contracts.

### III. Medical Content Compliance
As a healthcare website serving ophthalmology patients, all content MUST meet medical accuracy standards and comply with healthcare regulations. Patient information MUST be handled with appropriate security measures. All medical claims MUST be verifiable and clinically accurate.

### IV. Performance Excellence
The site MUST maintain Lighthouse scores of 90+ across all metrics. All features MUST be developed with performance as a primary consideration. Code splitting, lazy loading, and optimization techniques MUST be applied systematically. Build processes MUST be monitored and optimized continuously.

### V. Internationalization by Design
All user-facing content MUST support Portuguese and English from the initial design phase. No hardcoded text shall exist in components. All content MUST be externalized to i18n translation files with proper fallback mechanisms.

## Development Standards

### Technology Stack Compliance
- **Frontend**: React 18.2.0 + Vite 7.1.3 + TypeScript 5.9.2
- **UI Framework**: Radix UI components with Tailwind CSS
- **Backend**: Node.js 22.x with containerized microservices
- **Database**: MySQL with Redis caching
- **Deployment**: Vercel for frontend, Docker Compose for backend services
- **Testing**: Vitest with React Testing Library

### Code Quality Standards
- All components MUST follow functional programming patterns with hooks
- TypeScript MUST be used for type safety in all new code
- Code splitting MUST be implemented at route level with React.lazy()
- Component files MUST use PascalCase naming convention
- All imports MUST use ES6 module syntax with proper path aliases

### Accessibility Requirements
- ARIA labels and descriptions MUST be present on all interactive elements
- Keyboard navigation MUST be implemented for all custom widgets
- Color contrast MUST meet WCAG 2.1 AA standards (4.5:1 minimum)
- Focus indicators MUST be clearly visible and follow system settings
- All form fields MUST have proper error handling and screen reader announcements
- Touch targets MUST be at least 44px in minimum dimension

## Architecture & Deployment

### Frontend Architecture
- Single Page Application (SPA) with React Router DOM 6.16.0
- Component structure: src/components/, src/pages/, src/hooks/, src/utils/
- Lazy loading for all route-level components with Suspense boundaries
- Service Worker implementation with Workbox for PWA capabilities
- Build process optimized for Vercel edge distribution

### Backend Services
- Containerized microservices using Docker and Docker Compose
- Nginx reverse proxy for traffic routing and security
- WordPress CMS for content management with REST API
- Custom Node.js API for business logic and integrations
- MySQL for primary data storage with Redis for performance caching

### Deployment Standards
- Frontend MUST be deployed to Vercel using configured deployment scripts
- Backend services MUST be deployed to Linux VPS (31.97.129.78)
- All deployments MUST include automated health checks and rollback procedures
- Environment variables MUST use VITE_ prefix for frontend variables
- Deployments MUST follow the intelligent deployment strategy with fallback mechanisms

## Development Workflow

### Build & Testing Requirements
- `npm run build` MUST pass without errors before any commit
- No automated testing framework is configured, manual testing is required
- All accessibility features MUST be manually validated with keyboard and screen reader
- Cross-browser testing MUST be performed on supported browsers
- Performance MUST be validated using Lighthouse before deployment

### Code Review Standards
- All changes MUST be reviewed for accessibility compliance
- Constitutional compliance MUST be verified for all pull requests
- Performance impact MUST be assessed for all new features
- Medical content MUST be reviewed for accuracy and compliance
- Internationalization MUST be validated for all user-facing text

### Version Control Practices
- All work MUST be done on feature branches, never directly on main/master
- Commit messages MUST follow conventional commit format
- All accessibility improvements MUST be clearly documented in commit messages
- Large changes MUST be broken down into smaller, reviewable commits
- Merge commits MUST include constitutional compliance validation

## Governance

### Amendment Procedures
- Constitutional amendments require unanimous approval from project maintainers
- All changes MUST be documented with clear rationale and impact assessment
- Amendments MUST include updates to all dependent templates and documentation
- Version MUST follow semantic versioning (MAJOR.MINOR.PATCH)
- All stakeholders MUST be notified of constitutional changes

### Compliance Requirements
- All development work MUST adhere to constitutional principles
- Deviations MUST be documented with justification and temporary approval
- Constitutional compliance MUST be verified before deployment
- Violations MUST be addressed before merging to main branches
- Regular audits MUST be conducted to ensure continued compliance

### Versioning Policy
- **MAJOR version**: Breaking changes to architecture or fundamental principles
- **MINOR version**: Addition of new principles or significant process changes
- **PATCH version**: Clarifications, wording improvements, or non-functional changes
- Version increments MUST be documented with clear change justifications
- All templates and documentation MUST be updated for version changes

### Enforcement & Review
- Constitution MUST be referenced in all pull request reviews
- Weekly compliance reviews MUST be conducted for active development
- Annual constitutional reviews MUST assess effectiveness and relevance
- Non-compliance issues MUST be addressed with documented resolution plans
- All team members MUST be trained on constitutional requirements

**Version**: 1.0.1 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23