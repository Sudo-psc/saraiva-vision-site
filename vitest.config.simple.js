/**
 * Simple Vitest Configuration for Testing
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },

    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.js'],

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

        testTimeout: 30000,

        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
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
                'vite.config.js',
                'vitest.config.js',
                'node_modules/**'
            ]
        }
    }
})