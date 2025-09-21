#!/usr/bin/env node

/**
 * Intelligent Vercel Deployment System
 * Handles runtime errors with multiple deployment strategies and error recovery
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class VercelIntelligentDeployer {
    constructor() {
        this.buildVersions = [
            {
                name: 'node22x',
                description: 'Node.js 22.x runtime (recommended - configured via engines)'
            },
            {
                name: 'static',
                description: 'Static site only (no functions)'
            },
            {
                name: 'edge',
                runtime: 'edge',
                description: 'Edge runtime (lightweight functions)'
            }
        ];

        this.deploymentStrategies = [
            {
                name: 'standard',
                description: 'Standard Vercel deployment',
                command: 'npx vercel --prod --yes'
            },
            {
                name: 'force',
                description: 'Force deployment with cache bypass',
                command: 'npx vercel --prod --force --yes'
            },
            {
                name: 'debug',
                description: 'Debug deployment with verbose logs',
                command: 'npx vercel --prod --debug --yes'
            }
        ];

        this.errorRecovery = {
            maxRetries: 3,
            delayBetweenRetries: 5000,
            fallbackBuildCommand: 'npm run build:static'
        };
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

    async executeCommand(command, description, options = {}) {
        try {
            this.log(`Executing: ${description}`);
            this.log(`Command: ${command}`);

            const result = execSync(command, {
                stdio: 'pipe',
                encoding: 'utf8',
                ...options
            });

            this.log(`${description} completed successfully`, 'success');
            return { success: true, output: result };
        } catch (error) {
            this.log(`${description} failed: ${error.message}`, 'error');
            return { success: false, error: error.message, output: error.stdout };
        }
    }

    async backupCurrentConfig() {
        const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
        const backupPath = path.join(process.cwd(), 'vercel.json.backup');

        if (fs.existsSync(vercelConfigPath)) {
            const config = fs.readFileSync(vercelConfigPath, 'utf8');
            fs.writeFileSync(backupPath, config);
            this.log('Configuration backed up to vercel.json.backup', 'success');
        }
    }

    async restoreBackupConfig() {
        const backupPath = path.join(process.cwd(), 'vercel.json.backup');
        const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

        if (fs.existsSync(backupPath)) {
            const backup = fs.readFileSync(backupPath, 'utf8');
            fs.writeFileSync(vercelConfigPath, backup);
            this.log('Configuration restored from backup', 'success');
        }
    }

    async updateVercelConfig(runtimeVersion) {
        const vercelConfigPath = path.join(process.cwd(), 'vercel.json');

        try {
            const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

            // Update function runtime
            if (config.functions && config.functions['api/**/*.js']) {
                const oldRuntime = config.functions['api/**/*.js'].runtime;
                config.functions['api/**/*.js'].runtime = runtimeVersion;

                this.log(`Updated runtime from ${oldRuntime} to ${runtimeVersion}`, 'success');

                fs.writeFileSync(vercelConfigPath, JSON.stringify(config, null, 2));
                return true;
            } else {
                this.log('No functions configuration found in vercel.json', 'warning');
                return false;
            }
        } catch (error) {
            this.log(`Failed to update vercel.json: ${error.message}`, 'error');
            return false;
        }
    }

    async createStaticFallback() {
        this.log('Creating static fallback configuration...', 'warning');

        const staticConfig = {
            buildCommand: 'npm run build:static',
            outputDirectory: 'dist',
            framework: 'vite'
        };

        const staticConfigPath = path.join(process.cwd(), 'vercel.static.json');
        fs.writeFileSync(staticConfigPath, JSON.stringify(staticConfig, null, 2));

        this.log('Static fallback configuration created: vercel.static.json', 'success');
        return staticConfigPath;
    }

    async runBuildTests() {
        this.log('Running build tests to validate configuration...');

        const buildTests = [
            {
                name: 'Standard Build',
                command: 'npm run build:vercel'
            },
            {
                name: 'Production Build',
                command: 'npm run build'
            },
            {
                name: 'Static Build',
                command: 'npm run build:static'
            }
        ];

        const results = [];

        for (const test of buildTests) {
            try {
                this.log(`Testing ${test.name}...`);
                const result = await this.executeCommand(test.command, test.name, { timeout: 120000 });
                results.push({ ...test, ...result });
            } catch (error) {
                results.push({ ...test, success: false, error: error.message });
            }
        }

        return results;
    }

    async attemptDeployment(strategy, runtimeVersion, attempt = 1) {
        this.log(`Attempt ${attempt}: ${strategy.name} with ${runtimeVersion.name}`);

        // Update configuration
        const configUpdated = await this.updateVercelConfig(runtimeVersion.runtime);
        if (!configUpdated) {
            return { success: false, error: 'Failed to update configuration' };
        }

        // Try git commit
        await this.executeCommand('git add vercel.json', 'Stage configuration changes');
        await this.executeCommand(`git commit -m "chore: update runtime to ${runtimeVersion.name}"`, 'Commit configuration changes');

        // Push changes
        const pushResult = await this.executeCommand('git push', 'Push changes to remote');
        if (!pushResult.success) {
            return { success: false, error: 'Failed to push changes' };
        }

        // Execute deployment
        const deployResult = await this.executeCommand(strategy.command, `${strategy.name} deployment`);

        return {
            success: deployResult.success,
            strategy: strategy.name,
            runtime: runtimeVersion.name,
            attempt: attempt,
            error: deployResult.error,
            output: deployResult.output
        };
    }

    async deploy() {
        this.log('🚀 Starting Intelligent Vercel Deployment System', 'success');
        this.log('Target: Saraiva Vision Site');

        // Backup current configuration
        await this.backupCurrentConfig();

        // Run build tests
        this.log('Phase 1: Build Validation');
        const buildResults = await this.runBuildTests();
        const successfulBuilds = buildResults.filter(r => r.success);

        this.log(`Build tests completed: ${successfulBuilds.length}/${buildResults.length} successful`,
                successfulBuilds.length > 0 ? 'success' : 'warning');

        // Try deployment strategies
        this.log('Phase 2: Deployment Attempts');

        for (const strategy of this.deploymentStrategies) {
            for (const runtimeVersion of this.buildVersions) {
                for (let attempt = 1; attempt <= this.errorRecovery.maxRetries; attempt++) {
                    this.log(`\n🎯 Trying: ${strategy.description} with ${runtimeVersion.description} (Attempt ${attempt}/${this.errorRecovery.maxRetries})`);

                    const result = await this.attemptDeployment(strategy, runtimeVersion, attempt);

                    if (result.success) {
                        this.log(`✅ DEPLOYMENT SUCCESSFUL!`, 'success');
                        this.log(`Strategy: ${result.strategy}`);
                        this.log(`Runtime: ${result.runtime}`);
                        this.log(`Attempts: ${result.attempt}`);

                        // Cleanup backup
                        try {
                            fs.unlinkSync(path.join(process.cwd(), 'vercel.json.backup'));
                            this.log('Cleanup completed', 'success');
                        } catch (e) {
                            // Ignore cleanup errors
                        }

                        return result;
                    } else {
                        this.log(`❌ Attempt failed: ${result.error}`, 'error');

                        if (attempt < this.errorRecovery.maxRetries) {
                            this.log(`Waiting ${this.errorRecovery.delayBetweenRetries/1000}s before retry...`);
                            await new Promise(resolve => setTimeout(resolve, this.errorRecovery.delayBetweenRetries));
                        }
                    }
                }
            }
        }

        // Fallback to static deployment
        this.log('⚠️ All deployment attempts failed. Creating static fallback...', 'warning');

        const staticConfigPath = await this.createStaticFallback();

        // Try static deployment
        const staticResult = await this.executeCommand('npx vercel --prod --yes', 'Static deployment');

        if (staticResult.success) {
            this.log('✅ STATIC DEPLOYMENT SUCCESSFUL!', 'success');
            return { success: true, strategy: 'static', runtime: 'none', fallback: true };
        } else {
            this.log('❌ CRITICAL: All deployment methods failed', 'error');
            this.log('Manual intervention required. Please check Vercel dashboard and logs.', 'error');

            // Restore original configuration
            await this.restoreBackupConfig();

            return {
                success: false,
                error: 'All deployment strategies failed',
                buildResults: buildResults,
                staticResult: staticResult
            };
        }
    }
}

// Main execution
async function main() {
    const deployer = new VercelIntelligentDeployer();

    try {
        const result = await deployer.deploy();

        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        console.error('Fatal error in deployment system:', error);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default VercelIntelligentDeployer;