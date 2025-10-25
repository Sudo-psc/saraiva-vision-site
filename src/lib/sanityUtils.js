/**
 * Sanity CMS Utility Functions
 *
 * Provides helper functions for working with Sanity data:
 * - Image URL generation with optimization
 * - Data transformation from Sanity to frontend format
 * - GROQ query builders
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanityClient'

/**
 * Initialize Sanity image URL builder
 */
const builder = imageUrlBuilder(sanityClient)

/**
 * Generate optimized image URL from Sanity image object
 *
 * @param {Object} source - Sanity image object
 * @param {number} [width] - Target width in pixels
 * @param {number} [height] - Target height in pixels
 * @param {string} [format='webp'] - Image format (webp, jpg, png)
 * @param {number} [quality=80] - Image quality (1-100)
 * @returns {string} Optimized image URL
 *
 * @example
 * const url = urlFor(post.mainImage).width(800).height(600).url()
 * const optimized = getImageUrl(post.mainImage, 800, 600, 'webp', 90)
 */
export function urlFor(source) {
  return builder.image(source)
}

/**
 * Get optimized image URL with sensible defaults
 */
export function getImageUrl(source, width, height, format = 'webp', quality = 80) {
  if (!source) return null

  let url = urlFor(source).format(format).quality(quality)

  if (width) url = url.width(width)
  if (height) url = url.height(height)

  return url.url()
}

/**
 * Transform Sanity blog post to frontend format
 *
 * Converts Sanity blog post structure to match the existing
 * frontend blogPosts.js format for backward compatibility.
 *
 * @param {Object} sanityPost - Raw post from Sanity
 * @returns {Object} Transformed post matching frontend format
 */
export function transformBlogPost(sanityPost) {
  if (!sanityPost) return null

  return {
    id: sanityPost.id || sanityPost._id.replace('blogPost-', ''),
    slug: sanityPost.slug?.current || sanityPost.slug,
    title: sanityPost.title,
    excerpt: sanityPost.excerpt,
    content: sanityPost.content,
    image: sanityPost.image, // Keep existing path format
    author: sanityPost.author || 'Dr. Philipe Saraiva Cruz',
    date: sanityPost.date || sanityPost.publishedAt,
    category: sanityPost.category,
    tags: sanityPost.tags || [],
    featured: sanityPost.featured || false,
    seo: sanityPost.seo || {
      metaTitle: sanityPost.title,
      metaDescription: sanityPost.excerpt,
      keywords: sanityPost.tags || [],
    },
    relatedPodcasts: sanityPost.relatedPodcasts || [],
  }
}

/**
 * Transform array of Sanity posts
 */
export function transformBlogPosts(sanityPosts) {
  if (!Array.isArray(sanityPosts)) return []
  return sanityPosts.map(transformBlogPost).filter(Boolean)
}

/**
 * GROQ Queries
 * Reusable GROQ queries for common operations
 */
export const queries = {
  /**
   * Get all published blog posts, ordered by date descending
   */
  allPosts: `*[_type == "blogPost"] | order(date desc) {
    _id,
    id,
    slug,
    title,
    excerpt,
    content,
    image,
    author,
    date,
    publishedAt,
    updatedAt,
    category,
    tags,
    featured,
    seo,
    relatedPodcasts
  }`,

  /**
   * Get a single post by slug
   */
  postBySlug: (slug) => `*[_type == "blogPost" && slug.current == "${slug}"][0] {
    _id,
    id,
    slug,
    title,
    excerpt,
    content,
    image,
    author,
    date,
    publishedAt,
    updatedAt,
    category,
    tags,
    featured,
    seo,
    relatedPodcasts
  }`,

  /**
   * Get posts by category
   */
  postsByCategory: (category) => `*[_type == "blogPost" && category == "${category}"] | order(date desc) {
    _id,
    id,
    slug,
    title,
    excerpt,
    image,
    date,
    category,
    tags
  }`,

  /**
   * Get posts by tag
   */
  postsByTag: (tag) => `*[_type == "blogPost" && "${tag}" in tags] | order(date desc) {
    _id,
    id,
    slug,
    title,
    excerpt,
    image,
    date,
    category,
    tags
  }`,

  /**
   * Get featured posts
   */
  featuredPosts: `*[_type == "blogPost" && featured == true] | order(date desc) [0...3] {
    _id,
    id,
    slug,
    title,
    excerpt,
    image,
    date,
    category,
    featured
  }`,

  /**
   * Get recent posts (limit to N)
   */
  recentPosts: (limit = 5) => `*[_type == "blogPost"] | order(date desc) [0...${limit}] {
    _id,
    id,
    slug,
    title,
    excerpt,
    image,
    date,
    category
  }`,

  /**
   * Search posts by text (title, excerpt, content)
   */
  searchPosts: (searchTerm) => `*[_type == "blogPost" && (
    title match "*${searchTerm}*" ||
    excerpt match "*${searchTerm}*" ||
    content match "*${searchTerm}*"
  )] | order(date desc) {
    _id,
    id,
    slug,
    title,
    excerpt,
    image,
    date,
    category,
    tags
  }`,
}

/**
 * Fetch helper with error handling and transformation
 *
 * @param {string} query - GROQ query string
 * @param {Object} params - Query parameters
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Query results
 */
export async function fetchSanity(query, params = {}, options = {}) {
  try {
    const result = await sanityClient.fetch(query, params, options)
    return result
  } catch (error) {
    console.error('[Sanity] Fetch error:', error)
    throw error
  }
}

/**
 * Fetch all blog posts from Sanity
 */
export async function fetchAllPosts() {
  const posts = await fetchSanity(queries.allPosts)
  return transformBlogPosts(posts)
}

/**
 * Fetch a single post by slug
 */
export async function fetchPostBySlug(slug) {
  const post = await fetchSanity(queries.postBySlug(slug))
  return transformBlogPost(post)
}

/**
 * Fetch posts by category
 */
export async function fetchPostsByCategory(category) {
  const posts = await fetchSanity(queries.postsByCategory(category))
  return transformBlogPosts(posts)
}

/**
 * Fetch posts by tag
 */
export async function fetchPostsByTag(tag) {
  const posts = await fetchSanity(queries.postsByTag(tag))
  return transformBlogPosts(posts)
}

/**
 * Fetch featured posts
 */
export async function fetchFeaturedPosts() {
  const posts = await fetchSanity(queries.featuredPosts)
  return transformBlogPosts(posts)
}

/**
 * Search posts
 */
export async function searchPosts(searchTerm) {
  const posts = await fetchSanity(queries.searchPosts(searchTerm))
  return transformBlogPosts(posts)
}
