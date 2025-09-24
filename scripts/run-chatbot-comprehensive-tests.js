#!/usr/bin/env node

/**
 * Comprehensive Chatbot Test Runner
 * Executes all chatbot-related tests with detailed reporting
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const TEST_RESULTS_DIR = './test-results';
const COVERAGE_DIR = './coverage/chatbot';

// Test suites configuration
const TEST_SUITES = [
    {
        name: 'Medical Compliance Tests',
        command: 'npm',
        args: ['run', 'test:medical-compliance'],
        timeout: 60000,
        critical: true
    },
    {
        name: 'LGPD Privacy Tests',
        command: 'npm',
        args: ['run', 'test:lgpd-privacy'],
        timeout: 60000,
        critical: true
    },
    {
        name: 'API Integration Tests',
        command: 'npm',
        args: ['run', 'test:api-integration'],
        timeout: 90000,
        critical: true
    },
    {
        name: 'End-to-End Compliance Tests',
        command: 'vitest',
        args: ['run', 'src/test/__tests__/chatbot-e2e-compliance.test.js'],
        timeout: 120000,
        critical: true
    },
    {
        name: 'Security and Penetration Tests',
        command: 'vitest',
        args: ['run', 'src/test/__tests__/chatbot-security-penetration.test.js'],
        timeout: 90000,
        critical: true
    },
    {
        name: 'Compliance Validation Tests',
        command: 'vitest',
        args: ['run', 'src/test/__tests__/chatbot-compliance-validation.test.js'],
        timeout: 60000,
        critical: true
    },
    {
        name: 'Comprehensive Test Suite',
        command: 'vitest',
        args: ['run', 'src/test/chatbot-comprehensive-test-suite.js'],
        timeout: 30000,
        critical: false
    }
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class TestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            suites: []
        };
        this.startTime = Date.now();
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    async ensureDirectories() {
        try {
            await fs.mkdir(TEST_RESULTS_DIR, { recursive: true });
            await fs.mkdir(COVERAGE_DIR, { recursive: true });
        } catch (error) {
            this.log(`Warning: Could not create directories: ${error.message}`, 'yellow');
        }
    }

    async runTestSuite(suite) {
        this.log(`\n${'='.repeat(60)}`, 'cyan');
        this.log(`Running: ${suite.name}`, 'bright');
        this.log(`Command: ${suite.command} ${suite.args.join(' ')}`, 'blue');
        this.log(`${'='.repeat(60)}`, 'cyan');

        const startTime = Date.now();

        return new Promise((resolve) => {
            const process = spawn(suite.command, suite.args, {
                stdio: 'pipe',
                shell: true
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                console.log(output);
            });

            process.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                console.error(output);
            });

            const timeout = setTimeout(() => {
                process.kill('SIGKILL');
                resolve({
                    name: suite.name,
                    status: 'timeout',
                    duration: Date.now() - startTime,
                    stdout,
                    stderr: stderr + '\nTest timed out',
                    critical: suite.critical
                });
            }, suite.timeout);

            process.on('close', (code) => {
                clearTimeout(timeout);
                const duration = Date.now() - startTime;

                resolve({
                    name: suite.name,
                    status: code === 0 ? 'passed' : 'failed',
                    exitCode: code,
                    duration,
                    stdout,
                    stderr,
                    critical: suite.critical
                });
            });

            process.on('error', (error) => {
                clearTimeout(timeout);
                resolve({
                    name: suite.name,
                    status: 'error',
                    duration: Date.now() - startTime,
                    stdout,
                    stderr: stderr + `\nProcess error: ${error.message}`,
                    critical: suite.critical
                });
            });
        });
    }

    parseTestResults(stdout) {
        const results = {
            tests: 0,
            passed: 0,
            failed: 0,
            skipped: 0
        };

        // Parse vitest output
        const testMatch = stdout.match(/Test Files\s+(\d+)\s+passed/);
        const passedMatch = stdout.match(/Tests\s+(\d+)\s+passed/);
        const failedMatch = stdout.match(/(\d+)\s+failed/);
        const skippedMatch = stdout.match(/(\d+)\s+skipped/);

        if (passedMatch) results.passed = parseInt(passedMatch[1]);
        if (failedMatch) results.failed = parseInt(failedMatch[1]);
        if (skippedMatch) results.skipped = parseInt(skippedMatch[1]);

        results.tests = results.passed + results.failed + results.skipped;

        return results;
    }

    async generateReport() {
        const totalDuration = Date.now() - this.startTime;

        const report = {
            timestamp: new Date().toISOString(),
            duration: totalDuration,
            summary: this.results,
            suites: this.results.suites,
            environment: {
                node: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

        // Write JSON report
        const jsonReportPath = path.join(TEST_RESULTS_DIR, 'chatbot-comprehensive-report.json');
        await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2));

        // Write HTML report
        const htmlReport = this.generateHtmlReport(report);
        const htmlReportPath = path.join(TEST_RESULTS_DIR, 'chatbot-comprehensive-report.html');
        await fs.writeFile(htmlReportPath, htmlReport);

        return report;
    }

    generateHtmlReport(report) {
        const passRate = ((report.summary.passed / report.summary.total) * 100).toFixed(1);
        const criticalFailures = report.suites.filter(s => s.status !== 'passed' && s.critical).length;

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Chatbot Comprehensive Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .metric.passed { background: #d4edda; }
        .metric.failed { background: #f8d7da; }
        .metric.critical { background: #f5c6cb; }
        .suite { margin: 10px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .suite.passed { border-color: #28a745; background: #f8fff9; }
        .suite.failed { border-color: #dc3545; background: #fff8f8; }
        .suite.timeout { border-color: #ffc107; background: #fffdf5; }
        .duration { color: #666; font-size: 0.9em; }
        .output { background: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace; font-size: 0.8em; max-height: 200px; overflow-y: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chatbot Comprehensive Test Report</h1>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Duration:</strong> ${(report.duration / 1000).toFixed(2)}s</p>
        <p><strong>Environment:</strong> Node ${report.environment.node} on ${report.environment.platform}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.total}</div>
        </div>
        <div class="metric passed">
            <h3>Passed</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.passed}</div>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <div style="font-size: 2em; font-weight: bold;">${report.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Pass Rate</h3>
            <div style="font-size: 2em; font-weight: bold;">${passRate}%</div>
        </div>
        <div class="metric ${criticalFailures > 0 ? 'critical' : 'passed'}">
            <h3>Critical Failures</h3>
            <div style="font-size: 2em; font-weight: bold;">${criticalFailures}</div>
        </div>
    </div>

    <h2>Test Suites</h2>
    ${report.suites.map(suite => `
        <div class="suite ${suite.status}">
            <h3>${suite.name} ${suite.critical ? '(Critical)' : ''}</h3>
            <p><strong>Status:</strong> ${suite.status.toUpperCase()}</p>
            <p class="duration"><strong>Duration:</strong> ${(suite.duration / 1000).toFixed(2)}s</p>
            ${suite.exitCode !== undefined ? `<p><strong>Exit Code:</strong> ${suite.exitCode}</p>` : ''}
            ${suite.stderr ? `
                <h4>Error Output:</h4>
                <div class="output">${suite.stderr.replace(/\n/g, '<br>')}</div>
            ` : ''}
        </div>
    `).join('')}

    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 5px;">
        <h3>Test Coverage</h3>
        <p>Detailed coverage reports are available in the <code>coverage/chatbot</code> directory.</p>
        
        <h3>Compliance Summary</h3>
        <ul>
            <li><strong>CFM Medical Compliance:</strong> ${report.suites.find(s => s.name.includes('Medical Compliance'))?.status === 'passed' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}</li>
            <li><strong>LGPD Privacy Compliance:</strong> ${report.suites.find(s => s.name.includes('LGPD Privacy'))?.status === 'passed' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}</li>
            <li><strong>Security Standards:</strong> ${report.suites.find(s => s.name.includes('Security'))?.status === 'passed' ? '✅ SECURE' : '❌ VULNERABILITIES DETECTED'}</li>
            <li><strong>API Integration:</strong> ${report.suites.find(s => s.name.includes('API Integration'))?.status === 'passed' ? '✅ FUNCTIONAL' : '❌ ISSUES DETECTED'}</li>
        </ul>
    </div>
</body>
</html>`;
    }

    async run() {
        this.log('🚀 Starting Comprehensive Chatbot Test Suite', 'bright');
        this.log(`📅 ${new Date().toISOString()}`, 'blue');

        await this.ensureDirectories();

        // Run all test suites
        for (const suite of TEST_SUITES) {
            const result = await this.runTestSuite(suite);
            this.results.suites.push(result);

            // Parse test results from output
            const testResults = this.parseTestResults(result.stdout);
            this.results.total += testResults.tests;
            this.results.passed += testResults.passed;
            this.results.failed += testResults.failed;
            this.results.skipped += testResults.skipped;

            // Log result
            if (result.status === 'passed') {
                this.log(`✅ ${suite.name} - PASSED (${(result.duration / 1000).toFixed(2)}s)`, 'green');
            } else if (result.status === 'failed') {
                this.log(`❌ ${suite.name} - FAILED (${(result.duration / 1000).toFixed(2)}s)`, 'red');
                if (suite.critical) {
                    this.log(`⚠️  CRITICAL TEST FAILURE`, 'red');
                }
            } else if (result.status === 'timeout') {
                this.log(`⏰ ${suite.name} - TIMEOUT (${(result.duration / 1000).toFixed(2)}s)`, 'yellow');
            } else {
                this.log(`💥 ${suite.name} - ERROR (${(result.duration / 1000).toFixed(2)}s)`, 'red');
            }
        }

        // Generate comprehensive report
        const report = await this.generateReport();

        // Print summary
        this.log('\n' + '='.repeat(80), 'cyan');
        this.log('📊 TEST EXECUTION SUMMARY', 'bright');
        this.log('='.repeat(80), 'cyan');

        this.log(`Total Duration: ${(report.duration / 1000).toFixed(2)}s`, 'blue');
        this.log(`Total Tests: ${this.results.total}`, 'blue');
        this.log(`Passed: ${this.results.passed}`, 'green');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'green');
        this.log(`Skipped: ${this.results.skipped}`, 'yellow');

        const passRate = this.results.total > 0 ? ((this.results.passed / this.results.total) * 100).toFixed(1) : 0;
        this.log(`Pass Rate: ${passRate}%`, passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red');

        // Check critical failures
        const criticalFailures = this.results.suites.filter(s => s.status !== 'passed' && s.critical);
        if (criticalFailures.length > 0) {
            this.log(`\n⚠️  CRITICAL FAILURES DETECTED: ${criticalFailures.length}`, 'red');
            criticalFailures.forEach(failure => {
                this.log(`   - ${failure.name}`, 'red');
            });
        }

        // Compliance status
        this.log('\n🏥 COMPLIANCE STATUS', 'bright');
        const medicalCompliance = this.results.suites.find(s => s.name.includes('Medical Compliance'));
        const lgpdCompliance = this.results.suites.find(s => s.name.includes('LGPD Privacy'));
        const securityCompliance = this.results.suites.find(s => s.name.includes('Security'));

        this.log(`CFM Medical Compliance: ${medicalCompliance?.status === 'passed' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`,
            medicalCompliance?.status === 'passed' ? 'green' : 'red');
        this.log(`LGPD Privacy Compliance: ${lgpdCompliance?.status === 'passed' ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`,
            lgpdCompliance?.status === 'passed' ? 'green' : 'red');
        this.log(`Security Standards: ${securityCompliance?.status === 'passed' ? '✅ SECURE' : '❌ VULNERABILITIES'}`,
            securityCompliance?.status === 'passed' ? 'green' : 'red');

        this.log(`\n📄 Reports generated:`, 'blue');
        this.log(`   - JSON: ${path.join(TEST_RESULTS_DIR, 'chatbot-comprehensive-report.json')}`, 'blue');
        this.log(`   - HTML: ${path.join(TEST_RESULTS_DIR, 'chatbot-comprehensive-report.html')}`, 'blue');
        this.log(`   - Coverage: ${COVERAGE_DIR}`, 'blue');

        // Exit with appropriate code
        const hasFailures = this.results.failed > 0 || criticalFailures.length > 0;
        process.exit(hasFailures ? 1 : 0);
    }
}

// Run the test suite
const runner = new TestRunner();
runner.run().catch(error => {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
});