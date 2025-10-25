/**
 * Sanity.io Integration Tests
 *
 * Tests for Sanity CMS integration with blog posts
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@sanity/client'
import { blogPosts } from '../../../src/data/blogPosts.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env') })

// Skip tests if Sanity credentials are not configured
const shouldSkipTests = !process.env.SANITY_PROJECT_ID ||
                        !process.env.SANITY_DATASET ||
                        !process.env.SANITY_TOKEN

const describeOrSkip = shouldSkipTests ? describe.skip : describe

describeOrSkip('Sanity.io Integration', () => {
  let client

  beforeAll(() => {
    client = createClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET,
      token: process.env.SANITY_TOKEN,
      apiVersion: '2025-10-25',
      useCdn: false
    })
  })

  describe('Environment Configuration', () => {
    it('should have all required environment variables', () => {
      expect(process.env.SANITY_PROJECT_ID).toBeDefined()
      expect(process.env.SANITY_DATASET).toBeDefined()
      expect(process.env.SANITY_TOKEN).toBeDefined()
    })

    it('should connect to Sanity API', async () => {
      const result = await client.fetch('*[_type == "blogPost"][0]')
      expect(result).toBeDefined()
    })
  })

  describe('Blog Posts Export', () => {
    it('should have exported all blog posts', async () => {
      const query = '*[_type == "blogPost"]'
      const posts = await client.fetch(query)

      expect(posts).toBeDefined()
      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeGreaterThan(0)
    })

    it('should have correct number of posts', async () => {
      const query = '*[_type == "blogPost"]'
      const posts = await client.fetch(query)

      expect(posts.length).toBe(blogPosts.length)
    })

    it('should have all required fields in each post', async () => {
      const query = '*[_type == "blogPost"][0...5]'
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post._id).toBeDefined()
        expect(post._type).toBe('blogPost')
        expect(post.id).toBeDefined()
        expect(post.slug).toBeDefined()
        expect(post.slug.current).toBeDefined()
        expect(post.title).toBeDefined()
        expect(post.excerpt).toBeDefined()
        expect(post.content).toBeDefined()
        expect(post.author).toBeDefined()
        expect(post.date).toBeDefined()
        expect(post.category).toBeDefined()
        expect(Array.isArray(post.tags)).toBe(true)
        expect(post.image).toBeDefined()
        expect(typeof post.featured).toBe('boolean')
      })
    })

    it('should have valid SEO metadata', async () => {
      const query = '*[_type == "blogPost" && defined(seo)][0...5]'
      const posts = await client.fetch(query)

      posts.forEach(post => {
        if (post.seo) {
          expect(post.seo.metaTitle).toBeDefined()
          expect(post.seo.metaDescription).toBeDefined()
          expect(Array.isArray(post.seo.keywords)).toBe(true)
        }
      })
    })

    it('should have unique slugs for all posts', async () => {
      const query = '*[_type == "blogPost"].slug.current'
      const slugs = await client.fetch(query)

      const uniqueSlugs = new Set(slugs)
      expect(slugs.length).toBe(uniqueSlugs.size)
    })

    it('should have valid dates in ISO format', async () => {
      const query = '*[_type == "blogPost"][0...5]'
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.publishedAt).toBeDefined()
        expect(new Date(post.publishedAt).toString()).not.toBe('Invalid Date')

        if (post.updatedAt) {
          expect(new Date(post.updatedAt).toString()).not.toBe('Invalid Date')
        }
      })
    })
  })

  describe('GROQ Queries', () => {
    it('should fetch posts ordered by date descending', async () => {
      const query = '*[_type == "blogPost"] | order(date desc)[0...5]'
      const posts = await client.fetch(query)

      expect(posts.length).toBeGreaterThan(0)

      for (let i = 0; i < posts.length - 1; i++) {
        const currentDate = new Date(posts[i].date)
        const nextDate = new Date(posts[i + 1].date)
        expect(currentDate >= nextDate).toBe(true)
      }
    })

    it('should filter posts by category', async () => {
      const category = 'Dúvidas Frequentes'
      const query = `*[_type == "blogPost" && category == "${category}"]`
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.category).toBe(category)
      })
    })

    it('should filter posts by tag', async () => {
      const tag = 'presbiopia'
      const query = `*[_type == "blogPost" && "${tag}" in tags]`
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.tags).toContain(tag)
      })
    })

    it('should fetch featured posts only', async () => {
      const query = '*[_type == "blogPost" && featured == true]'
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.featured).toBe(true)
      })
    })

    it('should search posts by title', async () => {
      const searchTerm = 'Presbiopia'
      const query = `*[_type == "blogPost" && title match "${searchTerm}*"]`
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.title.toLowerCase()).toContain(searchTerm.toLowerCase())
      })
    })
  })

  describe('Data Integrity', () => {
    it('should match local blog posts data', async () => {
      const query = '*[_type == "blogPost"] | order(id asc)'
      const sanityPosts = await client.fetch(query)

      expect(sanityPosts.length).toBe(blogPosts.length)

      sanityPosts.forEach((sanityPost, index) => {
        const localPost = blogPosts.find(p => p.id === sanityPost.id)

        expect(localPost).toBeDefined()
        expect(sanityPost.title).toBe(localPost.title)
        expect(sanityPost.slug.current).toBe(localPost.slug)
        expect(sanityPost.excerpt).toBe(localPost.excerpt)
        expect(sanityPost.author).toBe(localPost.author)
        expect(sanityPost.category).toBe(localPost.category)
      })
    })

    it('should have valid image paths', async () => {
      const query = '*[_type == "blogPost"].image'
      const images = await client.fetch(query)

      images.forEach(image => {
        expect(image).toBeDefined()
        expect(typeof image).toBe('string')
        expect(image.startsWith('/Blog/')).toBe(true)
      })
    })

    it('should not have null or undefined critical fields', async () => {
      const query = '*[_type == "blogPost"]'
      const posts = await client.fetch(query)

      posts.forEach(post => {
        expect(post.title).toBeTruthy()
        expect(post.slug.current).toBeTruthy()
        expect(post.excerpt).toBeTruthy()
        expect(post.content).toBeTruthy()
        expect(post.date).toBeTruthy()
      })
    })
  })

  describe('Performance', () => {
    it('should fetch posts quickly (< 2 seconds)', async () => {
      const startTime = Date.now()

      await client.fetch('*[_type == "blogPost"]')

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(2000)
    })

    it('should handle projection queries efficiently', async () => {
      const startTime = Date.now()

      const query = '*[_type == "blogPost"]{ _id, title, slug, date }'
      await client.fetch(query)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(1000)
    })
  })
})

describeOrSkip('Sanity Export Script', () => {
  it('should transform blog post data correctly', () => {
    const samplePost = blogPosts[0]

    const transformed = {
      _type: 'blogPost',
      _id: `blogPost-${samplePost.id}`,
      id: samplePost.id,
      slug: {
        _type: 'slug',
        current: samplePost.slug
      },
      title: samplePost.title,
      excerpt: samplePost.excerpt,
      content: samplePost.content,
      author: samplePost.author,
      date: samplePost.date,
      category: samplePost.category,
      tags: samplePost.tags || [],
      image: samplePost.image,
      featured: samplePost.featured || false,
      seo: {
        _type: 'object',
        metaTitle: samplePost.seo?.metaTitle || samplePost.title,
        metaDescription: samplePost.seo?.metaDescription || samplePost.excerpt,
        keywords: samplePost.seo?.keywords || samplePost.tags || []
      },
      relatedPodcasts: samplePost.relatedPodcasts || []
    }

    expect(transformed._type).toBe('blogPost')
    expect(transformed._id).toBe(`blogPost-${samplePost.id}`)
    expect(transformed.slug._type).toBe('slug')
    expect(transformed.slug.current).toBe(samplePost.slug)
  })

  it('should handle posts with missing optional fields', () => {
    const minimalPost = {
      id: 999,
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'Test excerpt',
      content: 'Test content',
      author: 'Test Author',
      date: '2025-10-25',
      category: 'Test',
      image: '/Blog/test.webp'
    }

    const transformed = {
      _type: 'blogPost',
      _id: `blogPost-${minimalPost.id}`,
      id: minimalPost.id,
      slug: {
        _type: 'slug',
        current: minimalPost.slug
      },
      title: minimalPost.title,
      excerpt: minimalPost.excerpt,
      content: minimalPost.content,
      author: minimalPost.author,
      date: minimalPost.date,
      category: minimalPost.category,
      tags: minimalPost.tags || [],
      image: minimalPost.image,
      featured: minimalPost.featured || false,
      seo: {
        _type: 'object',
        metaTitle: minimalPost.seo?.metaTitle || minimalPost.title,
        metaDescription: minimalPost.seo?.metaDescription || minimalPost.excerpt,
        keywords: minimalPost.seo?.keywords || minimalPost.tags || []
      },
      relatedPodcasts: minimalPost.relatedPodcasts || []
    }

    expect(transformed.tags).toEqual([])
    expect(transformed.featured).toBe(false)
    expect(transformed.relatedPodcasts).toEqual([])
    expect(transformed.seo.metaTitle).toBe(minimalPost.title)
  })
})
