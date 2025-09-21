import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Enable workbox plugin with Vercel environment check
const plugins = [react({
  // Ensure React is properly available for JSX transform
  jsxRuntime: 'automatic',
  // Include refresh for development
  include: '**/*.{jsx,tsx}',
  // Ensure React is available globally for components that reference it directly
  jsxImportSource: 'react'
})]

// Only load workbox plugin in development, never in production or Vercel
if (process.env.NODE_ENV === 'development') {
  try {
    const { workboxVitePlugin } = require('./src/utils/workbox-vite-plugin')
    plugins.push(workboxVitePlugin())
  } catch (error) {
    console.warn('Workbox plugin not loaded:', error.message)
  }
}

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks(id) {
          // Keep React and React-DOM together in vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor'
            }
            if (id.includes('react-router-dom')) {
              return 'router'
            }
            if (id.includes('@radix-ui')) {
              return 'ui'
            }
            if (id.includes('framer-motion')) {
              return 'animation'
            }
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'utils'
            }
            return 'vendor'
          }
        },
      },
      // Externalize Sentry to avoid build issues with dynamic imports
      external: ['@sentry/react', '@sentry/tracing']
    },
  },
  server: {
    port: 3002,
    host: true,
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
      }
    }
  }
})
