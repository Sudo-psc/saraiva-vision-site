# Sanity CMS Architecture - SaraivaVision

**Author**: Dr. Philipe Saraiva Cruz
**Date**: 2025-10-25
**Version**: 1.0.0

## Overview

Integração completa do Sanity.io CMS para gerenciamento de conteúdo do blog, implementando arquitetura híbrida (build-time + runtime) com fallback inteligente para dados estáticos.

---

## 🏗️ Architecture Layers

### Layer 1: Sanity Client (`src/lib/sanityClient.js`)

**Purpose**: Cliente Sanity configurado centralmente

```javascript
import { sanityClient, previewClient, getClient } from '@/lib/sanityClient';

// Main client (uses CDN in production)
sanityClient.fetch(query);

// Preview client (for draft content)
previewClient.fetch(query);

// Smart client selector
getClient(isPreview).fetch(query);
```

**Features**:
- CDN usage in production for caching
- Preview mode for draft content
- Environment-based configuration
- Token authentication for private operations

**Configuration**:
```javascript
{
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  useCdn: import.meta.env.PROD,
  token: import.meta.env.VITE_SANITY_TOKEN
}
```

---

### Layer 2: Sanity Utils (`src/lib/sanityUtils.js`)

**Purpose**: Utilities, transformers, and GROQ queries

**Key Functions**:

```javascript
import {
  // Image optimization
  urlFor,
  getImageUrl,

  // Data transformation
  transformBlogPost,
  transformBlogPosts,

  // GROQ queries
  queries,

  // Fetch helpers
  fetchAllPosts,
  fetchPostBySlug,
  fetchPostsByCategory,
  fetchPostsByTag,
  fetchFeaturedPosts,
  searchPosts
} from '@/lib/sanityUtils';
```

**GROQ Queries**:
- `allPosts` - All published posts ordered by date
- `postBySlug` - Single post by slug
- `postsByCategory` - Posts filtered by category
- `postsByTag` - Posts with specific tag
- `featuredPosts` - Featured posts (3 max)
- `recentPosts` - Recent posts with limit
- `searchPosts` - Full-text search

**Image Optimization**:
```javascript
// Generate optimized image URL
const url = getImageUrl(post.image, 800, 600, 'webp', 90);

// Custom builder
urlFor(post.image)
  .width(800)
  .height(600)
  .format('webp')
  .quality(90)
  .url();
```

---

### Layer 3: Blog Data Service (`src/services/blogDataService.js`)

**Purpose**: Data fetching with circuit breaker and fallback

**Architecture Pattern**:
```
Sanity CMS (Primary)
     ↓ [fetch]
Circuit Breaker Check
     ↓ [OK]
Data Normalization
     ↓ [ERROR]
Static Fallback (Secondary)
```

**Features**:
1. **Circuit Breaker Pattern**: Prevents repeated Sanity failures
2. **Automatic Fallback**: Uses static data on Sanity errors
3. **Caching Layer**: Metadata and full posts cached
4. **Health Monitoring**: Tracks Sanity availability

**Key Functions**:
```javascript
import {
  getPostsMetadata,    // Lightweight metadata (~10KB)
  getPostBySlug,       // Full post with content
  getRecentPosts,      // Recent posts metadata
  getFeaturedPosts,    // Featured posts metadata
  getPostsByCategory,  // Category-filtered posts
  searchPosts,         // Search functionality
  preloadCriticalPosts // Preload strategy
} from '@/services/blogDataService';
```

**Circuit Breaker**:
```javascript
// Health check every 60 seconds
// Automatically switches to fallback on repeated failures
// Retries Sanity after cooldown period
```

---

### Layer 4: Content API (`src/content/blog.js`)

**Purpose**: Public API for components (backward compatible)

**Exports**:
```javascript
import {
  // Configuration
  categoryConfig,
  categories,

  // Async API (recommended - uses Sanity + fallback)
  getBlogPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchBlogPosts,

  // Admin/Monitoring
  forceRefreshBlogData,
  getBlogDataSource,
  getBlogCacheStats,

  // Legacy API (synchronous - static only)
  blogPosts,
  getPostBySlugSync,
  getRecentPostsSync
} from '@/content/blog';
```

**Migration Path**:
```javascript
// Old (synchronous, heavy)
const posts = blogPosts;
const post = getPostBySlugSync(slug);

// New (async, optimized, Sanity-enabled)
const posts = await getBlogPostsMetadata();
const post = await getPostBySlug(slug);
```

---

### Layer 5: React Hooks (`src/hooks/useSanityBlog.js`)

**Purpose**: React hooks for component integration

**Available Hooks**:
```javascript
import {
  useBlogPosts,       // All posts
  useBlogPost,        // Single post by slug
  usePostsByCategory, // Category filter
  usePostsByTag,      // Tag filter
  useFeaturedPosts,   // Featured posts
  useSearchPosts      // Search functionality
} from '@/hooks/useSanityBlog';
```

