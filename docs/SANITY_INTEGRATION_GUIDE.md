# Sanity CMS Integration Guide

**Author**: Dr. Philipe Saraiva Cruz
**Date**: 2025-10-25
**Status**: ✅ Production Ready

## Overview

The blog system now uses **Sanity CMS** as the primary content source with automatic fallback to static blog posts. This provides the best of both worlds:

- **Content Management**: Easy blog post editing through Sanity Studio
- **Reliability**: Automatic fallback to static files if Sanity fails
- **Performance**: Intelligent caching and circuit breaker pattern
- **Zero Breaking Changes**: Existing components work without modification

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Blog Components                        │
│            (BlogPage, LatestBlogPosts, etc.)            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              src/content/blog.js                         │
│           (Backward-compatible API)                      │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│         src/services/blogDataService.js                  │
│         (Sanity + Static Fallback Logic)                │
└────┬─────────────────────────────────────────┬──────────┘
     │                                          │
     ▼                                          ▼
┌──────────────────────┐          ┌──────────────────────┐
│  Sanity CMS          │          │  Static Blog Posts   │
│  (Primary Source)    │          │  (Fallback Source)   │
│                      │          │                      │
│  - Project: 92ocrdmp │          │  - enhancedBlogPosts │
│  - Dataset: prod.    │          │  - Always available  │
│  - 25 posts          │          │  - No network needed │
└──────────────────────┘          └──────────────────────┘
```

## Key Features

### 1. Automatic Fallback
- **Primary**: Tries to fetch from Sanity CMS first
- **Fallback**: Uses static blog posts if Sanity fails
- **Seamless**: Users never see errors, always get content
- **Smart**: Circuit breaker prevents repeated Sanity failures

### 2. Performance Optimization
- **Caching**: Metadata and full posts cached in memory
- **Lazy Loading**: Only loads full content when needed
- **Retry Logic**: Exponential backoff for transient failures
- **Timeout**: 5-second timeout prevents hanging requests

### 3. Content Format Handling
- **Portable Text**: Sanity posts use Portable Text format
- **HTML**: Static posts use HTML format
- **Automatic Conversion**: Service converts Portable Text → HTML
- **Type Detection**: `contentType` field indicates format

### 4. Monitoring & Debugging
- **Data Source Tracking**: Know if using Sanity or fallback
- **Cache Statistics**: Monitor memory usage and cache hits
- **Health Checks**: Periodic Sanity connectivity tests
- **Manual Control**: Force refresh, clear cache, check status

## File Structure

```
src/
├── services/
│   ├── sanityClient.js          # Sanity client with retry logic
│   └── blogDataService.js       # Main service with fallback
├── content/
│   └── blog.js                  # Public API (unchanged)
└── data/
    ├── enhancedBlogPosts.js     # Static fallback data
    └── blogPostsLoader.js       # Legacy loader (replaced)

sanity/
├── sanity.config.js             # Sanity project configuration
├── schemas/
│   ├── blogPost.js              # Blog post schema
│   └── ...                      # Other schemas
└── scripts/
    ├── export-blog-posts.js     # Export from Sanity
    ├── upload-images.js         # Upload images to Sanity
    └── convert-html-to-blocks.js # HTML → Portable Text

scripts/
└── test-sanity-integration.js   # Integration test suite
```

## Usage

### Basic Usage (No Changes Required)

The integration is **drop-in compatible**. Existing components continue to work:

```javascript
import { blogPosts, getPostBySlugSync } from '@/content/blog';

// Legacy synchronous API (static only)
const posts = blogPosts;
const post = getPostBySlugSync('my-post-slug');
```

### Recommended Usage (Async API)

For better performance, use the async API:

```javascript
import {
  getBlogPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchBlogPosts
} from '@/content/blog';

// Get lightweight metadata (fast)
const posts = await getBlogPostsMetadata();

// Get single post with full content
const post = await getPostBySlug('my-post-slug');

// Get recent posts
const recent = await getRecentPosts(5);

// Get featured posts
const featured = await getFeaturedPosts(3);

// Filter by category
const categoryPosts = await getPostsByCategory('Prevenção');

// Search posts
const results = await searchBlogPosts('catarata');
```

### Admin/Monitoring Functions

For debugging and admin operations:

```javascript
import {
  forceRefreshBlogData,
  getBlogDataSource,
  getBlogCacheStats
} from '@/content/blog';

// Force refresh from Sanity (bypass cache)
const posts = await forceRefreshBlogData();

// Check current data source
const source = getBlogDataSource();
console.log('Using:', source.current); // 'sanity' or 'static'
console.log('Sanity available:', source.usingSanity);

// Get cache statistics
const stats = getBlogCacheStats();
console.log('Metadata cached:', stats.metadataCached);
console.log('Full posts cached:', stats.fullPostsCount);
console.log('Data source:', stats.usingSanity ? 'Sanity' : 'Static');
```

## Testing

### Manual Integration Test

Run the comprehensive integration test:

```bash
node scripts/test-sanity-integration.js
```

**Expected Output:**
```
✓ Sanity Health Check
✓ Get Posts Metadata (25 posts)
✓ Get Post by Slug
✓ Get Recent Posts
✓ Get Featured Posts
✓ Get Posts by Category
✓ Search Posts
✓ Cache and Data Source Info
✓ Cache Clear

Tests Passed: 9
Tests Failed: 0
Final Data Source: SANITY
```

### Test Fallback Behavior

To test static fallback, temporarily break Sanity connection:

```javascript
// In src/services/sanityClient.js, change projectId to invalid value
const SANITY_PROJECT_ID = 'invalid-project-id';

