# Spec 008 - Blog System with Sanity CMS

**Author**: Dr. Philipe Saraiva Cruz
**Status**: ✅ Implemented
**Priority**: High
**Created**: 2024-09-20
**Completed**: 2024-10-26
**Last Updated**: 2025-11-16

## Overview

Hybrid blog architecture combining Sanity CMS (headless CMS) with static fallback for 100% uptime guarantee. Provides professional content management with automatic failover to ensure blog availability even when Sanity is unreachable.

## Business Context

**Problem Statement**:
- WordPress integration added complexity and maintenance overhead
- Need for modern, headless CMS for better content management
- Requirement for 100% uptime (critical for healthcare SEO)
- Content should be accessible even during CMS downtime

**Solution**:
Implement dual-source blog system:
1. **Primary**: Sanity CMS for easy content management
2. **Fallback**: Static posts for guaranteed availability
3. **Circuit Breaker**: 5-second timeout with automatic switching
4. **No User Impact**: Transparent failover

**Business Goals**:
- Professional blog platform for healthcare content
- SEO optimization for organic traffic growth
- Easy content management for non-technical users
- 100% uptime guarantee for content availability
- CFM compliance for medical content

## Technical Specification

### Architecture

```
BlogPage Component
       ↓
sanityBlogService.js
       ↓
┌──────────────────────────────┐
│  Try: Sanity CMS API         │
│  - Project: 92ocrdmp         │
│  - Timeout: 5 seconds        │
│  - Exponential retry         │
│  - In-memory caching         │
└──────┬───────────────────────┘
       │
       ├──── Success → Return Sanity data
       │
       └──── Failure → Fallback
              ↓
       ┌─────────────────────────┐
       │  Static Posts            │
       │  - src/data/blogPosts.js │
       │  - Zero network calls    │
       │  - Always available      │
       └─────────────────────────┘
```

### Sanity CMS Configuration

**Project Details**:
- Project ID: `92ocrdmp`
- Dataset: `production`
- API Version: `2024-01-01`
- CDN: Enabled for image optimization

**Content Model**:
```javascript
{
  _id: string,              // Unique identifier
  title: string,            // Post title
  slug: { current: string }, // URL slug
  author: reference,        // Author reference
  mainImage: image,         // Featured image
  categories: array,        // Categories
  publishedAt: datetime,    // Publication date
  body: array,             // Portable Text content
  excerpt: text,           // Short description
  seo: object             // SEO metadata
}
```

**GROQ Queries**:
```groq
// Get all posts
*[_type == "post"] | order(publishedAt desc)

// Get post by slug
*[_type == "post" && slug.current == $slug][0]

// Get recent posts
*[_type == "post"] | order(publishedAt desc)[0..2]

// Get featured posts
*[_type == "post" && featured == true] | order(publishedAt desc)[0..2]

// Search posts
*[_type == "post" && (title match $query || body[].children[].text match $query)]
```

### File Structure

```
src/
├── lib/
│   ├── sanityClient.js           # Universal client (Vite + Node.js)
│   └── sanityUtils.js            # GROQ queries, transformations
├── services/
│   └── sanityBlogService.js      # Main service with circuit breaker
├── components/
│   └── PortableTextRenderer.jsx  # Renders Portable Text
├── data/
│   └── blogPosts.js              # Static fallback data
└── modules/blog/
    └── pages/
        └── BlogPage.jsx          # Main blog component

scripts/
├── build-blog-posts-sanity.js    # Fetch posts at build time
├── test-sanity-integration.js    # 9-test integration suite
└── sanity/
    ├── export-to-sanity.js       # Export/import/query tool
    └── diagnose.sh               # Diagnostic script
```

### Universal Environment Detection

**Challenge**: Same code must run in Vite (browser/build) and Node.js (scripts)

**Solution**: `getEnv()` utility function

```javascript
// src/lib/sanityClient.js
function getEnv(key) {
  // Vite environment (browser + build)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  // Node.js environment (scripts)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}
```

### Circuit Breaker Pattern

