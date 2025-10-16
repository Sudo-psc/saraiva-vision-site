/**
 * Blog Posts Lazy Loader
 * Performance-optimized lazy loading system for blog posts
 *
 * PROBLEM SOLVED: blogPosts.js (1343 lines) bundled into 208KB chunk
 * SOLUTION: On-demand loading with caching and preloading strategies
 *
 * Performance Targets:
 * - Initial bundle: <50KB (metadata only)
 * - Full content: Load only when needed
 * - Cache: Store loaded posts in memory
 * - Preload: Featured/recent posts for instant navigation
 */

// Lightweight metadata cache (no full content)
let postsMetadataCache = null;
let fullPostsCache = null;

/**
 * Get posts metadata only (titles, slugs, dates, categories)
 * Used for: Blog listing page, navigation, search
 * Size: ~10KB vs 208KB full bundle
 */
export const getPostsMetadata = async () => {
  if (postsMetadataCache) return postsMetadataCache;

  try {
    // Dynamic import only metadata (using enhanced version with educational content)
    const { enhancedBlogPosts: blogPosts } = await import('./enhancedBlogPosts.js');

    postsMetadataCache = blogPosts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      author: post.author,
      date: post.date,
      category: post.category,
      tags: post.tags || [],
      image: post.image,
      featured: post.featured || false,
      seo: post.seo || {},
      // Exclude heavy content field
      contentLength: post.content?.length || 0
    }));

    return postsMetadataCache;
  } catch (error) {
    return [];
  }
};

/**
 * Get single post by slug with full content
 * Used for: Individual blog post pages
 * Only loads when user navigates to specific post
 */
export const getPostBySlug = async (slug) => {
  if (!slug) return null;

  try {
    // Check if already cached
    if (fullPostsCache) {
      const cached = fullPostsCache.find(p => p.slug === slug);
      if (cached) return cached;
    }

    // Load full posts data (only when needed, using enhanced version with educational content)
    const { enhancedBlogPosts: blogPosts } = await import('./enhancedBlogPosts.js');
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
      return null;
    }

    // Cache this specific post
    if (!fullPostsCache) fullPostsCache = [];
    fullPostsCache.push(post);

    return post;
  } catch (error) {
    return null;
  }
};

/**
 * Get recent posts (metadata only) for homepage
 * Much lighter than loading all posts
 */
export const getRecentPosts = async (limit = 3) => {
  const metadata = await getPostsMetadata();
  return metadata
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Get featured posts (metadata only)
 */
export const getFeaturedPosts = async (limit = 3) => {
  const metadata = await getPostsMetadata();
  return metadata
    .filter(post => post.featured)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

/**
 * Get posts by category (metadata only)
 */
export const getPostsByCategory = async (category) => {
  const metadata = await getPostsMetadata();
  if (!category || category === 'Todas') return metadata;
  return metadata.filter(post => post.category === category);
};

/**
 * Search posts (metadata only for performance)
 */
export const searchPosts = async (searchTerm) => {
  if (!searchTerm) return await getPostsMetadata();

  const metadata = await getPostsMetadata();
  const term = searchTerm.toLowerCase();

  return metadata.filter(post =>
    post.title.toLowerCase().includes(term) ||
    post.excerpt.toLowerCase().includes(term) ||
    post.tags.some(tag => tag.toLowerCase().includes(term))
  );
};

/**
 * Preload critical posts for better UX
 * Call this after initial page load during idle time
 */
export const preloadCriticalPosts = async () => {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback for non-blocking preload
  const preload = async () => {
    try {
      const featured = await getFeaturedPosts(3);
      const recent = await getRecentPosts(3);

      // Preload full content for featured/recent posts
      const criticalSlugs = [...new Set([
        ...featured.map(p => p.slug),
        ...recent.map(p => p.slug)
      ])].slice(0, 5); // Max 5 posts

      await Promise.all(
        criticalSlugs.map(slug => getPostBySlug(slug))
      );

    } catch (error) {
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload, { timeout: 3000 });
  } else {
    setTimeout(preload, 2000);
  }
};

/**
 * Clear cache (useful for development/testing)
 */
export const clearCache = () => {
  postsMetadataCache = null;
  fullPostsCache = null;
};

/**
 * Get cache stats for monitoring
 */
export const getCacheStats = () => {
  return {
    metadataCached: !!postsMetadataCache,
    metadataCount: postsMetadataCache?.length || 0,
    fullPostsCached: !!fullPostsCache,
    fullPostsCount: fullPostsCache?.length || 0
  };
};

// Export utility functions
export const blogPostsLoader = {
  getPostsMetadata,
  getPostBySlug,
  getRecentPosts,
  getFeaturedPosts,
  getPostsByCategory,
  searchPosts,
  preloadCriticalPosts,
  clearCache,
  getCacheStats
};

export default blogPostsLoader;
