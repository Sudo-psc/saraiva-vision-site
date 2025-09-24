/**
 * Vitest Configuration for Chatbot Comprehensive Testing
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        name: 'chatbot-comprehensive',
        environment: 'node',
        globals: true,
        setupFiles: ['./src/__tests__/setup.js'],
        include: [
            'src/services/__tests__/*compliance*.test.js',
            'src/services/__tests__/*privacy*.test.js',
            'api/__tests__/chatbot*.test.js',
            'src/test/chatbot-comprehensive-test-suite.js'
        ],
        exclude: [
            'node_modules/**',
            'dist/**',
            '.git/**'
        ],
        testTimeout: 30000,
        hookTimeout: 10000,
        teardownTimeout: 5000,
        isolate: true,
        pool: 'threads',
        poolOptions: {
            threads: {
                singleThread: false,
                maxThreads: 4,
                minThreads: 1
            }
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage/chatbot',
            include: [
                'src/services/cfmComplianceEngine.js',
                'src/services/medicalSafetyFilter.js',
                'src/services/lgpdPrivacyManager.js',
                'src/services/dataEncryptionService.js',
                'src/services/geminiService.js',
                'src/services/conversationStateManager.js',
                'src/services/chatbotSecurityService.js',
                'api/chatbot/**/*.js'
            ],
            exclude: [
                'node_modules/**',
                'src/**/__tests__/**',
                'api/**/__tests__/**',
                '**/*.test.js',
                '**/*.spec.js'
            ],
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 80,
                lines: 80
            }
        },
        reporter: [
            'verbose',
            'json',
            'html'
        ],
        outputFile: {
            json: './test-results/chatbot-results.json',
            html: './test-results/chatbot-results.html'
        },
        bail: 0,
        retry: 2,
        sequence: {
            concurrent: true,
            shuffle: false,
            hooks: 'stack'
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@api': path.resolve(__dirname, './api'),
            '@test': path.resolve(__dirname, './src/test')
        }
    },
    define: {
        'process.env.NODE_ENV': '"test"',
        'process.env.VITEST': 'true'
    }
});