/**
 * Sanity Blog Custom Hooks
 *
 * React hooks for fetching blog data from Sanity CMS with:
 * - Automatic loading states
 * - Error handling
 * - Fallback to static data
 * - Optional caching
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import { useState, useEffect } from 'react'
import {
  fetchAllPosts,
  fetchPostBySlug,
  fetchPostsByCategory,
  fetchPostsByTag,
  fetchFeaturedPosts,
  searchPosts,
} from '@/lib/sanityUtils'
import { blogPosts as staticBlogPosts } from '@/data/blogPosts'

/**
 * Feature flag to enable/disable Sanity integration
 * Set to false to fallback to static data
 */
const ENABLE_SANITY = import.meta.env.VITE_ENABLE_SANITY !== 'false'

/**
 * Hook to fetch all blog posts from Sanity
 *
 * @param {Object} options - Hook options
 * @param {boolean} options.fallbackToStatic - Use static data on error (default: true)
 * @returns {Object} { posts, loading, error, refetch }
 *
 * @example
 * const { posts, loading, error } = useBlogPosts()
 */
export function useBlogPosts(options = {}) {
  const { fallbackToStatic = true } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    // If Sanity disabled, use static data immediately
    if (!ENABLE_SANITY) {
      setPosts(staticBlogPosts)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPosts = await fetchAllPosts()
      setPosts(sanityPosts)
    } catch (err) {
      console.error('[useBlogPosts] Error fetching from Sanity:', err)
      setError(err)

      // Fallback to static data if enabled
      if (fallbackToStatic) {
        console.log('[useBlogPosts] Falling back to static data')
        setPosts(staticBlogPosts)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to fetch a single blog post by slug
 *
 * @param {string} slug - Post slug
 * @param {Object} options - Hook options
 * @returns {Object} { post, loading, error, refetch }
 *
 * @example
 * const { post, loading } = useBlogPost('tipos-de-lentes-de-contato')
 */
export function useBlogPost(slug, options = {}) {
  const { fallbackToStatic = true } = options

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPost = async () => {
    if (!slug) {
      setLoading(false)
      return
    }

    // If Sanity disabled, use static data immediately
    if (!ENABLE_SANITY) {
      const staticPost = staticBlogPosts.find((p) => p.slug === slug)
      setPost(staticPost || null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPost = await fetchPostBySlug(slug)
      setPost(sanityPost)
    } catch (err) {
      console.error('[useBlogPost] Error fetching from Sanity:', err)
      setError(err)

      // Fallback to static data if enabled
      if (fallbackToStatic) {
        console.log('[useBlogPost] Falling back to static data')
        const staticPost = staticBlogPosts.find((p) => p.slug === slug)
        setPost(staticPost || null)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [slug])

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  }
}

/**
 * Hook to fetch posts by category
 *
 * @param {string} category - Category name
 * @param {Object} options - Hook options
 * @returns {Object} { posts, loading, error, refetch }
 *
 * @example
 * const { posts, loading } = usePostsByCategory('Dúvidas Frequentes')
 */
export function usePostsByCategory(category, options = {}) {
  const { fallbackToStatic = true } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    if (!category) {
      setLoading(false)
      return
    }

    if (!ENABLE_SANITY) {
      const filtered = staticBlogPosts.filter((p) => p.category === category)
      setPosts(filtered)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPosts = await fetchPostsByCategory(category)
      setPosts(sanityPosts)
    } catch (err) {
      console.error('[usePostsByCategory] Error:', err)
      setError(err)

      if (fallbackToStatic) {
        const filtered = staticBlogPosts.filter((p) => p.category === category)
        setPosts(filtered)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [category])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to fetch posts by tag
 *
 * @param {string} tag - Tag name
 * @param {Object} options - Hook options
 * @returns {Object} { posts, loading, error, refetch }
 *
 * @example
 * const { posts, loading } = usePostsByTag('presbiopia')
 */
export function usePostsByTag(tag, options = {}) {
  const { fallbackToStatic = true } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    if (!tag) {
      setLoading(false)
      return
    }

    if (!ENABLE_SANITY) {
      const filtered = staticBlogPosts.filter((p) => p.tags?.includes(tag))
      setPosts(filtered)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPosts = await fetchPostsByTag(tag)
      setPosts(sanityPosts)
    } catch (err) {
      console.error('[usePostsByTag] Error:', err)
      setError(err)

      if (fallbackToStatic) {
        const filtered = staticBlogPosts.filter((p) => p.tags?.includes(tag))
        setPosts(filtered)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [tag])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to fetch featured posts
 *
 * @param {Object} options - Hook options
 * @returns {Object} { posts, loading, error, refetch }
 *
 * @example
 * const { posts, loading } = useFeaturedPosts()
 */
export function useFeaturedPosts(options = {}) {
  const { fallbackToStatic = true } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    if (!ENABLE_SANITY) {
      const featured = staticBlogPosts.filter((p) => p.featured).slice(0, 3)
      setPosts(featured)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPosts = await fetchFeaturedPosts()
      setPosts(sanityPosts)
    } catch (err) {
      console.error('[useFeaturedPosts] Error:', err)
      setError(err)

      if (fallbackToStatic) {
        const featured = staticBlogPosts.filter((p) => p.featured).slice(0, 3)
        setPosts(featured)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}

/**
 * Hook to search posts
 *
 * @param {string} searchTerm - Search term
 * @param {Object} options - Hook options
 * @returns {Object} { posts, loading, error, refetch }
 *
 * @example
 * const { posts, loading } = useSearchPosts('catarata')
 */
export function useSearchPosts(searchTerm, options = {}) {
  const { fallbackToStatic = true } = options

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPosts = async () => {
    if (!searchTerm) {
      setPosts([])
      setLoading(false)
      return
    }

    if (!ENABLE_SANITY) {
      const term = searchTerm.toLowerCase()
      const filtered = staticBlogPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.excerpt.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term)
      )
      setPosts(filtered)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const sanityPosts = await searchPosts(searchTerm)
      setPosts(sanityPosts)
    } catch (err) {
      console.error('[useSearchPosts] Error:', err)
      setError(err)

      if (fallbackToStatic) {
        const term = searchTerm.toLowerCase()
        const filtered = staticBlogPosts.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.excerpt.toLowerCase().includes(term) ||
            p.content.toLowerCase().includes(term)
        )
        setPosts(filtered)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [searchTerm])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  }
}
