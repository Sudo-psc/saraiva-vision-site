/**
 * Vitest Configuration for Comprehensive Testing
 * Optimized configuration for unit, integration, e2e, and performance tests
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
            '@/components': path.resolve(__dirname, './components'),
            '@/hooks': path.resolve(__dirname, './hooks'),
            '@/types': path.resolve(__dirname, './types'),
            '@/lib': path.resolve(__dirname, './lib'),
            '@/app': path.resolve(__dirname, './app'),
            '@/src': path.resolve(__dirname, './src'),
        },
    },

    test: {
        // Global test configuration
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.js'],

        // Test file patterns
        include: [
            '**/*.{test,spec}.{js,jsx,ts,tsx}',
            'api/**/*.test.js',
            'src/**/*.test.{js,jsx}'
        ],
        exclude: [
            'node_modules',
            'dist',
            '.vercel',
            'build',
            'coverage'
        ],

        // Performance and timeout settings
        testTimeout: 30000, // 30 seconds for integration tests
        hookTimeout: 10000, // 10 seconds for setup/teardown
        teardownTimeout: 5000,

        // Parallel execution
        threads: true,
        maxThreads: 4,
        minThreads: 1,

        // Coverage configuration
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',

            // Coverage thresholds
            thresholds: {
                global: {
                    branches: 70,
                    functions: 75,
                    lines: 80,
                    statements: 80
                }
            },

            // Include/exclude patterns
            include: [
                'src/**/*.{js,jsx,ts,tsx}',
                'api/**/*.js'
            ],
            exclude: [
                'src/__tests__/**',
                'api/__tests__/**',
                'src/**/*.test.{js,jsx}',
                'api/**/*.test.js',
                'src/main.jsx',
                'src/App.jsx',
                'vite.config.js',
                'vitest.config.js',
                '**/*.d.ts',
                'node_modules/**',
                'dist/**',
                '.vercel/**'
            ]
        },

        // Reporter configuration
        reporter: ['verbose'],

        // Mock configuration
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,

        // Environment variables for tests
        env: {
            NODE_ENV: 'test',
            VITEST: 'true'
        }
    }
})