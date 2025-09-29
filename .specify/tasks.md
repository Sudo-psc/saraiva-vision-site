# Tasks: WordPress Headless Integration via External API

**Feature:** WordPress headless integration via external CMS API (cms.saraivavision.com.br) to display blog posts on saraivavision.com.br/blog

**Status:** 🟢 Implementation Ready
**Priority:** High
**Created:** 2025-09-29

---

## 📋 Task Overview

This feature integrates WordPress CMS hosted at `cms.saraivavision.com.br` as a headless content management system, consuming blog posts via REST API to display on the main site `saraivavision.com.br/blog`.

### Existing Infrastructure
- ✅ WordPress CMS running at cms.saraivavision.com.br
- ✅ REST API endpoints configured (/wp-json/wp/v2/)
- ✅ Frontend React components (BlogPage.jsx, BlogPostPage.jsx)
- ✅ Service layer (WordPressBlogService.js, WordPressJWTAuthService.js)
- ✅ Utility libraries (wordpress-api.js, wordpress-cache.js, wordpress-health.js)
- ✅ Nginx proxy configuration

### Implementation Goals
1. Ensure reliable API connectivity from saraivavision.com.br to cms.saraivavision.com.br
2. Implement robust error handling and fallback mechanisms
3. Optimize performance with caching strategies
4. Maintain CFM compliance for medical content
5. Provide excellent user experience with loading states

---

## 🎯 Phase 1: Setup & Validation (T001-T004)

### T001: Validate WordPress REST API Connectivity [P]
**Priority:** Critical
**Files:** `api/src/routes/wordpress-health.js`, `src/lib/wordpress-health.js`
**Dependencies:** None

**Objective:** Ensure WordPress REST API at cms.saraivavision.com.br is accessible and returning valid responses.

**Tasks:**
1. Test REST API endpoint: `https://cms.saraivavision.com.br/wp-json/wp/v2/posts`
2. Verify response format includes required fields:
   - `id`, `title`, `content`, `excerpt`, `date`, `author`, `featured_media`
   - `categories`, `tags`, `_embedded` (for featured images)
3. Test pagination parameters: `per_page`, `page`, `orderby`, `order`
4. Validate CORS headers allow requests from saraivavision.com.br
5. Check SSL certificate validity
6. Document response times and availability

**Acceptance Criteria:**
- [ ] API returns 200 status for posts endpoint
- [ ] Response includes all required fields
- [ ] CORS allows cross-origin requests
- [ ] Response time < 2 seconds
- [ ] SSL certificate valid and trusted

**Test Command:**
```bash
curl -I https://cms.saraivavision.com.br/wp-json/wp/v2/posts
curl -s "https://cms.saraivavision.com.br/wp-json/wp/v2/posts?per_page=5" | jq '.[] | {id, title, date}'
```

---

### T002: Test Nginx Proxy Configuration [P]
**Priority:** Critical
**Files:** `/etc/nginx/sites-available/saraivavision`, `docs/nginx-wordpress-blog.conf`
**Dependencies:** None

**Objective:** Verify Nginx properly proxies WordPress API requests and handles CORS.

**Tasks:**
1. Review current Nginx configuration for WordPress proxy
2. Test proxy pass to WordPress API: `/api/wordpress-graphql/` → `cms.saraivavision.com.br`
3. Verify CORS headers are set correctly:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
4. Test rate limiting configuration (30 req/min)
5. Validate SSL termination and certificate handling
6. Check proxy timeouts (60s connect/send/read)

**Acceptance Criteria:**
- [ ] Nginx config syntax valid (`nginx -t`)
- [ ] Proxy successfully forwards requests
- [ ] CORS headers present in responses
- [ ] Rate limiting active and working
- [ ] No SSL errors in logs

**Test Command:**
```bash
sudo nginx -t
curl -I https://saraivavision.com.br/wp-json/wp/v2/posts
sudo tail -f /var/log/nginx/saraivavision_error.log
```

---

### T003: Validate Environment Variables [P]
**Priority:** High
**Files:** `.env.production`, `src/config/env.ts`, `src/lib/wordpress-config.js`
**Dependencies:** None

