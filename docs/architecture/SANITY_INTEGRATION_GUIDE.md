# Sanity CMS Integration Guide

**Author**: Dr. Philipe Saraiva Cruz
**Date**: 2025-10-28
**Status**: Production ✅

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Environment Configuration](#environment-configuration)
5. [Data Flow](#data-flow)
6. [API Reference](#api-reference)
7. [GROQ Queries](#groq-queries)
8. [React Hooks](#react-hooks)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)
11. [Performance Optimization](#performance-optimization)

---

## Overview

The Saraiva Vision blog uses a **hybrid architecture** combining Sanity CMS (primary source) with static fallback (reliability guarantee). This provides:

- ✅ **100% uptime** - Automatic fallback to static content if Sanity fails
- ⚡ **Optimal performance** - CDN-backed reads with aggressive caching
- 🔄 **Zero downtime updates** - Content updates without deployment
- 🛡️ **Circuit breaker** - Prevents cascading failures
- 📊 **Built-in monitoring** - Health checks and cache statistics

### Key Metrics

- **25 blog posts** in Sanity CMS
- **Project ID**: `92ocrdmp`
- **Dataset**: `production`
- **Chunk size**: ~53KB (18KB gzipped)
- **Cache TTL**: 60 seconds (health check interval)

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   BlogPage Component                         │
│                (React Router Lazy Loaded)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│             blogDataService.js (Main Entry)                  │
│  - Circuit breaker pattern                                   │
│  - In-memory caching (metadata + full posts)                 │
│  - Health check tracking                                     │
│  - Automatic fallback orchestration                          │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
      ┌──────▼─────────┐         ┌──────▼──────────┐
      │ Try: Sanity    │         │ Fallback: Static│
      │ CMS (Primary)  │         │ Posts (Reliable)│
      └──────┬─────────┘         └──────┬──────────┘
             │                           │
   ┌─────────▼──────────┐                │
   │ sanityBlogService  │                │
   │ - Metadata queries │                │
   │ - Full post fetch  │                │
   │ - Data transform   │                │
   └─────────┬──────────┘                │
             │                           │
   ┌─────────▼──────────┐       ┌────────▼──────────────┐
   │ sanityClient.js    │       │ enhancedBlogPosts.js  │
   │ - Retry logic      │       │ - Lazy loaded         │
   │ - Timeout: 5s      │       │ - Build-time export   │
   │ - CDN reads        │       │ - Always available    │
   └─────────┬──────────┘       └───────────────────────┘
             │
   ┌─────────▼──────────┐
   │ @sanity/client     │
   │ - GROQ execution   │
   │ - CDN caching      │
   │ - Image URLs       │
   └────────────────────┘
```

### Layered Architecture

| Layer | File | Purpose |
|-------|------|---------|
| **Presentation** | `src/hooks/useSanityBlog.js` | React hooks for components |
| **Business Logic** | `src/services/blogDataService.js` | Main API with fallback |
| **Data Access** | `src/services/sanityBlogService.js` | Sanity-specific operations |
| **Client** | `src/lib/sanityClient.js` | Universal Sanity client |
| **Transport** | `src/services/sanityClient.js` | Retry + circuit breaker |
| **Fallback** | `src/data/enhancedBlogPosts.js` | Static posts |

---

## File Structure

### Core Files

```
src/
├── lib/
│   ├── sanityClient.js           # Universal client (Vite + Node.js)
│   └── sanityUtils.js            # GROQ queries + transformations
├── services/
│   ├── sanityClient.js           # Extended client with retry logic
│   ├── sanityBlogService.js      # High-level Sanity API
│   └── blogDataService.js        # Main API with fallback (USE THIS)
├── hooks/
│   └── useSanityBlog.js          # React hooks for components
├── components/
│   └── PortableTextRenderer.jsx  # Renders Portable Text content
├── data/
│   ├── blogPosts.sanity.js       # Build-time Sanity export
│   └── enhancedBlogPosts.js      # Lazy-loaded fallback
└── modules/blog/pages/
    └── BlogPage.jsx              # Main blog component

scripts/
└── test-sanity-integration.js    # 9-test integration suite
```

### Responsibilities

**`lib/sanityClient.js`**:
- Universal environment variable access (`getEnv()`)
- Works in both Vite (browser) and Node.js (scripts)
- Basic Sanity client configuration
- Preview client for draft content

**`lib/sanityUtils.js`**:
- GROQ query builders
- Data transformation (Sanity → frontend format)
- Image URL generation with optimization
- Portable Text utilities

**`services/sanityClient.js`**:
- Exponential retry with backoff
- Timeout management (5 seconds)
- Custom `SanityError` class
- Portable Text conversion helpers

**`services/sanityBlogService.js`**:
- Optimized metadata projection
- Full post projection with related posts
- Reading time calculation
- Image URL generation

**`services/blogDataService.js`** ⭐:
- **Primary entry point for all blog data**
- Circuit breaker pattern
- In-memory caching
- Health check tracking
- Automatic fallback logic
- Cache statistics

**`hooks/useSanityBlog.js`**:
- React hooks with loading states
- Error handling
- Feature flag support
- Automatic fallback

---

## Environment Configuration

### Required Variables

```bash
# Sanity Configuration
VITE_SANITY_PROJECT_ID=92ocrdmp        # Sanity project ID
VITE_SANITY_DATASET=production         # Dataset name
VITE_SANITY_TOKEN=                     # Optional: for draft content

# Feature Flags
VITE_ENABLE_SANITY=true                # Enable/disable Sanity (default: true)

# Runtime Environment
NODE_ENV=production                    # Production mode uses CDN
```

### Environment Detection

The `getEnv()` function in `lib/sanityClient.js` handles both contexts:

```javascript
const getEnv = (key, defaultValue = undefined) => {
  // In Vite (browser/build), use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue
  }
  // In Node.js (scripts), use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}
```

---

## Data Flow

### 1. Fetch All Posts (Metadata Only)

```javascript
import { getPostsMetadata } from '@/services/blogDataService';

const posts = await getPostsMetadata();
// Returns: Array of post metadata (titles, slugs, dates, categories)
// Size: ~10KB vs 208KB full bundle
```

**Flow**:
1. Check in-memory cache (`postsMetadataCache`)
2. If empty, check circuit breaker (`shouldTrySanity()`)
3. Try Sanity API with 5s timeout
4. On success: Cache result, update health check
5. On failure: Fall back to `enhancedBlogPosts.js`

### 2. Fetch Single Post (Full Content)

```javascript
import { getPostBySlug } from '@/services/blogDataService';

const post = await getPostBySlug('tipos-de-lentes-de-contato');
// Returns: Full post with content, SEO, related posts
```

**Flow**:
1. Check in-memory cache (`fullPostsCache.get(slug)`)
2. If not cached, try Sanity with `fullPostProjection`
3. On failure, search static posts
4. Cache successful result

### 3. Circuit Breaker Logic

```javascript
const shouldTrySanity = () => {
  if (!lastHealthCheck) return true;

  const now = Date.now();
  if (now - lastHealthCheck.timestamp < healthCheckInterval) {
    return lastHealthCheck.healthy; // Use cached health status
  }

  return true; // Try again after 60s interval
};
```

**Benefits**:
- Prevents repeated failures (cascading errors)
- Automatic recovery after 60 seconds
- Transparent to consumers

---

## API Reference

### `blogDataService.js`

#### `getPostsMetadata()`

Fetch all posts metadata (lightweight, cached).

**Returns**: `Promise<Array<PostMetadata>>`

```javascript
{
  id: number,
  slug: string,
  title: string,
  excerpt: string,
  author: string,
  date: string,
  category: string,
  tags: string[],
  image: string,
  featured: boolean,
  seo: { metaTitle, metaDescription, keywords },
  contentLength: number,
  contentType: 'html' | 'portableText'
}
```

#### `getPostBySlug(slug)`

Fetch single post with full content.

**Parameters**:
- `slug` (string): Post slug (e.g., `'tipos-de-lentes-de-contato'`)

**Returns**: `Promise<Post | null>`

```javascript
{
  ...PostMetadata,
  content: string | object,      // HTML or Portable Text
  htmlContent: string,            // Pre-rendered HTML (if available)
  relatedPosts: PostMetadata[],   // Related posts
  relatedPodcasts: string[]       // Related podcast IDs
}
```

#### `getRecentPosts(limit = 3)`

Fetch recent posts (metadata only).

**Parameters**:
- `limit` (number): Maximum posts to return (default: 3)

**Returns**: `Promise<Array<PostMetadata>>`

#### `getFeaturedPosts(limit = 3)`

Fetch featured posts.

**Parameters**:
- `limit` (number): Maximum posts to return (default: 3)

**Returns**: `Promise<Array<PostMetadata>>`

#### `getPostsByCategory(category)`

Filter posts by category.

**Parameters**:
- `category` (string): Category name (e.g., `'Dúvidas Frequentes'`)

**Returns**: `Promise<Array<PostMetadata>>`

**Special**: `category === 'Todas'` returns all posts

#### `searchPosts(searchTerm)`

Search posts by term (title, excerpt, tags).

**Parameters**:
- `searchTerm` (string): Search query

**Returns**: `Promise<Array<PostMetadata>>`

#### `preloadCriticalPosts()`

Preload featured/recent posts during idle time.

**Returns**: `Promise<void>`

**Usage**:
```javascript
// Call after initial page load
useEffect(() => {
  preloadCriticalPosts();
}, []);
```

#### `clearCache()`

Clear all caches (development/testing).

**Returns**: `void`

#### `getCacheStats()`

Get cache statistics for monitoring.

**Returns**:
```javascript
{
  metadataCached: boolean,
  metadataCount: number,
  fullPostsCached: boolean,
  fullPostsCount: number,
  usingSanity: boolean,
  lastHealthCheck: { healthy: boolean, age: number } | null
}
```

#### `forceRefresh()`

Force refresh from Sanity (bypass cache and circuit breaker).

**Returns**: `Promise<Array<PostMetadata>>`

#### `getDataSource()`

Get current data source info.

**Returns**:
```javascript
{
  current: 'sanity' | 'static',
  usingSanity: boolean,
  canTrySanity: boolean,
  lastHealthCheck: object | null
}
```

---

## GROQ Queries

### Query Structure

GROQ queries are defined in `services/sanityClient.js` with parameterized builders:

#### All Posts Metadata

```groq
*[_type == "blogPost"] | order(date desc) {
  _id,
  id,
  slug,
  title,
  excerpt,
  author,
  date,
  category,
  tags,
  "image": image.asset->url,
  featured,
  seo,
  "contentLength": length(pt::text(content))
}
```

#### Single Post by Slug

```groq
*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  id,
  slug,
  title,
  excerpt,
  content,
  author,
  date,
  category,
  tags,
  "image": image.asset->url,
  featured,
  seo,
  relatedPodcasts
}
```

#### Advanced Projection (sanityBlogService.js)

```javascript
const metadataProjection = `{
  _id,
  id,
  title,
  "slug": slug.current,
  excerpt,
  "author": author->name,
  "authorDetails": author->{name, credentials, image},
  "category": category->title,
  "categorySlug": category->slug.current,
  tags,
  publishedAt,
  seo,
  featured,
  mainImage,
  legacyImageUrl,
  "plainText": pt::text(content)
}`
```

### Query Parameters

```javascript
// Example: Fetch post by slug
await sanityClient.fetch(
  queries.postBySlug(),
  { slug: 'tipos-de-lentes-de-contato' }
);

// Example: Get recent posts
await sanityClient.fetch(
  queries.recentPosts(),
  { limit: 5 }
);
```

---

## React Hooks

### `useBlogPosts()`

Fetch all posts with loading/error states.

```javascript
import { useBlogPosts } from '@/hooks/useSanityBlog';

function BlogList() {
  const { posts, loading, error, refetch } = useBlogPosts();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return posts.map(post => <PostCard key={post.id} post={post} />);
}
```

**Options**:
- `fallbackToStatic` (boolean, default: `true`): Use static data on error

### `useBlogPost(slug)`

Fetch single post by slug.

```javascript
import { useBlogPost } from '@/hooks/useSanityBlog';

function BlogPost({ slug }) {
  const { post, loading, error } = useBlogPost(slug);

  if (loading) return <Skeleton />;
  if (!post) return <NotFound />;

  return <Article post={post} />;
}
```

### `usePostsByCategory(category)`

Filter posts by category.

```javascript
const { posts, loading } = usePostsByCategory('Dúvidas Frequentes');
```

### `useFeaturedPosts()`

Get featured posts.

```javascript
const { posts, loading } = useFeaturedPosts();
```

### `useSearchPosts(searchTerm)`

Search posts.

```javascript
const [query, setQuery] = useState('');
const { posts, loading } = useSearchPosts(query);
```

---

## Testing

### Integration Test Suite

Run the comprehensive 9-test suite:

```bash
node scripts/test-sanity-integration.js
```

**Tests**:
1. ✅ Sanity Health Check
2. ✅ Get Posts Metadata (25 posts)
3. ✅ Get Post by Slug (with full content)
4. ✅ Get Recent Posts (3 posts, date sorted)
5. ✅ Get Featured Posts
6. ✅ Get Posts by Category (category filtering)
7. ✅ Search Posts (text search)
8. ✅ Cache and Data Source Info
9. ✅ Cache Clear

**Expected Output**:

```
============================================================
Sanity Integration Test Suite
============================================================

ℹ Testing: Sanity Health Check
  Sanity Health: HEALTHY
✓ PASSED: Sanity Health Check

ℹ Testing: Get Posts Metadata
  Found 25 posts
  Sample post: "Monovisão ou Lentes Multifocais..."
✓ PASSED: Get Posts Metadata

...

============================================================
Test Summary
============================================================
Tests Passed: 9
Tests Failed: 0
Total Tests: 9

Final Data Source: SANITY
✓ Successfully using Sanity CMS
```

### Manual Testing

```javascript
// Test health check
import { checkSanityHealth } from '@/services/sanityClient';
const health = await checkSanityHealth();
console.log(health);

// Test cache stats
import { getCacheStats } from '@/services/blogDataService';
console.log(getCacheStats());

// Force refresh
import { forceRefresh } from '@/services/blogDataService';
await forceRefresh();
```

---

## Troubleshooting

### Problem: Posts not loading

**Diagnosis**:
```javascript
import { getDataSource, getCacheStats } from '@/services/blogDataService';

console.log('Data Source:', getDataSource());
console.log('Cache Stats:', getCacheStats());
```

**Solutions**:

1. **Check Sanity health**:
   ```javascript
   import { checkSanityHealth } from '@/services/sanityClient';
   const health = await checkSanityHealth();
   // Expected: { healthy: true }
   ```

2. **Verify environment variables**:
   ```bash
   echo $VITE_SANITY_PROJECT_ID    # Should be: 92ocrdmp
   echo $VITE_SANITY_DATASET       # Should be: production
   ```

3. **Clear cache and retry**:
   ```javascript
   import { clearCache, forceRefresh } from '@/services/blogDataService';
   clearCache();
   await forceRefresh();
   ```

### Problem: Slow loading times

**Cause**: Cold start (no cache)

**Solution**: Preload critical posts
```javascript
import { preloadCriticalPosts } from '@/services/blogDataService';

useEffect(() => {
  // Preload during idle time
  preloadCriticalPosts();
}, []);
```

### Problem: Outdated content

**Cause**: Cache hit (60-second TTL)

**Solutions**:

1. **Wait 60 seconds** for automatic refresh
2. **Force refresh**:
   ```javascript
   import { forceRefresh } from '@/services/blogDataService';
   await forceRefresh();
   ```
3. **Clear cache manually**:
   ```javascript
   import { clearCache } from '@/services/blogDataService';
   clearCache();
   ```

### Problem: Sanity API timeout

**Error**: `SanityError: timeout of 5000ms exceeded`

**Causes**:
- Network issues
- Sanity service degradation
- Large query result

**Automatic fallback**: System automatically falls back to static posts

**Manual recovery**:
```javascript
// Check if using fallback
const source = getDataSource();
console.log(source.current); // 'sanity' or 'static'

// Wait for circuit breaker to reset (60s)
setTimeout(async () => {
  const refreshed = await forceRefresh();
  console.log('Refreshed from:', getDataSource().current);
}, 60000);
```

---

## Performance Optimization

### Caching Strategy

```
┌─────────────────────────────────────────┐
│ In-Memory Cache (Runtime)               │
│                                         │
│ ┌─────────────────┐  ┌───────────────┐ │
│ │ Metadata Cache  │  │ Full Posts    │ │
│ │ (Array)         │  │ (Map by slug) │ │
│ │ ~10KB           │  │ ~5-10KB each  │ │
│ └─────────────────┘  └───────────────┘ │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Sanity CDN Cache (60s TTL)              │
│ - Globally distributed                   │
│ - Edge caching                           │
│ - Automatic invalidation                 │
└─────────────────────────────────────────┘
```

### Bundle Splitting

Sanity chunk is lazy-loaded:

```javascript
// Vite config manual chunk
'sanity-cms': [
  '@sanity/client',
  '@sanity/image-url',
  '@portabletext/react'
]
```

**Result**: 53KB chunk (18KB gzipped), only loaded when blog accessed

### Lazy Loading Static Fallback

```javascript
// Only load when Sanity fails
let staticPostsModule = null;
const getStaticPosts = async () => {
  if (!staticPostsModule) {
    staticPostsModule = await import('../data/enhancedBlogPosts.js');
  }
  return staticPostsModule.enhancedBlogPosts || [];
};
```

### Preloading Critical Content

```javascript
// Preload top 5 posts during idle time
export const preloadCriticalPosts = async () => {
  if (typeof window === 'undefined') return;

  const preload = async () => {
    const featured = await getFeaturedPosts(3);
    const recent = await getRecentPosts(3);

    const criticalSlugs = [...new Set([
      ...featured.map(p => p.slug),
      ...recent.map(p => p.slug)
    ])].slice(0, 5);

    await Promise.all(
      criticalSlugs.map(slug => getPostBySlug(slug))
    );
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 3000 });
  } else {
    setTimeout(preload, 2000);
  }
};
```

### Performance Metrics

| Metric | Value |
|--------|-------|
| **Metadata fetch** | < 500ms (CDN cache hit) |
| **Full post fetch** | < 800ms (first load) |
| **Cache hit** | < 5ms (in-memory) |
| **Fallback switch** | < 100ms (lazy import) |
| **Chunk size** | 53KB (18KB gzipped) |

---

## Best Practices

### 1. Always Use `blogDataService.js`

```javascript
// ✅ Correct
import { getPostsMetadata } from '@/services/blogDataService';

// ❌ Wrong (bypasses fallback)
import { fetchAllPosts } from '@/lib/sanityUtils';
```

### 2. Handle Loading States

```javascript
const { posts, loading, error } = useBlogPosts();

if (loading) return <Skeleton />;
if (error) {
  // Error is logged, but static fallback is already loaded
  // No need to show error to user
}
return <PostList posts={posts} />;
```

### 3. Preload Critical Content

```javascript
// In main blog page
useEffect(() => {
  preloadCriticalPosts();
}, []);
```

### 4. Monitor Data Source

```javascript
// In production, log source for debugging
useEffect(() => {
  const source = getDataSource();
  console.log('[Blog] Data source:', source.current);
}, []);
```

### 5. Cache Awareness

```javascript
// Don't clear cache unnecessarily
// Only clear for testing or manual refresh

// ✅ Good: User-initiated refresh
<button onClick={() => forceRefresh()}>Refresh</button>

// ❌ Bad: Automatic clear on every render
useEffect(() => clearCache(), []); // Don't do this!
```

---

## Migration Guide

### From Static to Sanity

If migrating from static-only blog:

1. **Install dependencies**:
   ```bash
   npm install @sanity/client @sanity/image-url @portabletext/react
   ```

2. **Set environment variables**:
   ```bash
   VITE_SANITY_PROJECT_ID=92ocrdmp
   VITE_SANITY_DATASET=production
   ```

3. **Update imports**:
   ```javascript
   // Before
   import { blogPosts } from '@/data/blogPosts';

   // After
   import { getPostsMetadata } from '@/services/blogDataService';
   const posts = await getPostsMetadata();
   ```

4. **Use React hooks**:
   ```javascript
   // Before
   const posts = blogPosts;

   // After
   const { posts, loading } = useBlogPosts();
   ```

5. **Test integration**:
   ```bash
   node scripts/test-sanity-integration.js
   ```

---

## Monitoring & Observability

### Health Monitoring

```javascript
// Real-time health check
setInterval(() => {
  const stats = getCacheStats();
  const source = getDataSource();

  console.log({
    healthy: stats.lastHealthCheck?.healthy,
    source: source.current,
    cacheHits: stats.metadataCount,
    lastCheck: stats.lastHealthCheck?.age
  });
}, 60000);
```

### Error Tracking

All errors are logged with context:

```javascript
console.warn('[BlogDataService] Sanity getPostsMetadata failed:', error.message);
console.error('[Sanity] Query failed after retries:', error);
```

### Performance Monitoring

```javascript
const start = performance.now();
const posts = await getPostsMetadata();
const duration = performance.now() - start;
console.log(`Fetch took ${duration.toFixed(2)}ms`);
```

---

## Appendix

### Content Schema (Sanity Studio)

```javascript
{
  name: 'blogPost',
  type: 'document',
  fields: [
    { name: 'id', type: 'number' },
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'excerpt', type: 'text' },
    { name: 'content', type: 'array', of: [{ type: 'block' }] },
    { name: 'mainImage', type: 'image' },
    { name: 'author', type: 'reference', to: [{ type: 'author' }] },
    { name: 'category', type: 'reference', to: [{ type: 'category' }] },
    { name: 'tags', type: 'array', of: [{ type: 'string' }] },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'featured', type: 'boolean' },
    { name: 'seo', type: 'object' },
    { name: 'relatedPosts', type: 'array' },
    { name: 'relatedPodcasts', type: 'array' }
  ]
}
```

### Portable Text Rendering

```javascript
import PortableTextRenderer from '@/components/PortableTextRenderer';

<PortableTextRenderer content={post.content} />
```

**Supported blocks**:
- Headings (h1-h4)
- Paragraphs
- Lists (bullet, numbered)
- Blockquotes
- Marks (strong, em, link)

### Image Optimization

```javascript
import { urlFor } from '@/lib/sanityUtils';

const imageUrl = urlFor(post.mainImage)
  .width(1200)
  .quality(85)
  .format('webp')
  .url();
```

---

## Resources

### Internal Documentation
- [Blog Architecture](./BLOG_ARCHITECTURE.md)
- [SEO Components Guide](../guidelines/SEO_COMPONENTS_GUIDE.md)
- [CLAUDE.md](../../CLAUDE.md) - Main development guide

### External Resources
- [Sanity.io Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Portable Text Spec](https://portabletext.org/)
- [@sanity/client API](https://www.sanity.io/docs/js-client)

### Support
- **Sanity Project**: https://saraivavision.sanity.studio
- **Project ID**: 92ocrdmp
- **Dataset**: production

---

**Last Updated**: 2025-10-28
**Maintainer**: Dr. Philipe Saraiva Cruz
**Version**: 1.0.0
**Status**: Production ✅
