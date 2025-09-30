import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import removeConsolePlugin from './vite-plugin-remove-console.js'

// Enable workbox plugin with VPS environment check
const plugins = [
  react({
    // Use automatic JSX runtime
    jsxRuntime: 'automatic',
    // Include refresh for development
    include: '**/*.{jsx,tsx}'
   })
 ]

// Workbox plugin disabled for stable deployment
// if (process.env.NODE_ENV === 'development') {
//   try {
//     const { workboxVitePlugin } = require('./src/utils/workbox-vite-plugin')
//     plugins.push(workboxVitePlugin())
//   } catch (error) {
//     console.warn('Workbox plugin not loaded:', error.message)
//   }
// }

/**
 * Validate required environment variables
 * @param {Record<string, string>} env - Environment variables object
 * @param {string} mode - Build mode (development/production)
 */
function validateEnvironmentVariables(env, mode) {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const recommended = [
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_GOOGLE_PLACES_API_KEY',
  ];

  const missing = required.filter(key => !env[key] || env[key].includes('your_'));
  const missingRecommended = recommended.filter(key => !env[key] || env[key].includes('your_'));

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add these to your .env file or .env.production\n');

    if (mode === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  if (missingRecommended.length > 0 && mode !== 'test') {
    console.warn('\n⚠️  Missing recommended environment variables:');
    missingRecommended.forEach(key => console.warn(`   - ${key}`));
    console.warn('\nSome features may not work properly.\n');
  }

  // Validate URL formats
  const urlVars = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
  };

  Object.entries(urlVars).forEach(([key, value]) => {
    if (value && !value.includes('your_')) {
      try {
        new URL(value);
      } catch {
        console.error(`\n❌ Invalid URL format for ${key}: ${value}\n`);
        if (mode === 'production') {
          throw new Error(`Invalid URL format for ${key}`);
        }
      }
    }
  });

  // Success message
  if (missing.length === 0 && mode !== 'test') {
    console.log('\n✅ Environment variables validated successfully\n');
  }
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Validate environment variables (skip in test mode to avoid noise)
  if (mode !== 'test') {
    validateEnvironmentVariables(env, mode);
  }

  return {
  plugins,
  base: '/', // Ensure proper base path for VPS deployment
  define: {
    // Fallback for legacy process.env usage in libraries
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
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
    sourcemap: false, // Disable sourcemaps in production for security
    chunkSizeWarningLimit: 300, // Reduced to enforce smaller chunks
    assetsDir: 'assets',
    assetsInlineLimit: 4096, // Reduced to avoid large inline assets
    minify: 'esbuild',
    target: 'es2020', // Modern target for better optimization
    cssCodeSplit: true, // Split CSS for better caching
    // Enhanced minification and tree-shaking
    reportCompressedSize: true,
    rollupOptions: {
      input: 'index.html',
      output: {
        // Aggressive chunking strategy for optimal bundle sizes (<250KB target per chunk)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React packages - isolate to prevent context issues
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react/jsx-runtime')) {
              return 'react-core'
            }

            // React Router - separate chunk
            if (id.includes('react-router')) {
              return 'router'
            }

            // Radix UI - group together to prevent circular dependencies
            if (id.includes('@radix-ui')) {
              return 'radix-ui'
            }

            // Framer Motion - heavy animation library
            if (id.includes('framer-motion')) {
              return 'motion'
            }

            // React Helmet - async rendering utilities
            if (id.includes('react-helmet')) {
              return 'helmet'
            }

            // Date utilities
            if (id.includes('date-fns') || id.includes('dayjs')) {
              return 'date-utils'
            }

            // CSS/Styling utilities
            if (id.includes('clsx') || id.includes('class-variance-authority') || id.includes('tailwind-merge')) {
              return 'style-utils'
            }

            // Supabase SDK
            if (id.includes('@supabase/')) {
              return 'supabase'
            }

            // Utility libraries
            if (id.includes('crypto-js') || id.includes('dompurify') || id.includes('zod')) {
              return 'utils'
            }

            // HTTP/GraphQL libraries
            if (id.includes('graphql') || id.includes('fetch')) {
              return 'network'
            }

            // Icons libraries
            if (id.includes('lucide-react')) {
              return 'icons'
            }

            // Google Maps
            if (id.includes('googlemaps')) {
              return 'maps'
            }

            // Internationalization
            if (id.includes('i18next')) {
              return 'i18n'
            }

            // Other vendor libraries
            return 'vendor-misc'
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
      },
      '/api/maps-health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  }
  }
})