**Objective:** Ensure all required WordPress environment variables are configured.

**Tasks:**
1. Verify WordPress API URL variables:
   - `VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br`
   - `VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql`
   - `WORDPRESS_BASE_URL=https://cms.saraivavision.com.br`
2. Check JWT authentication credentials (if needed):
   - `WORDPRESS_ADMIN_USER`
   - `WORDPRESS_ADMIN_PASSWORD`
3. Validate timeout configurations:
   - `VITE_GRAPHQL_TIMEOUT=15000`
   - `VITE_GRAPHQL_MAX_RETRIES=3`
4. Test environment validation with Zod schema in `env.ts`

**Acceptance Criteria:**
- [ ] All required variables present in .env.production
- [ ] URLs are HTTPS and valid
- [ ] Zod validation passes
- [ ] Variables accessible in runtime

**Test Command:**
```bash
grep -E "WORDPRESS|GRAPHQL" .env.production
node -e "console.log(process.env.VITE_WORDPRESS_API_URL)"
```

---

### T004: Create WordPress Service Integration Tests
**Priority:** High
**Files:** `src/services/__tests__/WordPressBlogService.test.js`
**Dependencies:** T001

**Objective:** Create comprehensive tests for WordPress blog service layer.

**Tasks:**
1. Create test file for WordPressBlogService
2. Mock REST API responses with realistic data
3. Test core methods:
   - `fetchPosts(params)` - Get posts list
   - `fetchPostBySlug(slug)` - Get single post
   - `fetchCategories()` - Get categories
   - `fetchTags()` - Get tags
4. Test error scenarios:
   - Network timeout
   - 404 not found
   - 500 server error
   - Invalid JSON response
5. Test caching behavior
6. Test retry logic with exponential backoff

**Acceptance Criteria:**
- [ ] All service methods have unit tests
- [ ] Error scenarios properly tested
- [ ] Test coverage > 80%
- [ ] Tests pass with `npm test`

**Test Command:**
```bash
npm run test:unit src/services/__tests__/WordPressBlogService.test.js
npm run test:coverage -- --testPathPattern=WordPressBlogService
```

---

## 🔧 Phase 2: Core Implementation (T005-T010)

### T005: Implement WordPress Blog Service Methods
**Priority:** High
**Files:** `src/services/WordPressBlogService.js`
**Dependencies:** T001, T003

**Objective:** Implement or enhance WordPress blog service with REST API integration.

**Tasks:**
1. Review existing `WordPressBlogService.js` implementation
2. Implement/enhance core methods:
   ```javascript
   class WordPressBlogService {
     async fetchPosts({ page = 1, perPage = 10, categories = [], search = '' })
     async fetchPostBySlug(slug)
     async fetchPostById(id)
     async fetchCategories()
     async fetchTags()
     async fetchFeaturedImage(mediaId)
   }
   ```
3. Add request interceptor for authentication (if needed)
4. Implement retry logic with exponential backoff (3 attempts)
5. Add request/response logging
6. Handle embedded data (_embedded.author, _embedded.wp:featuredmedia)
7. Transform API response to frontend-friendly format

**Acceptance Criteria:**
- [ ] All methods return standardized response format
- [ ] Retry logic works for network failures
- [ ] Embedded data properly extracted
- [ ] Errors logged with context
- [ ] Response times logged

**Implementation Notes:**
- Use existing `wordpress-api.js` utilities
- Leverage `wordpress-cache.js` for caching
- Follow patterns from `wordpress-health.js`

---

### T006: Implement WordPress Cache Layer [P]
**Priority:** High
**Files:** `src/lib/wordpress-cache.js`
**Dependencies:** None

**Objective:** Implement intelligent caching to reduce API calls and improve performance.

**Tasks:**
1. Review existing `wordpress-cache.js` implementation
2. Implement cache strategies:
   - **Memory cache**: LRU cache for frequently accessed posts (max 100 items)
   - **TTL**: 5 minutes for posts list, 15 minutes for single post
   - **Cache keys**: SHA-256 hash of request parameters
3. Implement cache invalidation:
   - Manual invalidation via admin action
   - Automatic invalidation on publish/update (webhook)
