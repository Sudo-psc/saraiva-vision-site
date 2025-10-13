# Saraiva Vision Constitution

<!--
SYNC IMPACT REPORT
==================
Version Change: INITIAL → 1.0.0
Ratification Date: 2025-10-13

New Constitution Structure:
- Core Principles (7 principles defined)
- Healthcare Compliance Requirements
- Development Workflow
- Governance

Templates Requiring Updates:
✅ plan-template.md - Constitution Check section references this document
✅ spec-template.md - Aligns with TDD and requirement principles
✅ tasks-template.md - TDD ordering and parallel execution principles applied

Follow-up TODOs: None - All placeholders filled with concrete project values
-->

## Core Principles

### I. Healthcare Compliance First (NON-NEGOTIABLE)
All code, content, and data handling MUST comply with Brazilian healthcare regulations (CFM) and data protection law (LGPD). Medical content requires validation by CFM-qualified professionals. Patient data MUST NOT appear in frontend code. WCAG 2.1 AA accessibility compliance is mandatory for healthcare equity. PII detection and consent management are required throughout the platform.

**Rationale**: Legal requirement for healthcare platforms in Brazil. Non-compliance risks patient safety, legal liability, and platform shutdown.

### II. Test-First Development (NON-NEGOTIABLE)
TDD is mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. No implementation without failing tests. Contract tests for all API endpoints. Integration tests for all user journeys. Unit tests for critical business logic.

**Rationale**: Healthcare platforms require exceptional reliability. TDD prevents regressions that could impact patient care and ensures testable, maintainable code architecture.

### III. Security by Design
All user inputs sanitized using DOMPurify + custom validation. Rate limiting enforced at Nginx level (contact: 5/min, API: 30/min, webhooks: 10/min). Content Security Policy (CSP) headers on all responses. XSS protection through HTML tag removal and JS protocol filtering. Input validation using Zod schemas. No secrets in code - environment variables only.

**Rationale**: Healthcare data attracts malicious actors. Defense-in-depth security protects patient information and maintains platform trust.

### IV. Performance and User Experience
Bundle sizes <200KB per chunk with manual code splitting. Lazy loading for all route components. Image optimization with WebP/AVIF formats. Target Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1. Static content preferred over database queries for performance.

**Rationale**: Medical information seekers need fast, reliable access. Performance directly impacts user trust and SEO rankings for healthcare content.

### V. Static-First Architecture
Blog posts defined as JavaScript objects in `src/data/blogPosts.js`. No database or CMS dependencies for content. Images in `public/Blog/` with optimized formats. Client-side search via array filtering. Prerendering for SEO optimization.

**Rationale**: Eliminates database costs, improves performance, simplifies deployment, and ensures content availability even under high load.

### VI. Dual Build Architecture
Frontend MUST use Vite build (`npm run build:vite`). Backend API runs on Node.js/Express (port 3001). Nginx serves static files and proxies API requests. Never use Next.js build for production frontend deployment. Atomic deployments with automatic rollback capability.

**Rationale**: Vite provides optimal performance for React SPA. Separation of concerns enables independent frontend/backend scaling and deployment.

### VII. Code Organization and Maintainability
Components use PascalCase naming (`ContactForm.jsx`). Hooks and utilities use camelCase (`useAuth.js`). Services use camelCase classes (`googleBusinessService.js`). TypeScript for type safety (no `any` types). Functional components with React Hooks only (no class components). Clear separation: components, pages, hooks, services, utilities.

**Rationale**: Consistent patterns reduce cognitive load, enable faster onboarding, and prevent common bugs through type safety.

## Healthcare Compliance Requirements

### Medical Content Validation
- All blog posts must be factually accurate and CFM-compliant
- Medical claims require supporting evidence or disclaimers
- Content must be reviewed by healthcare professionals before publication
- No diagnostic, treatment, or prescription claims without appropriate disclaimers

