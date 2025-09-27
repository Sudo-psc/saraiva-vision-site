import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Enable workbox plugin with VPS environment check
const plugins = [react({
  // Ensure React is properly available for JSX transform
  jsxRuntime: 'automatic',
  // Include refresh for development
  include: '**/*.{jsx,tsx}',
  // Ensure React is available globally for components that reference it directly
  jsxImportSource: 'react'
})]

// Workbox plugin disabled for stable deployment
// if (process.env.NODE_ENV === 'development') {
//   try {
//     const { workboxVitePlugin } = require('./src/utils/workbox-vite-plugin')
//     plugins.push(workboxVitePlugin())
//   } catch (error) {
//     console.warn('Workbox plugin not loaded:', error.message)
//   }
// }

export default defineConfig({
  plugins,
  base: '/', // Ensure proper base path for VPS deployment
  define: {
    // Fallback for legacy process.env usage in libraries
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Ensure React runtime is available globally
    'global.React': 'React',
  },
  esbuild: {
    charset: 'utf8'
    // Let React plugin handle JSX transformation with automatic runtime
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    dedupe: ['react', 'react-dom'] // Prevent React duplication issues
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    exclude: []
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist']
  },

  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development' ? true : false, // Source maps only in dev
    chunkSizeWarningLimit: 800, // Increase for VPS deployment
    assetsDir: 'assets',
    assetsInlineLimit: 8192, // Increase inline limit for VPS performance
    minify: 'esbuild',
    target: 'es2020', // Modern target for better optimization
    cssCodeSplit: true, // Split CSS for better caching
    rollupOptions: {
      input: 'index.html',
      output: {
        // Optimized chunking strategy for VPS with React isolation
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React packages - isolate to prevent context issues
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-vendor'
            }
            // React utilities that need React context
            if (id.includes('react-') && !id.includes('react-router')) {
              return 'react-vendor'
            }
            // Routing
            if (id.includes('react-router')) {
              return 'router'
            }
            // UI Components and animation libs
            if (id.includes('@radix-ui')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'motion'
            }
            // Utilities
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils'
            }
            // Other vendor libraries
            return 'vendor'
          }
        },
        // Optimized file naming for VPS caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    copyPublicDir: true
  },
  // Ensure all asset types are properly handled
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.webp', '**/*.avif', '**/*.mp3', '**/*.wav', '**/*.mp4'],
  server: {
    port: 3002,
    host: true,
    open: false,
    historyApiFallback: true, // Enable SPA routing support for React Router
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'www.saraivavision.com.br',
      'saraivavision.com.br'
    ],
    proxy: {
      // WordPress proxy enabled for development mock server
      '/wp-json': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        headers: {
          'Origin': 'http://localhost:3002',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      },
      '/wp-admin': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        }
      },
      // Google Places API proxy for development
      '/api/google-places': {
        target: 'https://maps.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/google-places/, '/maps/api/place'),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      },
      // Health check API proxy for development
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    }
  }
})
