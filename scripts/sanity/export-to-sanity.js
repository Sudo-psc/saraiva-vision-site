/**
 * Export Blog Posts to Sanity.io
 *
 * This script exports all blog posts from src/data/blogPosts.js to Sanity.io
 *
 * Usage:
 *   node scripts/sanity/export-to-sanity.js
 *
 * Environment Variables Required:
 *   SANITY_PROJECT_ID - Your Sanity project ID
 *   SANITY_DATASET - Dataset name (usually 'production')
 *   SANITY_TOKEN - API token with write permissions
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import { createClient } from '@sanity/client'
import { blogPosts } from '../../src/data/blogPosts.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Validate required environment variables
const requiredEnvVars = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_TOKEN']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '))
  console.error('\nPlease add these variables to your .env file:')
  console.error('SANITY_PROJECT_ID=your_project_id')
  console.error('SANITY_DATASET=production')
  console.error('SANITY_TOKEN=your_api_token')
  process.exit(1)
}

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  token: process.env.SANITY_TOKEN,
  apiVersion: '2025-10-25',
  useCdn: false
})

/**
 * Transform blog post data to match Sanity schema
 */
function transformBlogPost(post) {
  return {
    _type: 'blogPost',
    _id: `blogPost-${post.id}`, // Use predictable ID for upserts
    id: post.id,
    slug: {
      _type: 'slug',
      current: post.slug
    },
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    date: post.date,
    category: post.category,
    tags: post.tags || [],
    image: post.image,
    featured: post.featured || false,
    seo: {
      _type: 'object',
      metaTitle: post.seo?.metaTitle || post.title,
      metaDescription: post.seo?.metaDescription || post.excerpt,
      keywords: post.seo?.keywords || post.tags || []
    },
    relatedPodcasts: post.relatedPodcasts || [],
    publishedAt: new Date(post.date).toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Export a single blog post to Sanity
 */
async function exportPost(post, index, total) {
  try {
    const sanityPost = transformBlogPost(post)

    // Use createOrReplace to avoid duplicates
    const result = await client.createOrReplace(sanityPost)

    console.log(`✅ [${index + 1}/${total}] Exported: ${post.title}`)
    return { success: true, result }
  } catch (error) {
    console.error(`❌ [${index + 1}/${total}] Failed to export: ${post.title}`)
    console.error('   Error:', error.message)
    return { success: false, error, post }
  }
}

/**
 * Main export function
 */
async function exportAllPosts() {
  console.log('🚀 Starting export to Sanity.io...\n')
  console.log(`📊 Total posts to export: ${blogPosts.length}`)
  console.log(`🎯 Target: ${process.env.SANITY_PROJECT_ID}/${process.env.SANITY_DATASET}\n`)

  const results = {
    success: [],
    failed: []
  }

  // Export posts sequentially to avoid rate limiting
  for (let i = 0; i < blogPosts.length; i++) {
    const post = blogPosts[i]
    const result = await exportPost(post, i, blogPosts.length)

    if (result.success) {
      results.success.push(post)
    } else {
      results.failed.push({ post, error: result.error })
    }

    // Add small delay to avoid rate limiting
    if (i < blogPosts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📈 Export Summary:')
  console.log('='.repeat(60))
  console.log(`✅ Successfully exported: ${results.success.length}`)
  console.log(`❌ Failed to export: ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log('\n❌ Failed posts:')
    results.failed.forEach(({ post, error }) => {
      console.log(`   - ${post.title}: ${error.message}`)
    })
  }

  console.log('\n✨ Export completed!')

  return results
}

/**
 * Dry run - validate data without uploading
 */
async function dryRun() {
  console.log('🔍 Running validation (dry run)...\n')

  const issues = []

  blogPosts.forEach((post, index) => {
    const transformed = transformBlogPost(post)

    // Validate required fields
    if (!transformed.title || transformed.title.length === 0) {
      issues.push(`Post ${index + 1}: Missing title`)
    }
    if (!transformed.slug?.current) {
      issues.push(`Post ${index + 1}: Missing or invalid slug`)
    }
    if (!transformed.content || transformed.content.length === 0) {
      issues.push(`Post ${index + 1}: Missing content`)
    }
    if (!transformed.date) {
      issues.push(`Post ${index + 1}: Missing date`)
    }
  })

  if (issues.length === 0) {
    console.log('✅ All posts are valid and ready for export!')
    console.log(`📊 ${blogPosts.length} posts validated successfully\n`)
    return true
  } else {
    console.log('❌ Found validation issues:\n')
    issues.forEach(issue => console.log(`   - ${issue}`))
    console.log()
    return false
  }
}

/**
 * Query existing posts in Sanity
 */
async function queryExistingPosts() {
  try {
    const query = '*[_type == "blogPost"] | order(id asc) { _id, id, title, slug, date }'
    const posts = await client.fetch(query)

    console.log(`📊 Found ${posts.length} existing posts in Sanity:\n`)
    posts.forEach(post => {
      console.log(`   - [${post.id}] ${post.title} (${post.date})`)
    })
    console.log()

    return posts
  } catch (error) {
    console.error('❌ Failed to query existing posts:', error.message)
    return []
  }
}

/**
 * Delete all blog posts from Sanity
 */
async function deleteAllPosts() {
  try {
    console.log('🗑️  Deleting all blog posts from Sanity...')

    const query = '*[_type == "blogPost"]._id'
    const ids = await client.fetch(query)

    if (ids.length === 0) {
      console.log('ℹ️  No posts found to delete')
      return
    }

    console.log(`Found ${ids.length} posts to delete`)

    const transaction = client.transaction()
    ids.forEach(id => transaction.delete(id))

    await transaction.commit()

    console.log(`✅ Deleted ${ids.length} posts`)
  } catch (error) {
    console.error('❌ Failed to delete posts:', error.message)
  }
}

// Command line interface
const args = process.argv.slice(2)
const command = args[0]

async function main() {
  try {
    switch (command) {
      case 'validate':
      case 'dry-run':
        await dryRun()
        break

      case 'query':
      case 'list':
        await queryExistingPosts()
        break

      case 'delete':
        console.log('⚠️  WARNING: This will delete ALL blog posts from Sanity!')
        console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')
        await new Promise(resolve => setTimeout(resolve, 5000))
        await deleteAllPosts()
        break

      case 'export':
      case undefined:
        const isValid = await dryRun()
        if (!isValid) {
          console.log('❌ Validation failed. Please fix issues before exporting.')
          process.exit(1)
        }
        await exportAllPosts()
        break

      default:
        console.log('Usage: node export-to-sanity.js [command]')
        console.log('')
        console.log('Commands:')
        console.log('  export, (default) - Export all posts to Sanity')
        console.log('  validate, dry-run - Validate posts without uploading')
        console.log('  query, list       - List existing posts in Sanity')
        console.log('  delete            - Delete all posts from Sanity')
        break
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
