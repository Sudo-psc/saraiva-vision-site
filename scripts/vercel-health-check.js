#!/usr/bin/env node

/**
 * Vercel Deployment Health Check
 * Monitors deployment status and provides diagnostic information
 */

import https from 'https';
import { execSync } from 'child_process';
import fs from 'fs';

class VercelHealthCheck {
    constructor() {
        this.apiUrl = 'https://api.vercel.com';
        this.projectUrl = 'saraivavision-site';
        this.checks = [];
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const levels = {
            info: '\x1b[36mINFO\x1b[0m',
            success: '\x1b[32mSUCCESS\x1b[0m',
            warning: '\x1b[33mWARNING\x1b[0m',
            error: '\x1b[31mERROR\x1b[0m'
        };
        console.log(`[${timestamp}] ${levels[level]}: ${message}`);
    }

    async checkLocalBuild() {
        try {
            this.log('Checking local build capability...');
            execSync('npm run build:vercel', { stdio: 'pipe', timeout: 120000 });
            this.log('Local build successful', 'success');
            return { success: true, name: 'local-build' };
        } catch (error) {
            this.log(`Local build failed: ${error.message}`, 'error');
            return { success: false, name: 'local-build', error: error.message };
        }
    }

    async checkGitStatus() {
        try {
            this.log('Checking git status...');
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            const hasChanges = status.trim().length > 0;

            if (hasChanges) {
                this.log('Git repository has uncommitted changes', 'warning');
                return { success: true, name: 'git-status', clean: false };
            } else {
                this.log('Git repository is clean', 'success');
                return { success: true, name: 'git-status', clean: true };
            }
        } catch (error) {
            this.log(`Git status check failed: ${error.message}`, 'error');
            return { success: false, name: 'git-status', error: error.message };
        }
    }

    async checkVercelCLI() {
        try {
            this.log('Checking Vercel CLI installation...');
            execSync('npx vercel --version', { stdio: 'pipe' });
            this.log('Vercel CLI is installed', 'success');
            return { success: true, name: 'vercel-cli' };
        } catch (error) {
            this.log(`Vercel CLI not available: ${error.message}`, 'error');
            return { success: false, name: 'vercel-cli', error: error.message };
        }
    }

    async checkVercelAuth() {
        try {
            this.log('Checking Vercel authentication...');
            execSync('npx vercel whoami', { stdio: 'pipe' });
            this.log('Vercel authentication valid', 'success');
            return { success: true, name: 'vercel-auth' };
        } catch (error) {
            this.log(`Vercel authentication failed: ${error.message}`, 'error');
            return { success: false, name: 'vercel-auth', error: error.message };
        }
    }

    async checkVercelConfig() {
        try {
            this.log('Checking Vercel configuration...');
            const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

            const issues = [];

            if (!config.buildCommand) {
                issues.push('Missing buildCommand');
            }

            if (!config.outputDirectory) {
                issues.push('Missing outputDirectory');
            }

            if (config.functions) {
                for (const [pattern, funcConfig] of Object.entries(config.functions)) {
                    if (!funcConfig.runtime) {
                        issues.push(`Missing runtime for function pattern: ${pattern}`);
                    } else if (!funcConfig.runtime.includes('@')) {
                        issues.push(`Invalid runtime format for ${pattern}: ${funcConfig.runtime}`);
                    }
                }
            }

            if (issues.length === 0) {
                this.log('Vercel configuration is valid', 'success');
                return { success: true, name: 'vercel-config', config };
            } else {
                this.log(`Vercel configuration issues: ${issues.join(', ')}`, 'warning');
                return { success: false, name: 'vercel-config', issues };
            }
        } catch (error) {
            this.log(`Vercel configuration check failed: ${error.message}`, 'error');
            return { success: false, name: 'vercel-config', error: error.message };
        }
    }

