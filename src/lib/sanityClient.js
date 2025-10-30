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

// Environment variable access that works in both Vite and Node.js
const getEnv = (key, defaultValue = undefined) => {
  // In Vite (browser/build), use import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue
  }
  // In Node.js (scripts), use process.env
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue
  }
  return defaultValue
}

// Sanity project configuration
const config = {
  projectId: getEnv('VITE_SANITY_PROJECT_ID', '92ocrdmp'),
  dataset: getEnv('VITE_SANITY_DATASET', 'production'),
  apiVersion: '2025-10-25', // Use current date for API versioning
  useCdn: getEnv('NODE_ENV') === 'production', // Use CDN in production for better performance
  token: getEnv('VITE_SANITY_TOKEN') || getEnv('SANITY_TOKEN'), // Optional: for authenticated requests (supports both variable names)
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