**Hook Pattern**:
```javascript
const { posts, loading, error, refetch } = useBlogPosts({
  fallbackToStatic: true  // Enable static fallback
});

// Features:
// - Loading states
// - Error handling
// - Automatic fallback to static data
// - Feature flag support (VITE_ENABLE_SANITY)
```

**Feature Flag**:
```javascript
// .env
VITE_ENABLE_SANITY=true  // Enable Sanity (default)
VITE_ENABLE_SANITY=false // Use static data only
```

---

### Layer 6: Build-Time Script (`scripts/build-blog-posts-sanity.js`)

**Purpose**: Fetch posts at build time and generate static files

**Usage**:
```bash
npm run sanity:build
```

**What it does**:
1. Fetches all posts from Sanity CMS
2. Transforms to frontend format
3. Generates `src/data/blogPosts.sanity.js`
4. Creates backup of existing static file
5. Provides build statistics

**Output**:
```javascript
// src/data/blogPosts.sanity.js (auto-generated)
export const blogPosts = [
  // ... 25 posts transformed
];

export default blogPosts;
```

**Build Report Example**:
```
📊 Build Report:
   ─────────────────────────────────────
   Categories:
     • Prevenção: 10 posts
     • Tratamento: 8 posts
     • Dúvidas Frequentes: 4 posts
     • Tecnologia: 3 posts

   Featured posts: 23
   Unique tags: 148
   Date range: 29/09/2025 → 13/10/2025
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Component Layer                    │
│  (BlogPage, BlogPost, widgets)                      │
└─────────────────┬───────────────────────────────────┘
                  │ imports from
                  ↓
┌─────────────────────────────────────────────────────┐
│            Content API (blog.js)                     │
│  - categoryConfig, categories                       │
│  - getBlogPostsMetadata(), getPostBySlug()         │
└─────────────────┬───────────────────────────────────┘
                  │ delegates to
                  ↓
┌─────────────────────────────────────────────────────┐
│        Blog Data Service (blogDataService.js)       │
│  - Circuit breaker pattern                         │
│  - Health monitoring                               │
│  - Cache management                                │
└──┬──────────────────────────────────────────────┬───┘
   │ Primary Source                  Secondary    │
   ↓                                  Fallback     ↓
┌──────────────────┐              ┌─────────────────┐
│  Sanity Utils    │              │  Static Data    │
│  (sanityUtils.js)│              │  (blogPosts.js) │
└────────┬─────────┘              └─────────────────┘
         │ uses
         ↓
┌──────────────────┐
│  Sanity Client   │
│(sanityClient.js) │
└────────┬─────────┘
         │ connects to
         ↓
┌──────────────────┐
│   Sanity CMS     │
│  (92ocrdmp)      │
└──────────────────┘
```

---

## 📦 File Organization

```
/home/saraiva-vision-site/
├── src/
│   ├── lib/
│   │   ├── sanityClient.js          # Layer 1: Client config
│   │   └── sanityUtils.js           # Layer 2: Utils & queries
│   ├── services/
│   │   └── blogDataService.js       # Layer 3: Service + fallback
│   ├── content/
│   │   └── blog.js                  # Layer 4: Public API
│   ├── hooks/
│   │   └── useSanityBlog.js         # Layer 5: React hooks
│   ├── data/
│   │   ├── blogPosts.js             # Static fallback
│   │   ├── blogPosts.sanity.js      # Generated from Sanity
│   │   └── blogPosts.static-backup.js # Backup
│   └── modules/blog/pages/
│       └── BlogPage.jsx             # Consumer
├── scripts/
│   └── build-blog-posts-sanity.js   # Layer 6: Build script
└── docs/
    └── SANITY_ARCHITECTURE.md       # This file
```

---

## 🚀 Usage Examples

### Component Integration (Recommended)

```javascript
// src/modules/blog/pages/BlogPage.jsx
import { blogPosts, getPostBySlugSync } from '@/content/blog';

// Synchronous access (uses static or Sanity-generated data)
const currentPost = slug ? getPostBySlugSync(slug) : null;
const filteredPosts = blogPosts.filter(/* filters */);
```

### Async Component (Modern)

```javascript
import { getBlogPostsMetadata, getPostBySlug } from '@/content/blog';

// Fetch at component mount
useEffect(() => {
  const loadPosts = async () => {
    const posts = await getBlogPostsMetadata(); // Sanity + fallback
    setPosts(posts);
  };
  loadPosts();
}, []);
```

### React Hook (Easiest)

```javascript
import { useBlogPosts, useBlogPost } from '@/hooks/useSanityBlog';

function BlogList() {
  const { posts, loading, error } = useBlogPosts();

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;

  return <PostGrid posts={posts} />;
}

function BlogPost({ slug }) {
  const { post, loading } = useBlogPost(slug);

  if (loading) return <Skeleton />;

  return <Article post={post} />;
}
```

---

## 🛠️ Build Integration

### Development Workflow

```bash
# 1. Start dev server (uses static data by default)
npm run dev:vite

# 2. Fetch from Sanity at build time
npm run sanity:build

# 3. Build frontend with Sanity data
npm run build:vite

# 4. Deploy
sudo npm run deploy:quick
```