    async checkDependencies() {
        try {
            this.log('Checking project dependencies...');
            execSync('npm ls --depth=0', { stdio: 'pipe' });
            this.log('Dependencies are installed', 'success');
            return { success: true, name: 'dependencies' };
        } catch (error) {
            this.log(`Dependency issues detected: ${error.message}`, 'warning');
            return { success: false, name: 'dependencies', error: error.message };
        }
    }

    async checkDeploymentHistory() {
        try {
            this.log('Checking recent deployment history...');
            const log = execSync('git log --oneline -10', { encoding: 'utf8' });
            const commits = log.trim().split('\n');

            this.log(`Found ${commits.length} recent commits`);
            return { success: true, name: 'deployment-history', commits: commits.length };
        } catch (error) {
            this.log(`Failed to check deployment history: ${error.message}`, 'error');
            return { success: false, name: 'deployment-history', error: error.message };
        }
    }

    async runHealthCheck() {
        this.log('🔍 Starting Vercel Deployment Health Check', 'success');

        const checks = [
            this.checkVercelCLI(),
            this.checkVercelAuth(),
            this.checkGitStatus(),
            this.checkDependencies(),
            this.checkVercelConfig(),
            this.checkLocalBuild(),
            this.checkDeploymentHistory()
        ];

        const results = await Promise.allSettled(checks);
        const healthResults = results.map(result => result.status === 'fulfilled' ? result.value : { success: false, error: result.reason });

        this.log('\n📊 Health Check Results:', 'info');

        let overallHealth = true;
        const passedChecks = [];
        const failedChecks = [];

        healthResults.forEach(check => {
            const status = check.success ? '✅' : '❌';
            const message = `${status} ${check.name}`;

            if (check.success) {
                passedChecks.push(check.name);
                this.log(message, 'success');
            } else {
                failedChecks.push({ name: check.name, error: check.error });
                overallHealth = false;
                this.log(`${message} - ${check.error}`, 'error');
            }
        });

        this.log(`\n📈 Summary: ${passedChecks.length}/${healthResults.length} checks passed`, overallHealth ? 'success' : 'warning');

        if (failedChecks.length > 0) {
            this.log('\n🚨 Failed Checks:', 'error');
            failedChecks.forEach(failed => {
                this.log(`  ${failed.name}: ${failed.error}`, 'error');
            });
        }

        // Recommendations
        this.log('\n💡 Recommendations:', 'info');

        if (!overallHealth) {
            this.log('📋 Fix failed checks before attempting deployment', 'warning');
        }

        if (passedChecks.includes('vercel-cli') && passedChecks.includes('vercel-auth')) {
            this.log('✅ Ready for deployment', 'success');
            this.log('💡 Use: npm run deploy:intelligent for smart deployment', 'info');
        }

        if (failedChecks.some(f => f.name === 'local-build')) {
            this.log('🔧 Fix build issues first:', 'warning');
            this.log('  - Run: npm install', 'info');
            this.log('  - Check: npm run build:vercel', 'info');
        }

        return {
            overall: overallHealth,
            passed: passedChecks,
            failed: failedChecks,
            results: healthResults
        };
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    const healthCheck = new VercelHealthCheck();

    switch (command) {
        case 'full':
            await healthCheck.runHealthCheck();
            break;

        case 'quick':
            const quickChecks = [
                healthCheck.checkVercelCLI(),
                healthCheck.checkVercelAuth(),
                healthCheck.checkLocalBuild()
            ];

            const quickResults = await Promise.all(quickChecks);
            const allPassed = quickResults.every(r => r.success);

            if (allPassed) {
                console.log('✅ Quick health check passed');
                process.exit(0);
            } else {
                console.log('❌ Quick health check failed');
                process.exit(1);
            }
            break;

        default:
            console.log(`
Vercel Deployment Health Check

Usage:
  node vercel-health-check.js full   - Full health check
  node vercel-health-check.js quick  - Quick check (CLI + Auth + Build)
            `);
            break;
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default VercelHealthCheck;