### Data Privacy (LGPD)
- PII detection via `src/utils/healthcareCompliance.js`
- Explicit consent required before collecting personal data
- Data minimization: collect only what's necessary
- User rights: access, rectification, deletion, portability
- Data retention policies documented and enforced

### Accessibility Standards
- WCAG 2.1 Level AA compliance mandatory
- Keyboard navigation fully functional
- Screen reader compatibility verified
- Color contrast ratios meet minimum standards
- Alternative text for all medical images

### Security Requirements
- SSL/TLS encryption for all connections (HTTPS only)
- Rate limiting to prevent abuse and DDoS
- Input sanitization for all user-provided data
- Security headers (CSP, X-Frame-Options, HSTS)
- Regular security audits and dependency updates

## Development Workflow

### Feature Development Process
1. **Specification** (`/specify`): Create feature spec with user scenarios, acceptance criteria, functional requirements
2. **Planning** (`/plan`): Research unknowns, design contracts, create data models, update CLAUDE.md
3. **Task Generation** (`/tasks`): Break design into ordered, testable tasks with parallel execution marked
4. **Implementation**: Execute tasks following TDD principles
5. **Validation**: Run tests, execute manual testing, verify compliance

### Testing Requirements
- **Contract Tests**: One test per API endpoint, verify request/response schemas
- **Integration Tests**: One test per user story, validate end-to-end flows
- **Unit Tests**: Critical business logic, validation rules, utility functions
- **Performance Tests**: Core Web Vitals, bundle sizes, API response times
- **Accessibility Tests**: WCAG compliance, keyboard navigation, screen readers

### Code Review Standards
- All PRs must pass automated tests
- Security review for user input handling
- Healthcare compliance review for medical content
- Performance impact assessment for frontend changes
- Accessibility verification for UI modifications

### Deployment Protocol
- Use `npm run build:vite` for frontend builds (NOT `npm run build`)
- Run comprehensive test suite before deployment
- Execute atomic deployment with automatic rollback on failure
- Verify deployment with health checks and smoke tests
- Monitor error rates and performance metrics post-deployment

## Governance

### Constitutional Authority
This constitution supersedes all other development practices and guidelines. When conflicts arise between this document and other documentation, the constitution takes precedence. All code reviews, planning decisions, and architectural choices must verify compliance with constitutional principles.

### Amendment Procedure
1. **Proposal**: Document proposed amendment with rationale and impact analysis
2. **Review**: Technical lead and stakeholders review for compliance, security, and feasibility
3. **Approval**: Requires consensus from technical lead and product owner
4. **Migration**: Create migration plan for existing code affected by amendment
5. **Documentation**: Update all dependent templates and guidance documents
6. **Communication**: Announce amendment to all team members with transition timeline

### Versioning Policy
Constitution follows semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Backward-incompatible governance changes or principle removals/redefinitions
- **MINOR**: New principles added or materially expanded guidance
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review
- All feature specifications must reference relevant constitutional principles
- Planning phase includes mandatory "Constitution Check" gate
- Tasks must be ordered to respect TDD and testing principles
- Code reviews verify adherence to security, compliance, and quality standards
- Quarterly constitutional review to assess effectiveness and identify needed amendments

### Deviation Handling
Deviations from constitutional principles require explicit justification:
1. Document specific principle being violated
2. Explain why deviation is necessary
3. Describe simpler alternatives considered and rejected
4. Assess risk and mitigation strategy
5. Obtain approval from technical lead before proceeding

Deviations are tracked in feature `plan.md` Complexity Tracking section.

### Runtime Guidance
For day-to-day development guidance beyond constitutional principles, refer to:
- **CLAUDE.md**: Agent-specific development context and common workflows
- **docs/deployment/DEPLOYMENT_GUIDE.md**: Deployment procedures and troubleshooting
- **SECURITY.md**: Security practices and API key management
- **TROUBLESHOOTING.md**: Common issues and solutions

**Version**: 1.0.0 | **Ratified**: 2025-10-13 | **Last Amended**: 2025-10-13
**Author**: Dr. Philipe Saraiva Cruz