4. Add cache hit/miss metrics
5. Implement cache warming for popular posts

**Acceptance Criteria:**
- [ ] Cache reduces API calls by >70%
- [ ] Cache keys unique and collision-free
- [ ] TTL properly enforced
- [ ] Cache metrics available
- [ ] Memory usage bounded

**Implementation:**
```javascript
class WordPressCache {
  constructor(maxSize = 100, defaultTTL = 300000) // 5 min
  get(key)
  set(key, value, ttl)
  invalidate(pattern)
  clear()
  getMetrics()
}
```

---

### T007: Implement Circuit Breaker Pattern [P]
**Priority:** Medium
**Files:** `src/lib/wordpress-circuit-breaker.js`
**Dependencies:** None

**Objective:** Protect application from cascading failures when WordPress API is down.

**Tasks:**
1. Review existing `wordpress-circuit-breaker.js` implementation
2. Implement circuit breaker states:
   - **CLOSED**: Normal operation, all requests pass
   - **OPEN**: Too many failures, reject all requests for timeout period
   - **HALF_OPEN**: Test if service recovered with single request
3. Configure thresholds:
   - Failure threshold: 5 failures in 60 seconds
   - Timeout: 30 seconds in OPEN state
   - Success threshold: 2 successes to close
4. Emit events for monitoring:
   - `circuit-open`, `circuit-close`, `circuit-half-open`
5. Integrate with fallback manager

**Acceptance Criteria:**
- [ ] Circuit opens after threshold failures
- [ ] Circuit closes after service recovery
- [ ] Fast-fail prevents cascading failures
- [ ] Events properly emitted
- [ ] Integrates with existing error handling

**Implementation:**
```javascript
class CircuitBreaker {
  constructor({ failureThreshold = 5, timeout = 30000, successThreshold = 2 })
  async execute(fn)
  getState() // CLOSED | OPEN | HALF_OPEN
  reset()
}
```

---

### T008: Implement Fallback Manager
**Priority:** High
**Files:** `src/lib/wordpress-fallback-manager.js`
**Dependencies:** T006, T007

**Objective:** Provide graceful degradation when WordPress API unavailable.

**Tasks:**
1. Review existing `wordpress-fallback-manager.js` implementation
2. Implement fallback strategies:
   - **Cache**: Return stale cache data (up to 24 hours old)
   - **Local storage**: Browser-cached posts
   - **Static fallback**: Hardcoded sample posts for development
3. Implement fallback priority chain:
   1. Fresh API data
   2. Valid cache (< TTL)
   3. Stale cache (< 24 hours)
   4. Local storage
   5. Static fallback
4. Add fallback indicators in UI
5. Log fallback usage for monitoring

**Acceptance Criteria:**
- [ ] Users see content even when API down
- [ ] Fallback chain properly ordered
- [ ] UI indicates degraded mode
- [ ] Fallback usage logged
- [ ] No breaking errors shown to user

**Implementation:**
```javascript
class FallbackManager {
  async getData(key, fetchFn, options = {})
  getFallbackSource() // Returns: 'api' | 'cache' | 'storage' | 'static'
  isInFallbackMode()
}
```

---

### T009: Update BlogPage Component
**Priority:** High
**Files:** `src/pages/BlogPage.jsx`
**Dependencies:** T005, T008

**Objective:** Enhance BlogPage to consume WordPress API via service layer.

**Tasks:**
1. Review existing `BlogPage.jsx` implementation
2. Integrate `WordPressBlogService`:
   ```javascript
   const { posts, loading, error } = useBlogPosts({
     page: currentPage,
     perPage: 10,
     categories: selectedCategories
   })
   ```
3. Implement UI states:
   - **Loading**: Skeleton loaders
   - **Success**: Post grid with featured images
   - **Error**: Friendly error message with retry button
   - **Empty**: "No posts found" state
   - **Fallback**: Banner indicating cached/offline data
4. Add pagination controls
5. Add category filter sidebar
6. Add search functionality
7. Implement lazy loading for featured images
8. Add SEO meta tags with React Helmet

