/**
 * Blog Utilities - Next.js 15 Compatible
 * Provides functions to fetch and manipulate blog data
 */

import { blogPosts } from '@/src/content/blog';
import type { BlogPostPreview } from '@/types/homepage';

/**
 * Transform blog post data to BlogPostPreview format
 */
function transformPost(post: any): BlogPostPreview {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image || post.coverImage,
    coverImage: post.coverImage || post.image,
    category: post.category || 'Geral',
    date: post.date || post.publishedAt || new Date().toISOString(),
    publishedAt: post.publishedAt || post.date,
    author: post.author
      ? typeof post.author === 'string'
        ? { name: post.author }
        : post.author
      : { name: 'Dr. Philipe Saraiva Cruz' },
    tags: post.tags || [],
    readTime: post.readTime || calculateReadTime(post.content || post.excerpt),
  };
}

/**
 * Calculate estimated read time based on content
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Get recent blog posts
 */
export function getRecentPosts(limit: number = 3): BlogPostPreview[] {
  return blogPosts
    .sort((a, b) => {
      const dateA = new Date(a.date || a.publishedAt || 0);
      const dateB = new Date(b.date || b.publishedAt || 0);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit)
    .map(transformPost);
}

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPostPreview[] {
  return blogPosts.map(transformPost);
}

/**
 * Get blog post by slug
 */
export function getPostBySlug(slug: string): BlogPostPreview | undefined {
  const post = blogPosts.find((p) => p.slug === slug);
  return post ? transformPost(post) : undefined;
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string, limit?: number): BlogPostPreview[] {
  const filtered = blogPosts
    .filter((post) => post.category === category)
    .map(transformPost);

  return limit ? filtered.slice(0, limit) : filtered;
}

/**
 * Get featured posts
 */
export function getFeaturedPosts(limit?: number): BlogPostPreview[] {
  const featured = blogPosts
    .filter((post) => post.featured)
    .map(transformPost);

  return limit ? featured.slice(0, limit) : featured;
}

/**
 * Get related posts based on tags or category
 */
export function getRelatedPosts(
  currentSlug: string,
  limit: number = 3
): BlogPostPreview[] {
  const currentPost = blogPosts.find((p) => p.slug === currentSlug);
  if (!currentPost) return [];

  const related = blogPosts
    .filter((post) => {
      if (post.slug === currentSlug) return false;

      // Match by category
      if (post.category === currentPost.category) return true;

      // Match by tags
      const currentTags = currentPost.tags || [];
      const postTags = post.tags || [];
      return currentTags.some((tag) => postTags.includes(tag));
    })
    .slice(0, limit)
    .map(transformPost);

  return related;
}

/**
 * Search posts by query string
 */
export function searchPosts(query: string): BlogPostPreview[] {
  const lowerQuery = query.toLowerCase();

  return blogPosts
    .filter((post) => {
      const title = (post.title || '').toLowerCase();
      const excerpt = (post.excerpt || '').toLowerCase();
      const tags = (post.tags || []).join(' ').toLowerCase();

      return (
        title.includes(lowerQuery) ||
        excerpt.includes(lowerQuery) ||
        tags.includes(lowerQuery)
      );
    })
    .map(transformPost);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  const categories = new Set(blogPosts.map((post) => post.category).filter(Boolean));
  return Array.from(categories).sort();
}

/**
 * Get all unique tags
 */
export function getTags(): string[] {
  const tags = new Set(
    blogPosts.flatMap((post) => post.tags || []).filter(Boolean)
  );
  return Array.from(tags).sort();
}
