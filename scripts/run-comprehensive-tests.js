#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Runs all test suites with proper reporting and coverage
 */

import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'

const TEST_SUITES = [
    {
        name: 'Unit Tests - API Endpoints',
        command: 'vitest',
        args: ['run', 'api/__tests__/*.test.js', '--reporter=verbose'],
        description: 'Tests for API endpoints, validation schemas, and business logic'
    },
    {
        name: 'Unit Tests - Frontend Components',
        command: 'vitest',
        args: ['run', 'src/__tests__/*.test.{js,jsx}', '--reporter=verbose'],
        description: 'Tests for React components and frontend utilities'
    },
    {
        name: 'Integration Tests - WordPress GraphQL',
        command: 'vitest',
        args: ['run', 'src/__tests__/integration/wordpress-graphql.test.js', '--reporter=verbose'],
        description: 'Tests for WordPress headless CMS integration'
    },
    {
        name: 'Integration Tests - External Services',
        command: 'vitest',
        args: ['run', 'src/__tests__/integration/external-services.test.js', '--reporter=verbose'],
        description: 'Tests for third-party service integrations'
    },
    {
        name: 'End-to-End Tests - User Workflows',
        command: 'vitest',
        args: ['run', 'src/__tests__/e2e/user-workflows.test.js', '--reporter=verbose'],
        description: 'Tests for complete user journeys'
    },
    {
        name: 'Performance Tests',
        command: 'vitest',
        args: ['run', 'api/__tests__/performance.test.js', '--reporter=verbose'],
        description: 'Tests for appointment availability and concurrent bookings'
    },
    {
        name: 'Contact API Integration Tests',
        command: 'vitest',
        args: ['run', 'api/contact/__tests__/*.test.js', '--reporter=verbose'],
        description: 'Tests for contact form and outbox system'
    }
]

const COVERAGE_COMMAND = {
    name: 'Coverage Report',
    command: 'vitest',
    args: ['run', '--coverage', '--reporter=verbose'],
    description: 'Generate comprehensive test coverage report'
}

class TestRunner {
    constructor() {
        this.results = []
        this.startTime = Date.now()
    }

    async runCommand(command, args, cwd = process.cwd()) {
        return new Promise((resolve, reject) => {
            console.log(`\n🔄 Running: ${command} ${args.join(' ')}`)

            const child = spawn(command, args, {
                cwd,
                stdio: 'inherit',
                shell: true
            })

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, code })
                } else {
                    resolve({ success: false, code })
                }
            })

            child.on('error', (error) => {
                reject(error)
            })
        })
    }

    async runTestSuite(suite) {
        console.log(`\n${'='.repeat(60)}`)
        console.log(`📋 ${suite.name}`)
        console.log(`📝 ${suite.description}`)
        console.log(`${'='.repeat(60)}`)

        const startTime = Date.now()

        try {
            const result = await this.runCommand(suite.command, suite.args)
            const duration = Date.now() - startTime

            this.results.push({
                name: suite.name,
                success: result.success,
                duration,
                code: result.code
            })

            if (result.success) {
                console.log(`\n✅ ${suite.name} completed successfully (${duration}ms)`)
            } else {
                console.log(`\n❌ ${suite.name} failed with code ${result.code} (${duration}ms)`)
            }

            return result.success
        } catch (error) {
            console.error(`\n💥 ${suite.name} crashed:`, error.message)

            this.results.push({
                name: suite.name,
                success: false,
                duration: Date.now() - startTime,
                error: error.message
            })

            return false
        }
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Test Suite')
        console.log(`📅 ${new Date().toISOString()}`)
        console.log(`📁 Working directory: ${process.cwd()}`)

        // Check if required files exist
        const requiredFiles = [
            'package.json',
            'vite.config.js',
            'src/__tests__/setup.js'
        ]

        for (const file of requiredFiles) {
            if (!existsSync(file)) {
                console.error(`❌ Required file not found: ${file}`)
                process.exit(1)
            }
        }

        console.log('✅ All required files found')

        // Run each test suite
        let allPassed = true
        for (const suite of TEST_SUITES) {
            const success = await this.runTestSuite(suite)
            if (!success) {
                allPassed = false
            }
        }

        // Generate coverage report if all tests passed
        if (allPassed) {
            console.log(`\n${'='.repeat(60)}`)
            console.log('📊 Generating Coverage Report')
            console.log(`${'='.repeat(60)}`)

            await this.runTestSuite(COVERAGE_COMMAND)
        }

        this.printSummary()

        if (!allPassed) {
            process.exit(1)
        }
    }

    printSummary() {
        const totalDuration = Date.now() - this.startTime
        const passed = this.results.filter(r => r.success).length
        const failed = this.results.filter(r => !r.success).length

        console.log(`\n${'='.repeat(60)}`)
        console.log('📈 TEST SUMMARY')
        console.log(`${'='.repeat(60)}`)
        console.log(`⏱️  Total Duration: ${totalDuration}ms`)
        console.log(`✅ Passed: ${passed}`)
        console.log(`❌ Failed: ${failed}`)
        console.log(`📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

        if (failed > 0) {
            console.log(`\n❌ Failed Test Suites:`)
            this.results
                .filter(r => !r.success)
                .forEach(r => {
                    console.log(`   • ${r.name} (${r.duration}ms)`)
                    if (r.error) {
                        console.log(`     Error: ${r.error}`)
                    }
                })
        }

        console.log(`\n✅ Passed Test Suites:`)
        this.results
            .filter(r => r.success)
            .forEach(r => {
                console.log(`   • ${r.name} (${r.duration}ms)`)
            })

        console.log(`\n${'='.repeat(60)}`)

        if (failed === 0) {
            console.log('🎉 All tests passed! The system is ready for deployment.')
        } else {
            console.log('⚠️  Some tests failed. Please review and fix before deployment.')
        }
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const runner = new TestRunner()
    runner.runAllTests().catch(error => {
        console.error('💥 Test runner crashed:', error)
        process.exit(1)
    })
}

export default TestRunner