**Acceptance Criteria:**
- [ ] Posts load and display correctly
- [ ] All UI states implemented
- [ ] Pagination works smoothly
- [ ] Category filters functional
- [ ] Search returns relevant results
- [ ] Images lazy load
- [ ] SEO meta tags present

---

### T010: Update BlogPostPage Component
**Priority:** High
**Files:** `src/pages/BlogPostPage.jsx`
**Dependencies:** T005, T008

**Objective:** Enhance BlogPostPage to display individual posts from WordPress API.

**Tasks:**
1. Review existing `BlogPostPage.jsx` implementation
2. Integrate `WordPressBlogService.fetchPostBySlug(slug)`
3. Parse slug from URL: `/blog/:slug`
4. Render post content with proper HTML sanitization
5. Display featured image with responsive sizing
6. Show post metadata:
   - Author name and avatar
   - Publication date (formatted)
   - Categories and tags
   - Reading time estimate
7. Implement related posts section (3-5 posts from same category)
8. Add social share buttons (WhatsApp, Facebook, LinkedIn)
9. Add CFM compliance disclaimer for medical content
10. Implement structured data (Schema.org Article markup)

**Acceptance Criteria:**
- [ ] Single post loads correctly
- [ ] Content properly sanitized
- [ ] Featured image responsive
- [ ] Metadata displayed
- [ ] Related posts shown
- [ ] Share buttons functional
- [ ] CFM disclaimer present
- [ ] Schema.org markup valid

---

## 🎨 Phase 3: User Experience (T011-T014)

### T011: Create Loading Skeletons [P]
**Priority:** Medium
**Files:** `src/components/blog/BlogSkeleton.jsx`, `src/components/blog/PostSkeleton.jsx`
**Dependencies:** None

**Objective:** Create skeleton loading states for better perceived performance.

**Tasks:**
1. Create `BlogSkeleton.jsx` for post list:
   - Skeleton card with shimmer effect
   - Grid layout matching actual posts
   - 6-10 skeleton cards
2. Create `PostSkeleton.jsx` for single post:
   - Featured image placeholder
   - Title and metadata skeletons
   - Content block skeletons
3. Use Tailwind CSS for styling
4. Add subtle animation (shimmer/pulse)
5. Match production layout exactly

**Acceptance Criteria:**
- [ ] Skeletons match actual component layout
- [ ] Smooth animation (60fps)
- [ ] No layout shift on content load
- [ ] Accessible (screen readers announce loading)

**Implementation:**
```jsx
export function BlogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(9)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
```

---

### T012: Implement Error Boundaries [P]
**Priority:** High
**Files:** `src/components/blog/BlogErrorBoundary.jsx`
**Dependencies:** None

**Objective:** Gracefully handle React errors in blog components.

**Tasks:**
1. Create `BlogErrorBoundary` component
2. Catch errors in blog pages
3. Display user-friendly error UI:
   - Friendly error message
   - Retry button
   - Link to homepage
   - Contact support link
4. Log errors to monitoring service
5. Implement error recovery strategies

**Acceptance Criteria:**
- [ ] Errors don't crash entire app
- [ ] User sees friendly error message
- [ ] Errors logged for monitoring
- [ ] Retry functionality works

**Implementation:**
```jsx
class BlogErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.resetError} />
    }
    return this.props.children
  }
}
```

---

### T013: Add Search Functionality [P]
**Priority:** Medium
**Files:** `src/components/blog/BlogSearch.jsx`, `src/hooks/useBlogSearch.js`
**Dependencies:** T005

**Objective:** Enable users to search blog posts by title and content.

**Tasks:**
1. Create `BlogSearch.jsx` component:
   - Search input with icon
   - Debounced input (500ms)
   - Clear button
   - Search suggestions dropdown
2. Create `useBlogSearch` hook:
   - Call WordPress API with `?search=` parameter
   - Debounce search requests
   - Handle loading/error states
   - Return search results
3. Integrate search in BlogPage header
4. Add search results count
5. Highlight search terms in results

**Acceptance Criteria:**
- [ ] Search input responsive and accessible
- [ ] Debouncing prevents excessive API calls
- [ ] Search results relevant
- [ ] Loading state during search
- [ ] Empty results handled gracefully

