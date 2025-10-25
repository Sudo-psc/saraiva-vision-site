/**
 * Sanity CMS Client Configuration
 *
 * Configures the Sanity client for fetching blog content from Sanity.io CMS.
 * Uses CDN for production (cached) and direct API for development (real-time).
 *
 * @author Dr. Philipe Saraiva Cruz
 * @date 2025-10-25
 */

import { createClient } from '@sanity/client'

// Sanity project configuration
const config = {
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || '92ocrdmp',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-10-25', // Use current date for API versioning
  useCdn: import.meta.env.PROD, // Use CDN in production for better performance
  token: import.meta.env.VITE_SANITY_TOKEN, // Optional: for authenticated requests
}

/**
 * Main Sanity client instance
 * Use this for all data fetching operations
 */
export const sanityClient = createClient(config)

/**
 * Preview client for draft content (authenticated)
 * Use this when you need to preview unpublished content
 */
export const previewClient = createClient({
  ...config,
  useCdn: false, // Never use CDN for preview
  token: config.token, // Requires auth token
  perspective: 'previewDrafts', // Access draft documents
})

/**
 * Get the appropriate client based on preview mode
 * @param {boolean} preview - Whether to use preview mode
 * @returns {import('@sanity/client').SanityClient}
 */
export function getClient(preview = false) {
  return preview ? previewClient : sanityClient
}

export default sanityClient
