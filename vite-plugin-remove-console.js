/**
 * Vite Plugin: Remove Console Logs
 * Automatically strips console.log, console.debug, console.info from production builds
 * Preserves console.warn and console.error for production debugging
 */
export default function removeConsolePlugin() {
  return {
    name: 'remove-console',
    enforce: 'pre',
    transform(code, id) {
      // Only apply to JS/JSX/TS/TSX files in production
      if (process.env.NODE_ENV !== 'production') {
        return null
      }

      if (!id.match(/\.(jsx?|tsx?)$/)) {
        return null
      }

      // Skip node_modules
      if (id.includes('node_modules')) {
        return null
      }

      // Pattern to match console statements (preserves warn and error)
      const consolePattern = /console\.(log|debug|info)\s*\([^)]*\);?/g

      // Replace console statements with empty string
      const transformedCode = code.replace(consolePattern, '/* console removed */')

      // Only return if changes were made
      if (transformedCode !== code) {
        return {
          code: transformedCode,
          map: null // No source map needed
        }
      }

      return null
    }
  }
}