---

### T014: Implement Category Filter [P]
**Priority:** Medium
**Files:** `src/components/blog/CategoryFilter.jsx`, `src/hooks/useBlogCategories.js`
**Dependencies:** T005

**Objective:** Allow users to filter posts by category.

**Tasks:**
1. Create `CategoryFilter.jsx` component:
   - Category list with counts
   - Active category highlighting
   - "All categories" option
   - Mobile-responsive sidebar
2. Create `useBlogCategories` hook:
   - Fetch categories from WordPress API
   - Cache categories (rarely change)
   - Return categories with post counts
3. Integrate filter in BlogPage sidebar
4. Update URL with category parameter: `/blog?category=oftalmogia`
5. Sync filter state with URL

**Acceptance Criteria:**
- [ ] Categories load and display
- [ ] Filtering works correctly
- [ ] URL reflects filter state
- [ ] Post counts accurate
- [ ] Mobile-friendly UI

---

## 🚀 Phase 4: Performance & Polish (T015-T018)

### T015: Implement Image Optimization [P]
**Priority:** High
**Files:** `src/components/blog/OptimizedImage.jsx`, `src/utils/imageOptimizer.js`
**Dependencies:** None

**Objective:** Optimize featured images for performance and Core Web Vitals.

**Tasks:**
1. Create `OptimizedImage` component:
   - Lazy loading with IntersectionObserver
   - Responsive srcset for different screen sizes
   - WebP format with JPEG fallback
   - Blur placeholder (low-res preview)
   - Loading animation
2. Generate multiple image sizes:
   - Thumbnail: 320x240
   - Small: 640x480
   - Medium: 960x720
   - Large: 1280x960
3. Implement progressive loading:
   - Load low-res placeholder first
   - Transition to full-res on load
4. Add error fallback image
5. Track image performance metrics

**Acceptance Criteria:**
- [ ] Images lazy load below fold
- [ ] Responsive images for all screen sizes
- [ ] WebP format served when supported
- [ ] No layout shift on image load
- [ ] LCP (Largest Contentful Paint) < 2.5s

---

### T016: Add Analytics Tracking [P]
**Priority:** Medium
**Files:** `src/utils/blogAnalytics.js`, `src/hooks/useBlogAnalytics.js`
**Dependencies:** None

**Objective:** Track blog engagement metrics for optimization.

**Tasks:**
1. Create `blogAnalytics.js` utility:
   - Track page views
   - Track post reads (scroll depth)
   - Track time on page
   - Track category/search usage
   - Track share button clicks
2. Integrate with existing analytics (PostHog)
3. Create custom events:
   - `blog_post_view`
   - `blog_search_query`
   - `blog_category_filter`
   - `blog_share_click`
   - `blog_related_post_click`
4. Add privacy-compliant tracking (LGPD)
5. Create analytics dashboard queries

**Acceptance Criteria:**
- [ ] All key events tracked
- [ ] Analytics data flowing to PostHog
- [ ] Privacy compliant (no PII)
- [ ] Dashboard queries working

---

### T017: Create Admin Dashboard Integration
**Priority:** Low
**Files:** `src/pages/admin/BlogAdminPage.jsx`
**Dependencies:** T005

**Objective:** Provide admin interface for blog management.

**Tasks:**
1. Create `BlogAdminPage.jsx`:
   - List all posts with status indicators
   - Quick edit title/excerpt
   - Publish/unpublish toggle
   - Delete post action
   - Redirect to WordPress admin for full editing
2. Add authentication check (admin role required)
3. Integrate with `WordPressJWTAuthService` for secure operations
4. Add confirmation modals for destructive actions
5. Display post statistics:
   - Views
   - Reading time
   - Last modified date

**Acceptance Criteria:**
- [ ] Admin can view all posts
- [ ] Quick actions functional
- [ ] Redirects to WordPress work
- [ ] Authentication enforced
- [ ] Statistics displayed

---

### T018: Create Integration Documentation
**Priority:** Medium
**Files:** `docs/WORDPRESS_INTEGRATION.md` (update)
**Dependencies:** T001-T017

**Objective:** Document the complete WordPress integration for future maintenance.