```javascript
// Timeout Configuration
const TIMEOUT = 5000; // 5 seconds

// Exponential Backoff
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

// Circuit Breaker
try {
  const sanityData = await fetchWithTimeout(sanityClient.fetch(query), TIMEOUT);
  return sanityData;
} catch (error) {
  console.warn('Sanity fetch failed, using fallback:', error);
  return staticPosts;
}
```

### Caching Strategy

**In-Memory Cache**:
- Metadata cache: 5 minutes
- Full post cache: 10 minutes
- Search results: 2 minutes

**Cache Invalidation**:
- Manual: `npm run sanity:build`
- Automatic: Time-based expiration
- Force refresh: Query parameter `?refresh=true`

## Implementation Status

### ✅ Completed Features

1. **Sanity CMS Integration** (100%)
   - Client configuration (universal environment)
   - GROQ query utilities
   - Image optimization with Sanity CDN
   - Portable Text rendering
   - Content transformation pipeline

2. **Static Fallback System** (100%)
   - 25+ posts migrated to static format
   - Identical data structure
   - Zero network dependency
   - Automatic switching on Sanity failure

3. **Content Features** (100%)
   - Blog listing page with pagination
   - Individual post pages
   - Client-side search
   - Category filtering
   - Featured posts section
   - Recent posts widget
   - Author profiles
   - SEO optimization

4. **Developer Tools** (100%)
   - Build-time data fetching
   - Export/import scripts
   - Integration test suite (9 tests)
   - Diagnostic tools
   - Cache management

5. **Performance Optimization** (100%)
   - Code splitting: `sanity-cms-*.js` chunk
   - Lazy loading for blog module
   - Image optimization (WebP/AVIF)
   - In-memory caching
   - CDN-backed image delivery

## Content Management

### Sanity Studio

**Access**: https://saraivavision.sanity.studio (or https://92ocrdmp.sanity.studio)

**Features**:
- Rich text editor with Portable Text
- Image upload with alt text and metadata
- Category management
- Author management
- SEO field customization
- Preview before publish
- Version history

### Content Workflow

1. **Create/Edit**: Use Sanity Studio
2. **Preview**: Check in preview mode
3. **Publish**: Publish to production dataset
4. **Build**: Run `npm run sanity:build` (or wait for auto-build)
5. **Deploy**: Changes available immediately via API
6. **Fallback**: Update static posts if needed

### Static Fallback Management

**When to Update**:
- Important posts that must always be available
- High-traffic posts for SEO
- Critical healthcare information
- Posts referenced in external links

**How to Update**:
```bash
# Fetch from Sanity and update static posts
npm run sanity:export
```

## Performance Metrics

**Bundle Size**:
- Sanity client: ~25KB (8KB gzipped)
- Sanity utilities: ~8KB (3KB gzipped)
- Blog service: ~10KB (4KB gzipped)
- Portable Text renderer: ~10KB (3KB gzipped)
- **Total**: ~53KB (18KB gzipped)

**API Performance**:
- Average response time: <200ms (Sanity CDN)
- Timeout threshold: 5000ms
- Cache hit rate: >80%
- Fallback activation: <1% of requests

**Page Load**:
- Blog listing: <1.5s (target: <1.2s)
- Post detail: <2s (target: <1.5s)
- Search: <500ms (client-side)

## Testing

### Integration Test Suite (9 Tests)

Run: `node scripts/test-sanity-integration.js`

**Tests**:
1. ✅ Sanity client health check
2. ✅ Fetch all posts metadata (25 posts)
3. ✅ Get post by slug
4. ✅ Get recent posts (3)
5. ✅ Get featured posts (3)
6. ✅ Get posts by category
7. ✅ Search functionality
8. ✅ Cache statistics
9. ✅ Cache clear operation

**Test Coverage**:
- Sanity API connectivity
- Query execution
- Data transformation
- Caching behavior
- Error handling
- Fallback switching

## SEO Optimization

**Structured Data**:
- BlogPosting schema
- Article schema
- Author schema
- Organization schema
- BreadcrumbList schema

