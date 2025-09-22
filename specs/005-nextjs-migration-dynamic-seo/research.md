# Next.js Migration Research

## Research Findings

### Next.js Version and Features
**Decision**: Next.js 14 with App Router
**Rationale**:
- App Router provides better SEO features out of the box
- Improved performance with React Server Components
- Built-in metadata APIs for dynamic SEO
- Better TypeScript support
- Simplified data fetching patterns

**Alternatives considered**:
- Next.js 13 with Pages Router (older pattern, less optimal for SEO)
- Custom React solution (requires more SEO implementation work)

### WordPress Headless CMS Integration
**Decision**: Continue with WordPress REST API + enhance with Next.js data fetching
**Rationale**:
- Preserve existing content structure
- WordPress is already configured and working
- Next.js can fetch data at build time and request time
- Supports incremental static regeneration for performance

**Integration patterns**:
- `getStaticProps` for static content (services, about pages)
- `getServerSideProps` for dynamic content (appointment forms, user-specific data)
- ISR (Incremental Static Regeneration) for semi-dynamic content

### SEO Implementation Strategy
**Decision**: Leverage Next.js built-in SEO features + custom enhancements
**Rationale**:
- Next.js Metadata API provides dynamic metadata generation
- Automatic sitemap generation
- Built-in image optimization for Core Web Vitals
- Support for structured data through custom components

**Key SEO features to implement**:
1. **Dynamic Metadata**: Using Next.js `generateMetadata` function
2. **Sitemaps**: `next-sitemap` package for automatic generation
3. **Structured Data**: JSON-LD components for medical services
4. **Open Graph**: Dynamic social media sharing cards
5. **Canonical URLs**: Automatic canonical URL management
6. **Robots.txt**: Dynamic robots.txt generation

### Performance Optimization
**Decision**: Next.js built-in optimizations + custom enhancements
**Rationale**:
- Automatic code splitting
- Image optimization with Next.js Image component
- Font optimization
- Prefetching for navigation
- Support for modern web standards

**Performance targets**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Overall Lighthouse score: 90+

### Migration Approach
**Decision**: Incremental migration with feature parity first
**Rationale**:
- Minimize risk by migrating one component at a time
- Maintain existing functionality during transition
- SEO improvements can be added incrementally
- Allows for testing and validation at each step

**Migration phases**:
1. **Setup**: Next.js project structure, configuration, basic routing
2. **Layout**: Header, footer, navigation components
3. **Pages**: Home page, service pages, blog pages
4. **Forms**: Contact forms, appointment booking
5. **SEO**: Metadata, sitemaps, structured data
6. **Optimization**: Performance tuning, testing, deployment

### Technology Stack Finalization
**Decision**: Confirmed stack based on research
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Existing WordPress REST API
- **Deployment**: Vercel for frontend, existing VPS for backend
- **Testing**: Jest, React Testing Library, Playwright
- **SEO**: Next.js built-in features + next-sitemap, schema-dts

### Internationalization
**Decision**: Next.js built-in i18n with Portuguese as primary language
**Rationale**:
- Built-in SEO benefits for multilingual content
- Proper hreflang generation
- Locale-specific routing
- Easy to add English support later if needed

### Accessibility
**Decision**: WCAG 2.1 AA compliance with semantic HTML and ARIA
**Rationale**:
- Medical website requires high accessibility standards
- Next.js promotes semantic HTML structure
- Good for SEO and user experience
- Legal compliance requirements

## Resolved Unknowns
All NEEDS CLARIFICATION items from Technical Context have been resolved through this research phase. The implementation approach is now well-defined and ready for Phase 1 design.