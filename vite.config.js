import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { workboxVitePlugin } from './src/utils/workbox-vite-plugin.js'

export default defineConfig({
  plugins: [react(), workboxVitePlugin()],
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
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-visually-hidden'],
          animation: ['framer-motion'],
          utils: ['date-fns', 'clsx', 'class-variance-authority'],
        },
      },
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