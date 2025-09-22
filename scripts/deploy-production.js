#!/usr/bin/env node

/**
 * Production Deployment Script
 * Master script that orchestrates all production readiness checks and deployment
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import ProductionReadinessChecker from './production-readiness-check.js';
import SSLCertificateManager from './ssl-certificate-manager.js';
import BackupRecoveryTester from './backup-recovery-test.js';
import SecurityAuditor from './security-audit.js';
import PerformanceOptimizer from './performance-optimizer.js';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class ProductionDeploymentManager {
    constructor() {
        this.deploymentSteps = [
            { name: 'Pre-deployment Checks', phase: 'pre' },
            { name: 'Security Audit', phase: 'security' },
            { name: 'Performance Analysis', phase: 'performance' },
            { name: 'SSL Certificate Verification', phase: 'ssl' },
            { name: 'Backup System Testing', phase: 'backup' },
            { name: 'Production Readiness Check', phase: 'readiness' },
            { name: 'Deployment Execution', phase: 'deploy' },
            { name: 'Post-deployment Verification', phase: 'verify' }
        ];

        this.results = {};
        this.startTime = Date.now();
        this.deploymentId = `deploy-${Date.now()}`;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta,
            step: colors.cyan
        };

        console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);

        // Log to deployment log file
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;
        fs.appendFileSync(`deployment-${this.deploymentId}.log`, logEntry);
    }

    async executeStep(stepName, asyncFunction) {
        this.log(`🚀 Starting: ${stepName}`, 'step');
        const stepStart = Date.now();

        try {
            const result = await asyncFunction();
            const duration = Date.now() - stepStart;

            this.results[stepName] = {
                success: true,
                result,
                duration,
                timestamp: new Date().toISOString()
            };

            this.log(`✅ Completed: ${stepName} (${(duration / 1000).toFixed(2)}s)`, 'success');
            return result;
        } catch (error) {
            const duration = Date.now() - stepStart;

            this.results[stepName] = {
                success: false,
                error: error.message,
                duration,
                timestamp: new Date().toISOString()
            };

            this.log(`❌ Failed: ${stepName} - ${error.message}`, 'error');
            throw error;
        }
    }

    async preDeploymentChecks() {
        this.log('🔍 Running Pre-deployment Checks...', 'header');

        // Check required files
        const requiredFiles = [
            'package.json',
            'vercel.json',
            '.env.example',
            'vps-wordpress/docker-compose.yml'
        ];

        for (const file of requiredFiles) {
            if (!fs.existsSync(file)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }

        // Check environment variables
        const requiredEnvVars = [
            'SUPABASE_URL',
            'WORDPRESS_GRAPHQL_ENDPOINT',
            'RESEND_API_KEY'
        ];

        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        if (missingVars.length > 0) {
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Minimum version: 18`);
        }

        // Check npm dependencies
        try {
            execSync('npm audit --audit-level=high', { stdio: 'pipe' });
        } catch (error) {
            this.log('⚠️  High severity vulnerabilities found in dependencies', 'warning');
        }

        return {
            nodeVersion,
            filesChecked: requiredFiles.length,
            envVarsChecked: requiredEnvVars.length
        };
    }

    async runSecurityAudit() {
        this.log('🔒 Running Security Audit...', 'header');

        const auditor = new SecurityAuditor();
        const exitCode = await auditor.run();

        if (exitCode > 2) {
            throw new Error('Critical security issues found. Deployment blocked.');
        }

        return { exitCode, status: exitCode === 0 ? 'passed' : 'warnings' };
    }

    async runPerformanceAnalysis() {
        this.log('⚡ Running Performance Analysis...', 'header');

        const optimizer = new PerformanceOptimizer();
        const exitCode = await optimizer.run();

        return { exitCode, status: exitCode === 0 ? 'optimal' : 'needs_improvement' };
    }

    async verifySSLCertificates() {
        this.log('🔐 Verifying SSL Certificates...', 'header');

        const sslManager = new SSLCertificateManager();
        const results = await sslManager.run('check');

        const validCerts = results.filter(r => r.valid);
        const expiringSoon = results.filter(r => r.valid && r.daysUntilExpiry < 30);

        if (expiringSoon.length > 0) {
            this.log(`⚠️  ${expiringSoon.length} certificates expiring within 30 days`, 'warning');
        }

        return {
            total: results.length,
            valid: validCerts.length,
            expiringSoon: expiringSoon.length
        };
    }

    async testBackupSystems() {
        this.log('💾 Testing Backup Systems...', 'header');

        const backupTester = new BackupRecoveryTester();
        const exitCode = await backupTester.run();

        if (exitCode !== 0) {
            throw new Error('Backup system tests failed. Deployment blocked.');
        }

        return { status: 'passed' };
    }

    async runProductionReadinessCheck() {
        this.log('✅ Running Production Readiness Check...', 'header');

        const checker = new ProductionReadinessChecker();
        const exitCode = await checker.run();

        if (exitCode > 1) {
            throw new Error('Production readiness check failed. Critical issues must be resolved.');
        }

        return { exitCode, status: exitCode === 0 ? 'ready' : 'warnings' };
    }

    async deployToVercel() {
        this.log('🚀 Deploying to Vercel...', 'header');

        try {
            // Build the project
            this.log('Building project...', 'info');
            execSync('npm run build', { stdio: 'inherit' });

            // Deploy to Vercel
            this.log('Deploying to Vercel...', 'info');
            const deployOutput = execSync('npx vercel --prod --yes', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            // Extract deployment URL
            const urlMatch = deployOutput.match(/https:\/\/[^\s]+/);
            const deploymentUrl = urlMatch ? urlMatch[0] : null;

            return {
                success: true,
                deploymentUrl,
                output: deployOutput
            };
        } catch (error) {
            throw new Error(`Vercel deployment failed: ${error.message}`);
        }
    }

    async deployToVPS() {
        this.log('🖥️  Deploying to VPS...', 'header');

        const vpsDeployScript = 'vps-wordpress/deploy.sh';

        if (!fs.existsSync(vpsDeployScript)) {
            this.log('⚠️  VPS deploy script not found, skipping VPS deployment', 'warning');
            return { skipped: true };
        }

        try {
            const deployOutput = execSync(`bash ${vpsDeployScript}`, {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            return {
                success: true,
                output: deployOutput
            };
        } catch (error) {
            throw new Error(`VPS deployment failed: ${error.message}`);
        }
    }

    async postDeploymentVerification(deploymentUrl) {
        this.log('🔍 Running Post-deployment Verification...', 'header');

        const verificationTests = [
            { name: 'Health Check', url: `${deploymentUrl}/api/health` },
            { name: 'Ping Test', url: `${deploymentUrl}/api/ping` },
            { name: 'Homepage Load', url: deploymentUrl }
        ];

        const results = [];

        for (const test of verificationTests) {
            try {
                const response = await fetch(test.url, {
                    method: 'GET',
                    timeout: 10000
                });

                results.push({
                    name: test.name,
                    success: response.ok,
                    status: response.status,
                    url: test.url
                });

                this.log(`✅ ${test.name}: ${response.status}`, 'success');
            } catch (error) {
                results.push({
                    name: test.name,
                    success: false,
                    error: error.message,
                    url: test.url
                });

                this.log(`❌ ${test.name}: ${error.message}`, 'error');
            }
        }

        const successfulTests = results.filter(r => r.success).length;
        const totalTests = results.length;

        if (successfulTests < totalTests) {
            throw new Error(`${totalTests - successfulTests} verification tests failed`);
        }

        return {
            totalTests,
            successfulTests,
            results
        };
    }

    async createDeploymentReport() {
        const totalTime = Date.now() - this.startTime;
        const report = {
            deploymentId: this.deploymentId,
            timestamp: new Date().toISOString(),
            duration: totalTime,
            results: this.results,
            summary: {
                totalSteps: Object.keys(this.results).length,
                successfulSteps: Object.values(this.results).filter(r => r.success).length,
                failedSteps: Object.values(this.results).filter(r => !r.success).length
            }
        };

        const reportPath = `deployment-report-${this.deploymentId}.json`;
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log(`📊 Deployment report saved: ${reportPath}`, 'info');
        return report;
    }

    async run(options = {}) {
        this.log('🚀 Starting Production Deployment Process...', 'header');
        this.log(`Deployment ID: ${this.deploymentId}`, 'info');

        try {
            // Pre-deployment phase
            await this.executeStep('Pre-deployment Checks', () => this.preDeploymentChecks());

            if (!options.skipSecurity) {
                await this.executeStep('Security Audit', () => this.runSecurityAudit());
            }

            if (!options.skipPerformance) {
                await this.executeStep('Performance Analysis', () => this.runPerformanceAnalysis());
            }

            await this.executeStep('SSL Certificate Verification', () => this.verifySSLCertificates());

            if (!options.skipBackup) {
                await this.executeStep('Backup System Testing', () => this.testBackupSystems());
            }

            await this.executeStep('Production Readiness Check', () => this.runProductionReadinessCheck());

            // Deployment phase
            const vercelResult = await this.executeStep('Vercel Deployment', () => this.deployToVercel());

            if (!options.skipVPS) {
                await this.executeStep('VPS Deployment', () => this.deployToVPS());
            }

            // Verification phase
            if (vercelResult.deploymentUrl) {
                await this.executeStep('Post-deployment Verification', () =>
                    this.postDeploymentVerification(vercelResult.deploymentUrl)
                );
            }

            // Generate report
            const report = await this.createDeploymentReport();

            this.log('🎉 Production Deployment Completed Successfully!', 'success');
            this.log(`Total time: ${(report.duration / 1000 / 60).toFixed(2)} minutes`, 'info');

            if (vercelResult.deploymentUrl) {
                this.log(`🌐 Deployment URL: ${vercelResult.deploymentUrl}`, 'success');
            }

            return 0;

        } catch (error) {
            this.log(`💥 Deployment Failed: ${error.message}`, 'error');

            await this.createDeploymentReport();

            this.log('📋 Check the deployment report for detailed information', 'info');
            return 1;
        }
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {
        skipSecurity: args.includes('--skip-security'),
        skipPerformance: args.includes('--skip-performance'),
        skipBackup: args.includes('--skip-backup'),
        skipVPS: args.includes('--skip-vps')
    };

    const manager = new ProductionDeploymentManager();

    manager.run(options).then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('❌ Production deployment failed:', error);
        process.exit(1);
    });
}

export default ProductionDeploymentManager;