### Environment Variables

```bash
# .env
VITE_SANITY_PROJECT_ID=92ocrdmp
VITE_SANITY_DATASET=production
VITE_SANITY_TOKEN=<optional-for-private-ops>
VITE_ENABLE_SANITY=true
```

---

## 🔧 Configuration

### Sanity Project

- **Project ID**: `92ocrdmp`
- **Dataset**: `production`
- **API Version**: `2025-10-25`
- **Content Type**: `blogPost`

### Schema Fields

```javascript
{
  _id: string,
  id: number,
  slug: { current: string },
  title: string,
  excerpt: string,
  content: string | PortableText,
  image: string,
  author: string,
  date: string,
  publishedAt: string,
  updatedAt: string,
  category: string,
  tags: string[],
  featured: boolean,
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: string[]
  },
  relatedPodcasts: object[]
}
```

---

## 📊 Performance Characteristics

### Bundle Sizes

- **Static import** (`blogPosts`): ~280KB (all posts)
- **Metadata only** (`getPostsMetadata`): ~10KB (lightweight)
- **Single post** (`getPostBySlug`): Lazy-loaded only when needed

### Caching Strategy

1. **Metadata Cache**: In-memory, persists across requests
2. **Full Post Cache**: Map-based, per-slug caching
3. **Circuit Breaker**: 60-second health check interval

### Fallback Behavior

```javascript
// Request flow
Sanity Request
  ↓ [Success]
Return Normalized Data + Cache
  ↓ [Network Error]
Check Circuit Breaker
  ↓ [Open - too many failures]
Return Static Data Immediately
  ↓ [Closed - retry allowed]
Retry with Exponential Backoff
  ↓ [Max retries exceeded]
Return Static Data + Mark Unhealthy
```

---

## 🔐 Security

### Public Read Operations

- No token required for published content
- CDN caching enabled for performance
- Read-only access pattern

### Private Operations

- Token required: `VITE_SANITY_TOKEN`
- Preview client for draft content
- Admin operations gated

---

## 🧪 Testing

### Manual Testing

```bash
# Test build script
npm run sanity:build

# Verify generated file
cat src/data/blogPosts.sanity.js | head -50

# Test Vite build
npm run build:norender

# Check bundle includes Sanity code
grep -r "sanityClient" dist/assets/*.js
```

### Integration Testing

```javascript
// Test fallback mechanism
import { getPostBySlug } from '@/services/blogDataService';

// Simulate Sanity failure
vi.mock('@/lib/sanityUtils', () => ({
  fetchPostBySlug: vi.fn().mockRejectedValue(new Error('Network error'))
}));

const post = await getPostBySlug('test-slug');
expect(post).toBeTruthy(); // Should fallback to static
```

---

## 📝 Migration Notes

### Phase 1: Infrastructure (✅ Complete)

- ✅ Sanity client configuration
- ✅ Utilities and GROQ queries
- ✅ React hooks implementation
- ✅ Build-time fetch script
- ✅ Integration with blogDataService
- ✅ Testing and validation

### Phase 2: Component Migration (⏳ Optional)

Components can gradually adopt async API:

```javascript
// Before (synchronous)
const posts = blogPosts;

// After (async with Sanity)
const posts = await getBlogPostsMetadata();
```

**Note**: Current BlogPage works without changes because `blogPosts` is now Sanity-generated at build time via `blogPosts.sanity.js`.

### Phase 3: Webhook Integration (🔜 Future)

- Configure Sanity webhook to trigger builds
- Implement GitHub Action for auto-deploy
- Enable real-time content updates

---

## 🐛 Troubleshooting

### Build fails with Sanity error

```bash
# Check Sanity credentials
echo $VITE_SANITY_PROJECT_ID  # Should be: 92ocrdmp
echo $VITE_SANITY_DATASET     # Should be: production

# Test Sanity connection manually
node scripts/build-blog-posts-sanity.js
```

### Posts not updating

```bash
# Regenerate from Sanity
npm run sanity:build

# Rebuild frontend
npm run build:vite

# Deploy
sudo npm run deploy:quick
```

### Fallback to static data

```javascript
// Check data source
import { getBlogDataSource } from '@/content/blog';
console.log(getBlogDataSource()); // 'sanity' or 'static'

// Force refresh from Sanity
import { forceRefreshBlogData } from '@/content/blog';
await forceRefreshBlogData();
```

---

## 📚 Related Documentation

- [Blog Architecture](./architecture/BLOG_ARCHITECTURE.md)
- [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)
- [CLAUDE.md](../CLAUDE.md) - Main development guide

---

## 🎯 Next Steps

1. **Webhook Setup**: Configure Sanity webhook to trigger builds on content changes
2. **GitHub Actions**: Automate build + deploy on Sanity updates
3. **Monitoring**: Add analytics for Sanity vs static usage
4. **Optimization**: Implement incremental static regeneration (ISR)

---

**Last Updated**: 2025-10-25
**Status**: ✅ Production Ready
**Version**: 1.0.0