**Tasks:**
1. Update `docs/WORDPRESS_INTEGRATION.md` with:
   - Architecture diagrams (updated)
   - API endpoints documentation
   - Service layer architecture
   - Error handling strategies
   - Caching strategies
   - Fallback mechanisms
   - Deployment procedures
   - Troubleshooting guide
2. Add code examples for common tasks
3. Document environment variables
4. Create troubleshooting decision tree
5. Add performance benchmarks
6. Document monitoring and alerts

**Acceptance Criteria:**
- [ ] Documentation complete and accurate
- [ ] Code examples tested
- [ ] Troubleshooting guide helpful
- [ ] Performance benchmarks documented

---

## 🧪 Phase 5: Testing & Deployment (T019-T022)

### T019: Run Integration Tests
**Priority:** Critical
**Files:** `src/__tests__/integration/blog.test.js`
**Dependencies:** T001-T018

**Objective:** Validate complete blog integration end-to-end.

**Tasks:**
1. Create integration test suite:
   - Test full user journey: homepage → blog → post → related posts
   - Test search flow
   - Test category filtering
   - Test pagination
   - Test error scenarios (API down, slow network)
2. Use React Testing Library + MSW (Mock Service Worker)
3. Mock WordPress API responses
4. Test with various screen sizes
5. Test keyboard navigation
6. Test screen reader announcements

**Acceptance Criteria:**
- [ ] All user flows work end-to-end
- [ ] Tests pass consistently
- [ ] Edge cases covered
- [ ] Accessibility validated

**Test Command:**
```bash
npm run test:integration -- --testPathPattern=blog
npm run test:e2e -- --spec=blog.spec.js
```

---

### T020: Performance Testing & Optimization
**Priority:** High
**Files:** N/A (performance tests)
**Dependencies:** T019

**Objective:** Ensure blog meets performance targets.

**Tasks:**
1. Run Lighthouse audits:
   - Performance score > 90
   - Accessibility score > 95
   - Best practices score > 90
   - SEO score > 95
2. Test Core Web Vitals:
   - LCP (Largest Contentful Paint) < 2.5s
   - FID (First Input Delay) < 100ms
   - CLS (Cumulative Layout Shift) < 0.1
3. Load testing with Artillery:
   - 100 concurrent users
   - Maintain response times < 2s
4. Identify and fix bottlenecks
5. Optimize bundle size (code splitting)

**Acceptance Criteria:**
- [ ] Lighthouse scores meet targets
- [ ] Core Web Vitals pass
- [ ] Load tests successful
- [ ] Bundle size optimized

**Test Commands:**
```bash
lighthouse https://saraivavision.com.br/blog --view
npm run test:load -- --target https://saraivavision.com.br/blog
```

---

### T021: Security Audit
**Priority:** Critical
**Files:** N/A (security audit)
**Dependencies:** T019

**Objective:** Ensure blog integration is secure and compliant.

**Tasks:**
1. Review CORS configuration:
   - Only allow saraivavision.com.br origin
   - No wildcard origins in production
2. Test XSS prevention:
   - HTML content properly sanitized
   - User input escaped
3. Test CSRF protection:
   - State-changing operations require tokens
4. Review API authentication:
   - JWT tokens not exposed client-side
   - Tokens properly expired and refreshed
5. Test rate limiting:
   - API rate limits enforced
   - No DOS vulnerability
6. LGPD compliance:
   - No PII in analytics
   - Privacy policy updated
7. CFM compliance:
   - Medical disclaimers present
   - Content approval workflow

**Acceptance Criteria:**
- [ ] No critical security vulnerabilities
- [ ] CORS properly configured
- [ ] XSS/CSRF protection working
- [ ] Rate limiting effective
- [ ] Compliance requirements met

---

### T022: Production Deployment
**Priority:** Critical
**Files:** N/A (deployment)
**Dependencies:** T019-T021

**Objective:** Deploy WordPress blog integration to production.

**Tasks:**
1. Pre-deployment checklist:
   - [ ] All tests passing
   - [ ] Environment variables set
   - [ ] Nginx configuration deployed
   - [ ] SSL certificates valid
   - [ ] WordPress API accessible
   - [ ] Monitoring configured