// Run tests - should still pass with static fallback
node scripts/test-sanity-integration.js
```

## Content Management

### Editing Blog Posts

1. **Start Sanity Studio:**
   ```bash
   cd sanity
   npm run dev
   # Studio available at http://localhost:3333
   ```

2. **Edit Content:**
   - Open http://localhost:3333
   - Navigate to "Blog Post" document type
   - Edit posts using Portable Text editor
   - Save changes (automatically synced)

3. **View Changes:**
   - Changes appear immediately on frontend
   - No rebuild required
   - Caching respects Sanity CDN updates

### Adding New Posts

**Option 1: Sanity Studio (Recommended)**
```bash
cd sanity
npm run dev
# Create new post in Studio UI
```

**Option 2: Import from Static**
```bash
# Add post to src/data/blogPosts.js
# Then migrate to Sanity
cd sanity
npm run convert-content
npm run upload-images
```

### Content Format

**Sanity (Portable Text):**
```javascript
{
  _type: "blogPost",
  title: "Post Title",
  slug: { current: "post-slug" },
  content: [
    {
      _type: "block",
      children: [{ _type: "span", text: "Content..." }]
    }
  ]
}
```

**Static (HTML):**
```javascript
{
  id: 1,
  slug: "post-slug",
  title: "Post Title",
  content: "<h2>Heading</h2><p>Content...</p>"
}
```

**Automatic Conversion:**
The service automatically converts Portable Text to HTML using `portableText.toBasicHTML()`.

## Troubleshooting

### Issue: "Using static fallback" warning

**Cause**: Sanity CMS is unavailable or connection failed

**Solutions:**
1. Check internet connection
2. Verify Sanity project ID in `src/services/sanityClient.js`
3. Check Sanity service status: https://status.sanity.io
4. Test connection: `node scripts/test-sanity-integration.js`

### Issue: Stale content after Sanity update

**Cause**: Cache holding old data

**Solution:**
```javascript
import { forceRefreshBlogData } from '@/content/blog';
await forceRefreshBlogData(); // Clears cache, fetches fresh data
```

### Issue: Posts missing or incomplete

**Cause**: Schema mismatch or migration incomplete

**Solution:**
```bash
# Verify all posts migrated
cd sanity
npm run verify

# Re-run migration if needed
npm run convert-content
npm run upload-images
```

### Issue: Slow initial load

**Cause**: First request fetching all metadata from Sanity

**Solution**: This is normal. Subsequent requests use cache. For faster initial load:

```javascript
// In main App.jsx or layout, preload critical posts
import { preloadCriticalBlogPosts } from '@/content/blog';

useEffect(() => {
  preloadCriticalBlogPosts(); // During idle time
}, []);
```

## Performance Considerations

### Caching Strategy
- **Metadata**: Cached indefinitely until `clearCache()` or `forceRefresh()`
- **Full Posts**: LRU cache with Map, grows as posts are accessed
- **Circuit Breaker**: Prevents repeated Sanity failures (60s interval)

### Network Optimization
- **CDN**: Sanity client uses CDN for read operations
- **Timeout**: 5-second timeout prevents hanging
- **Retry**: Exponential backoff (1s, 2s) for transient failures
- **Lazy Loading**: Full content loaded only when needed

### Bundle Size Impact
- **Sanity Client**: ~50KB (only loaded when Sanity available)
- **Static Fallback**: ~200KB (loaded on demand via dynamic import)
- **Service Logic**: ~10KB (always loaded)
- **Total Overhead**: ~60KB (Sanity) or ~10KB (fallback only)

## Migration Checklist

✅ **Completed:**
- [x] Sanity client with error handling
- [x] Blog data service with fallback logic
- [x] Updated content API to use new service
- [x] 25 blog posts migrated to Sanity
- [x] Images uploaded to Sanity CDN
- [x] HTML → Portable Text conversion
- [x] Integration tests (9/9 passing)
- [x] Circuit breaker pattern
- [x] Caching layer
- [x] Documentation

📋 **Optional Enhancements:**
- [ ] Sanity webhooks for cache invalidation
- [ ] Advanced Portable Text rendering (images, code blocks)
- [ ] Real-time updates with Sanity listeners
- [ ] Admin UI for cache management
- [ ] Performance monitoring dashboard

## Configuration

### Sanity Client Settings

Edit `src/services/sanityClient.js`:

```javascript
const SANITY_PROJECT_ID = '92ocrdmp';        // Your project ID
const SANITY_DATASET = 'production';         // Dataset name
const SANITY_API_VERSION = '2025-10-25';     // API version
const SANITY_TIMEOUT = 5000;                 // Request timeout (ms)
```

### Service Settings

Edit `src/services/blogDataService.js`:

```javascript
let healthCheckInterval = 60000; // Health check interval (ms)
// Adjust caching behavior, retry logic, etc.
```

## Support

**Documentation:**
- Sanity Docs: https://www.sanity.io/docs
- GROQ Query Reference: https://www.sanity.io/docs/groq
- Portable Text Spec: https://www.portabletext.org/

**Internal Resources:**
- `sanity/FRONTEND_INTEGRATION.md` - Detailed Sanity integration guide
- `scripts/test-sanity-integration.js` - Comprehensive test suite
- `src/services/sanityClient.js` - Client implementation

**Contact:**
- Dr. Philipe Saraiva Cruz
- Email: philipe_cruz@outlook.com

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
**Status**: ✅ Production Ready