**Meta Tags**:
- Dynamic title and description
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Author attribution

**Prerendering**:
- Static HTML for all blog posts
- Generated at build time
- SEO-friendly URLs
- Fast initial page load

## Compliance & Security

**CFM Compliance**:
- All medical content reviewed by qualified professional
- Accurate health information
- Proper medical disclaimers
- Author credentials displayed

**LGPD Compliance**:
- No personal data in public posts
- Author consent for attribution
- Privacy policy linked
- Cookie consent for analytics

**Content Security**:
- HTML sanitization in Portable Text
- XSS protection
- CSP headers configured
- HTTPS only

## Monitoring

**Key Metrics**:
- Sanity API uptime
- Fallback activation rate
- Cache hit rate
- Average response time
- Error rate

**Alerts**:
- Sanity API down >5 minutes
- Fallback activation >10% of requests
- Cache hit rate <70%
- Error rate >5%

**Dashboards**:
- Sanity Dashboard: API usage, performance
- Google Analytics: Page views, engagement
- PostHog: User behavior, search queries

## Future Enhancements

**Planned Features** (not yet implemented):
- [ ] Comments system (moderated)
- [ ] Newsletter subscription
- [ ] Related posts recommendation
- [ ] Reading time estimation
- [ ] Social sharing buttons
- [ ] Author bio pages
- [ ] Multi-language support (i18n)
- [ ] Content versioning
- [ ] Scheduled publishing
- [ ] Draft previews for stakeholders

**Advanced Features**:
- [ ] AI-powered content suggestions
- [ ] Automated SEO analysis
- [ ] A/B testing for titles
- [ ] Personalized content recommendations

## Business Impact

**Results** (tracked in Google Analytics):
- **Organic Traffic**: Target +50% YoY
- **Engagement**: Average 3.5 min session duration
- **SEO Rankings**: 15+ posts in top 10 for target keywords
- **Content Velocity**: 2-3 posts per week (vs. 1 previously)

**Content Strategy**:
- Educational content on eye health
- Lens care tips and guides
- Common eye conditions explained
- Patient success stories
- Industry news and updates

**SEO Impact**:
- 25+ optimized blog posts
- Structured data for rich snippets
- Internal linking strategy
- Mobile-optimized content
- Fast page loads (<2s)

## Acceptance Criteria

✅ All acceptance criteria met:
- [x] Sanity CMS integration functional
- [x] Static fallback system working
- [x] Circuit breaker with 5s timeout
- [x] 25+ posts migrated
- [x] Portable Text rendering
- [x] Image optimization via CDN
- [x] Client-side search
- [x] Category filtering
- [x] SEO optimization
- [x] Prerendering for SEO
- [x] Mobile-responsive design
- [x] Accessibility (WCAG 2.1 AA)
- [x] CFM compliance
- [x] Integration tests (9/9 passing)
- [x] Universal environment compatibility

## Related Documentation

- [Blog Architecture](../../docs/architecture/BLOG_ARCHITECTURE.md)
- [Sanity Integration Guide](../../docs/architecture/SANITY_INTEGRATION_GUIDE.md)
- [Main Documentation](../../CLAUDE.md#sanity-cms-integration)
- [Testing Guide](../../CLAUDE.md#testing-architecture)

## Maintenance Notes

**Update Frequency**:
- Content: 2-3 posts per week
- Static fallback: Monthly or when critical posts added
- Schema updates: As needed (notify developers)

**Owner**: Dr. Philipe Saraiva Cruz
**Stakeholders**: Content team, Marketing, SEO specialist

**Change Process**:
1. Content changes: Via Sanity Studio (no code changes)
2. Schema changes: Require developer review and migration
3. Fallback updates: Run `npm run sanity:export`
4. Cache invalidation: On major content changes

**Backup Strategy**:
- Sanity exports: Weekly automated backups
- Static posts: Version controlled in Git
- Images: Stored in Sanity CDN + local backup

---

**Document Status**: ✅ Complete and Accurate
**Last Reviewed**: 2025-11-16
**Next Review**: 2026-02-16
