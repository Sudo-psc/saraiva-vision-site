import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"test"'
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.jsx',
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/*.d.ts',
        'src/test/',
        'vevn/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