2. Deployment steps:
   ```bash
   # Build production bundle
   NODE_ENV=production npm run build

   # Copy to web directory
   sudo cp -r dist/* /var/www/html/

   # Reload Nginx
   sudo systemctl reload nginx

   # Restart Node.js API (if needed)
   sudo systemctl restart saraiva-api
   ```
3. Post-deployment validation:
   - [ ] Homepage loads correctly
   - [ ] Blog page loads with posts
   - [ ] Single post page works
   - [ ] Search functional
   - [ ] Categories filter works
   - [ ] No console errors
   - [ ] Analytics tracking
   - [ ] SSL certificate valid
4. Rollback plan ready
5. Monitor for 24 hours

**Acceptance Criteria:**
- [ ] Deployment successful
- [ ] All features working in production
- [ ] No errors in logs
- [ ] Performance meets targets
- [ ] Monitoring active

---

## 📊 Success Metrics

### Performance Targets
- ✅ Blog page load time: < 2 seconds
- ✅ API response time: < 500ms (p95)
- ✅ Cache hit rate: > 70%
- ✅ Lighthouse performance: > 90
- ✅ Core Web Vitals: All passing

### Reliability Targets
- ✅ Uptime: > 99.9%
- ✅ Error rate: < 0.1%
- ✅ API availability: > 99.5%
- ✅ Fallback usage: < 5% of requests

### User Experience Targets
- ✅ Time to first post: < 1 second
- ✅ Search response: < 500ms
- ✅ Image load time: < 2 seconds
- ✅ Zero layout shift (CLS: 0)

---

## 🔧 Parallel Execution Guide

### Can Run in Parallel [P]

**Phase 1 - Setup:**
```bash
# All validation tasks can run in parallel
Task T001 T002 T003  # API validation, Nginx testing, env vars
```

**Phase 2 - Core Implementation:**
```bash
# Independent service layer components
Task T006 T007  # Cache layer and circuit breaker
Task T011 T012 T013 T014  # All UX components (different files)
```

**Phase 3 - Polish:**
```bash
# Independent optimization tasks
Task T015 T016  # Image optimization and analytics
```

### Must Run Sequentially

**Phase 2 - Core Implementation:**
- T005 (Blog Service) MUST complete before T009, T010 (uses service)
- T008 (Fallback Manager) depends on T006, T007

**Phase 4 - Testing:**
- T019 (Integration Tests) must complete before T020 (Performance)
- T020 (Performance) must complete before T021 (Security)
- T021 (Security) must complete before T022 (Deployment)

---

## 🚨 Risk Mitigation

### Risk 1: WordPress API Downtime
**Mitigation:**
- Circuit breaker pattern (T007)
- Multi-level fallback system (T008)
- Aggressive caching (T006)
- Health check monitoring

### Risk 2: Performance Degradation
**Mitigation:**
- Image optimization (T015)
- Code splitting and lazy loading
- CDN for static assets
- Load testing before deployment (T020)

### Risk 3: Security Vulnerabilities
**Mitigation:**
- Security audit (T021)
- Input sanitization
- CORS restrictions
- Rate limiting
- Regular security updates

### Risk 4: CFM Compliance Issues
**Mitigation:**
- Medical content disclaimer on all posts
- Content approval workflow
- LGPD privacy compliance
- Regular compliance audits

---

## 📚 Documentation References

- **WordPress Integration Guide:** `docs/WORDPRESS_INTEGRATION.md`
- **WordPress Blog Specs:** `docs/WORDPRESS_BLOG_SPECS.md`
- **Nginx Configuration:** `docs/nginx-wordpress-blog.conf`
- **CORS Fix Guide:** `docs/WORDPRESS_GRAPHQL_CORS_FIX.md`
- **Main Documentation:** `CLAUDE.md`

---

## ✅ Completion Checklist

- [ ] All 22 tasks completed
- [ ] Integration tests passing
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Deployed to production
- [ ] Monitoring active
- [ ] Team trained on maintenance

---

**Generated:** 2025-09-29
**Last Updated:** 2025-09-29
**Status:** Ready for Implementation