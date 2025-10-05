import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import removeConsolePlugin from './vite-plugin-remove-console.js'

// Image optimization imports (commented out for compatibility)
// Note: These plugins require additional dependencies that may need to be installed
// import { createHtmlPlugin } from 'vite-plugin-html'
// import { imagetools } from 'vite-imagetools'

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
    exclude: ['date-fns', 'crypto-js']
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
    sourcemap: false, // Disabled for production to reduce bundle size
    chunkSizeWarningLimit: 200, // Further reduced for healthcare platform compliance
    assetsDir: 'assets',
    assetsInlineLimit: 1024, // Reduced to minimize inline base64 bloat for mobile
    minify: 'esbuild',
    target: 'es2020', // Modern target for better optimization
    cssCodeSplit: true, // Split CSS for better caching
    // Enhanced minification and tree-shaking
    reportCompressedSize: true,
    modulePreload: {
      polyfill: false // Disable polyfill for modern browsers
    },
    rollupOptions: {
      input: 'index.html',
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui'
            }
            return 'vendor'
          }
        },
        // Optimized file naming for VPS caching with healthcare compliance
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Separate medical images for better caching strategies
          if (assetInfo.name && assetInfo.name.includes('medical') ||
              (assetInfo.name && assetInfo.name.includes('doctor'))) {
            return 'assets/medical/[name]-[hash].[ext]';
          }
          // Separate icons for better caching
          if (assetInfo.name && assetInfo.name.includes('icon')) {
            return 'assets/icons/[name]-[hash].[ext]';
          }
          // Separate images
          if (assetInfo.name && /\.(png|jpg|jpeg|webp|avif|svg)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    copyPublicDir: true,
    // Enhanced compression and optimization
    rollupExternalDependencies: [],
    experimental: {
      renderBuiltUrl: (filename, { hostType }) => {
        // Optimize CDN-like URLs for medical content
        if (hostType === 'js') {
          return { js: `/${filename}` };
        }
        return { relative: true };
      }
    },
    // Image optimization settings for medical content
    // Note: Advanced image processing would require vite-imagetools plugin
    // These settings prepare the build for optimal image handling
    generateEmptyChunk: true,
    cssMinify: true
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
      // Ninsaude API proxy - routes to Express.js backend
      '/api/ninsaude': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

/**
 * Validate that Node.js-only dependencies don't leak into client bundle
 * This prevents Buffer, crypto, fs, path references in browser code
 */
function validateClientBundle() {
  return {
    name: 'validate-no-node-deps',
    enforce: 'post',
    generateBundle(options, bundle) {
      const nodeOnlyModules = ['buffer', 'gray-matter', 'crypto', 'fs', 'path', 'stream'];
      
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.code) {
          for (const module of nodeOnlyModules) {
            // Check for require or import of Node modules
            const patterns = [
              new RegExp(`require\\(['"\`]${module}['"\`]\\)`, 'g'),
              new RegExp(`from ['"\`]${module}['"\`]`, 'g'),
              // Check for Buffer global reference
              module === 'buffer' ? /\bBuffer\s*\./g : null
            ].filter(Boolean);
            
            for (const pattern of patterns) {
              if (pattern.test(chunk.code)) {
                console.warn(`⚠️  Warning: ${fileName} contains reference to Node.js module "${module}"`);
                console.warn(`   This may cause runtime errors in the browser.`);
                console.warn(`   Consider moving this code to build-time processing or SSR.`);
              }
            }
          }
        }
      }
    }
  };
}

