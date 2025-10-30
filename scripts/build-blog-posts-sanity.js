#!/usr/bin/env node
/**
 * Sanity Build-Time Blog Posts Fetcher
 *
 * Fetches blog posts from Sanity CMS at build time and generates:
 * 1. Static JSON file for build inclusion
 * 2. Individual post files for prerendering (optional)
 *
 * This implements Fase 3A: Híbrido Build-time + Webhook
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Sanity client configuration
const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '92ocrdmp',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-10-25',
  useCdn: false, // Don't use CDN for build-time fetches (get fresh data)
  token: process.env.SANITY_TOKEN, // Optional: for preview/draft access
})

// Output paths
const OUTPUT_DIR = path.resolve(__dirname, '../src/data')
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'blogPosts.sanity.js')
const BACKUP_FILE = path.resolve(OUTPUT_DIR, 'blogPosts.static-backup.js')

/**
 * Transform Sanity post to frontend format
 */
function transformPost(sanityPost) {
  return {
    id: sanityPost.id || parseInt(sanityPost._id.replace('blogPost-', '')),
    slug: sanityPost.slug?.current || sanityPost.slug,
    title: sanityPost.title,
    excerpt: sanityPost.excerpt,
    content: sanityPost.content,
    image: sanityPost.image,
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
 * Fetch all blog posts from Sanity
 */
async function fetchPostsFromSanity() {
  console.log('📡 Fetching blog posts from Sanity CMS...\n')

  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    id,
    slug,
    title,
    excerpt,
    content,
    image,
    author,
    publishedAt,
    updatedAt,
    category,
    tags,
    featured,
    seo,
    relatedPodcasts
  }`

  try {
    const startTime = Date.now()
    const posts = await sanityClient.fetch(query)
    const duration = Date.now() - startTime

    console.log(`✅ Fetched ${posts.length} posts from Sanity`)
    console.log(`   Query time: ${duration}ms\n`)

    return posts.map(transformPost)
  } catch (error) {
    console.error('❌ Error fetching from Sanity:', error.message)
    console.error('   Project ID:', process.env.SANITY_PROJECT_ID)
    console.error('   Dataset:', process.env.SANITY_DATASET)
    throw error
  }
}

/**
 * Generate JavaScript module file
 */
function generateJSModule(posts) {
  const jsContent = `/**
 * Blog Posts Data - Generated from Sanity CMS
 *
 * This file is auto-generated at build time from Sanity.io
 * DO NOT EDIT MANUALLY - changes will be overwritten
 *
 * Generated: ${new Date().toISOString()}
 * Source: Sanity CMS (Project: ${process.env.SANITY_PROJECT_ID}, Dataset: ${process.env.SANITY_DATASET})
 * Posts: ${posts.length}
 *
 * @author Dr. Philipe Saraiva Cruz
 */

export const blogPosts = ${JSON.stringify(posts, null, 2)}

export default blogPosts
`

  return jsContent
}

/**
 * Create backup of existing static file
 */
function backupStaticFile() {
  const staticFile = path.resolve(OUTPUT_DIR, 'blogPosts.js')

  if (fs.existsSync(staticFile)) {
    console.log('💾 Backing up existing static blogPosts.js...')
    fs.copyFileSync(staticFile, BACKUP_FILE)
    console.log(`   Backup created: ${BACKUP_FILE}\n`)
  }
}

/**
 * Write posts to output file
 */
function writePosts(posts) {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Generate JavaScript module
  const jsContent = generateJSModule(posts)

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8')

  const fileSize = (fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)

  console.log(`📦 Generated: ${OUTPUT_FILE}`)
  console.log(`   Posts: ${posts.length}`)
  console.log(`   Size: ${fileSize} KB\n`)
}

/**
 * Generate build report
 */
function generateReport(posts) {
  console.log('📊 Build Report:')
  console.log('   ─────────────────────────────────────')

  // Categories breakdown
  const categories = {}
  posts.forEach((post) => {
    categories[post.category] = (categories[post.category] || 0) + 1
  })

  console.log('   Categories:')
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count} post${count > 1 ? 's' : ''}`)
    })

  // Featured posts
  const featuredCount = posts.filter((p) => p.featured).length
  console.log(`\n   Featured posts: ${featuredCount}`)

  // Tags count
  const allTags = new Set()
  posts.forEach((post) => {
    post.tags?.forEach((tag) => allTags.add(tag))
  })
  console.log(`   Unique tags: ${allTags.size}`)

  // Date range
  if (posts.length > 0) {
    const dates = posts.map((p) => new Date(p.date)).sort((a, b) => a - b)
    const oldest = dates[0].toLocaleDateString('pt-BR')
    const newest = dates[dates.length - 1].toLocaleDateString('pt-BR')
    console.log(`   Date range: ${oldest} → ${newest}`)
  }

  console.log('   ─────────────────────────────────────\n')
}

/**
 * Main build function
 */
async function buildBlogPosts() {
  console.log('🚀 Sanity Blog Build Process Started\n')
  console.log('═══════════════════════════════════════════\n')

  try {
    // Step 1: Backup existing static file
    backupStaticFile()

    // Step 2: Fetch posts from Sanity
    const posts = await fetchPostsFromSanity()

    if (posts.length === 0) {
      console.warn('⚠️  Warning: No posts fetched from Sanity')
      console.warn('   Check your Sanity project configuration\n')
      process.exit(1)
    }

    // Step 3: Write to output file
    writePosts(posts)

    // Step 4: Generate report
    generateReport(posts)

    console.log('═══════════════════════════════════════════')
    console.log('✅ Blog posts build completed successfully!\n')

    process.exit(0)
  } catch (error) {
    console.error('\n═══════════════════════════════════════════')
    console.error('❌ Build failed:', error.message)
    console.error('═══════════════════════════════════════════\n')

    // Check if backup exists for fallback
    if (fs.existsSync(BACKUP_FILE)) {
      console.log('💡 Tip: Backup file available at:')
      console.log(`   ${BACKUP_FILE}\n`)
    }

    process.exit(1)
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildBlogPosts()
}

export { buildBlogPosts, fetchPostsFromSanity, transformPost }
