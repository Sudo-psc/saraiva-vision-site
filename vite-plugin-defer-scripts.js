/**
 * Vite Plugin: Defer Non-Critical Scripts
 *
 * Optimizes script loading to prevent render-blocking:
 * 1. Removes non-critical modulepreload hints
 * 2. Keeps only essential chunks for initial render
 *
 * @author Dr. Philipe Saraiva Cruz
 */

export default function deferScriptsPlugin() {
  return {
    name: 'vite-plugin-defer-scripts',
    enforce: 'post',

    transformIndexHtml(html) {
      // Critical chunks needed for initial render
      const criticalChunks = [
        'index-',
        'react-core-',
        'react-dom-',
        'router-',
        'helmet-',
        'style-utils-'
      ];

      // Non-critical chunks that can be loaded lazily
      const nonCriticalChunks = [
        'sanity-http-',
        'date-utils-',
        'date-fns-',
        'glob-utils-',
        'sse-polyfill-',
        'sanity-cms-',
        'i18n-',
        'translations-',
        'analytics-',
        'motion-',
        'maps-',
        'icons-lucide-',
        'icons-',
        'vendor-misc-',
        'security-utils-',
        'radix-ui-',
        'posthog-',
        'supabase-',
        'enhancedBlogPosts-'
      ];

      let transformedHtml = html;

      // Remove modulepreload for non-critical chunks
      nonCriticalChunks.forEach(chunk => {
        const regex = new RegExp(`<link[^>]*rel="modulepreload"[^>]*href="[^"]*${chunk}[^"]*"[^>]*>\\s*`, 'gi');
        transformedHtml = transformedHtml.replace(regex, '');
      });

      // Also remove any duplicate modulepreload entries
      const seenPreloads = new Set();
      transformedHtml = transformedHtml.replace(
        /<link[^>]*rel="modulepreload"[^>]*href="([^"]*)"[^>]*>/gi,
        (match, href) => {
          if (seenPreloads.has(href)) {
            return ''; // Remove duplicate
          }
          seenPreloads.add(href);
          return match;
        }
      );

      return transformedHtml;
    }
  };
}
