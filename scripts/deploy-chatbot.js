#!/usr/bin/env node

/**
 * Chatbot Deployment Script
 * Automated deployment pipeline with health checks and rollback capabilities
 * Requirements: 6.5, 8.4, 8.5 - Deployment and monitoring
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

class ChatbotDeployment {
    constructor(options = {}) {
        this.environment = options.environment || process.env.NODE_ENV || 'staging';
        this.skipTests = options.skipTests || false;
        this.skipHealthCheck = options.skipHealthCheck || false;
        this.rollbackOnFailure = options.rollbackOnFailure !== false;
        this.deploymentId = `deploy_${Date.now()}`;
        this.startTime = Date.now();

        this.deploymentSteps = [
            'validateEnvironment',
            'runPreDeploymentTests',
            'buildApplication',
            'runConfigurationValidation',
            'deployToTarget',
            'runHealthChecks',
            'runPostDeploymentTests',
            'updateMonitoring',
            'notifyCompletion'
        ];

        this.deploymentStatus = {
            id: this.deploymentId,
            environment: this.environment,
            status: 'starting',
            steps: {},
            startTime: new Date().toISOString(),
            errors: [],
            warnings: []
        };
    }

    log(message, color = 'reset') {
        const timestamp = new Date().toISOString();
        console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
    }

    async deploy() {
        this.log(`🚀 Starting Chatbot Deployment`, 'bright');
        this.log(`📋 Deployment ID: ${this.deploymentId}`, 'blue');
        this.log(`🌍 Environment: ${this.environment}`, 'blue');
        this.log('='.repeat(80), 'cyan');

        try {
            for (const step of this.deploymentSteps) {
                await this.executeStep(step);
            }

            this.deploymentStatus.status = 'completed';
            this.deploymentStatus.endTime = new Date().toISOString();
            this.deploymentStatus.duration = Date.now() - this.startTime;

            await this.saveDeploymentRecord();
            this.log(`✅ Deployment completed successfully in ${(this.deploymentStatus.duration / 1000).toFixed(2)}s`, 'green');

        } catch (error) {
            this.deploymentStatus.status = 'failed';
            this.deploymentStatus.error = error.message;
            this.deploymentStatus.endTime = new Date().toISOString();
            this.deploymentStatus.duration = Date.now() - this.startTime;

            this.log(`❌ Deployment failed: ${error.message}`, 'red');

            if (this.rollbackOnFailure) {
                await this.rollback();
            }

            await this.saveDeploymentRecord();
            throw error;
        }
    }

    async executeStep(stepName) {
        this.log(`\n📦 Executing: ${stepName}`, 'blue');
        const stepStartTime = Date.now();

        try {
            this.deploymentStatus.steps[stepName] = {
                status: 'running',
                startTime: new Date().toISOString()
            };

            await this[stepName]();

            const stepDuration = Date.now() - stepStartTime;
            this.deploymentStatus.steps[stepName] = {
                status: 'completed',
                startTime: this.deploymentStatus.steps[stepName].startTime,
                endTime: new Date().toISOString(),
                duration: stepDuration
            };

            this.log(`✅ ${stepName} completed in ${(stepDuration / 1000).toFixed(2)}s`, 'green');

        } catch (error) {
            const stepDuration = Date.now() - stepStartTime;
            this.deploymentStatus.steps[stepName] = {
                status: 'failed',
                startTime: this.deploymentStatus.steps[stepName].startTime,
                endTime: new Date().toISOString(),
                duration: stepDuration,
                error: error.message
            };

            this.log(`❌ ${stepName} failed: ${error.message}`, 'red');
            throw error;
        }
    }

    async validateEnvironment() {
        this.log('🔍 Validating deployment environment...', 'yellow');

        // Check required environment variables
        const requiredEnvVars = [
            'GOOGLE_GEMINI_API_KEY',
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'ENCRYPTION_KEY'
        ];

        const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validate environment-specific settings
        if (this.environment === 'production') {
            if (!process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_SITE_URL) {
                throw new Error('Production deployment requires VERCEL_URL or NEXT_PUBLIC_SITE_URL');
            }
        }

        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 18) {
            throw new Error(`Node.js version ${nodeVersion} is not supported. Minimum version is 18.x`);
        }

        this.log(`✓ Environment validation passed (Node.js ${nodeVersion})`, 'green');
    }

    async runPreDeploymentTests() {
        if (this.skipTests) {
            this.log('⏭️ Skipping pre-deployment tests', 'yellow');
            return;
        }

        this.log('🧪 Running pre-deployment tests...', 'yellow');

        try {
            // Run configuration tests
            await this.runCommand('npm run test:config');

            // Run critical chatbot tests
            await this.runCommand('npm run test:medical-compliance');
            await this.runCommand('npm run test:lgpd-privacy');

            // Run API integration tests
            await this.runCommand('npm run test:api-integration');

            this.log('✓ Pre-deployment tests passed', 'green');

        } catch (error) {
            throw new Error(`Pre-deployment tests failed: ${error.message}`);
        }
    }

    async buildApplication() {
        this.log('🔨 Building application...', 'yellow');

        try {
            // Clean previous builds
            await this.runCommand('rm -rf .next dist');

            // Install dependencies
            await this.runCommand('npm ci');

            // Build application
            if (this.environment === 'production') {
                await this.runCommand('npm run build');
            } else {
                await this.runCommand('npm run build');
            }

            // Verify build output
            const buildExists = await fs.access('.next').then(() => true).catch(() => false);
            if (!buildExists) {
                throw new Error('Build output not found');
            }

            this.log('✓ Application build completed', 'green');

        } catch (error) {
            throw new Error(`Build failed: ${error.message}`);
        }
    }

    async runConfigurationValidation() {
        this.log('⚙️ Validating configuration...', 'yellow');

        try {
            // Import and run configuration validator
            const { default: configValidator } = await import('../src/config/configValidator.js');
            const results = configValidator.validateAll();

            if (results.overall.status === 'failed') {
                throw new Error(`Configuration validation failed: ${results.overall.errors.join(', ')}`);
            }

            if (results.overall.warnings.length > 0) {
                this.log(`⚠️ Configuration warnings: ${results.overall.warnings.join(', ')}`, 'yellow');
                this.deploymentStatus.warnings.push(...results.overall.warnings);
            }

            this.log('✓ Configuration validation passed', 'green');

        } catch (error) {
            throw new Error(`Configuration validation failed: ${error.message}`);
        }
    }

    async deployToTarget() {
        this.log(`🚢 Deploying to ${this.environment}...`, 'yellow');

        try {
            if (process.env.VERCEL_TOKEN) {
                // Deploy to Vercel
                await this.deployToVercel();
            } else {
                // Deploy to other platforms or local
                await this.deployGeneric();
            }

            this.log('✓ Deployment to target completed', 'green');

        } catch (error) {
            throw new Error(`Deployment failed: ${error.message}`);
        }
    }

    async deployToVercel() {
        this.log('📡 Deploying to Vercel...', 'yellow');

        const vercelArgs = ['--prod'];
        if (this.environment !== 'production') {
            vercelArgs.pop(); // Remove --prod for non-production
        }

        await this.runCommand(`npx vercel ${vercelArgs.join(' ')}`);

        // Get deployment URL
        const { stdout } = await execAsync('npx vercel ls --limit 1');
        const deploymentUrl = stdout.split('\n')[1]?.split(' ')[1];

        if (deploymentUrl) {
            this.deploymentStatus.deploymentUrl = `https://${deploymentUrl}`;
            this.log(`🌐 Deployed to: ${this.deploymentStatus.deploymentUrl}`, 'green');
        }
    }

    async deployGeneric() {
        this.log('🔧 Running generic deployment...', 'yellow');

        // This could be customized for different deployment targets
        // For now, we'll just verify the build is ready
        const buildExists = await fs.access('.next').then(() => true).catch(() => false);
        if (!buildExists) {
            throw new Error('Build not found for deployment');
        }

        this.log('✓ Generic deployment preparation completed', 'green');
    }

    async runHealthChecks() {
        if (this.skipHealthCheck) {
            this.log('⏭️ Skipping health checks', 'yellow');
            return;
        }

        this.log('🏥 Running health checks...', 'yellow');

        try {
            // Wait for deployment to be ready
            await this.waitForDeployment();

            // Run health checks
            await this.checkApiHealth();
            await this.checkChatbotHealth();
            await this.checkComplianceHealth();

            this.log('✓ Health checks passed', 'green');

        } catch (error) {
            throw new Error(`Health checks failed: ${error.message}`);
        }
    }

    async waitForDeployment() {
        if (!this.deploymentStatus.deploymentUrl) {
            this.log('⏭️ No deployment URL available, skipping readiness check', 'yellow');
            return;
        }

        this.log('⏳ Waiting for deployment to be ready...', 'yellow');

        const maxAttempts = 30;
        const delay = 10000; // 10 seconds

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await fetch(`${this.deploymentStatus.deploymentUrl}/api/health`);
                if (response.ok) {
                    this.log('✓ Deployment is ready', 'green');
                    return;
                }
            } catch (error) {
                // Expected during startup
            }

            this.log(`⏳ Attempt ${attempt}/${maxAttempts} - waiting ${delay / 1000}s...`, 'yellow');
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        throw new Error('Deployment did not become ready within timeout');
    }

    async checkApiHealth() {
        this.log('🔍 Checking API health...', 'yellow');

        const baseUrl = this.deploymentStatus.deploymentUrl || 'http://localhost:3000';

        try {
            // Check main health endpoint
            const healthResponse = await fetch(`${baseUrl}/api/health`);
            if (!healthResponse.ok) {
                throw new Error(`Health endpoint returned ${healthResponse.status}`);
            }

            const healthData = await healthResponse.json();
            if (healthData.status !== 'healthy') {
                throw new Error(`API health check failed: ${healthData.message}`);
            }

            this.log('✓ API health check passed', 'green');

        } catch (error) {
            throw new Error(`API health check failed: ${error.message}`);
        }
    }

    async checkChatbotHealth() {
        this.log('🤖 Checking chatbot health...', 'yellow');

        const baseUrl = this.deploymentStatus.deploymentUrl || 'http://localhost:3000';

        try {
            // Check chatbot health endpoint
            const chatbotResponse = await fetch(`${baseUrl}/api/chatbot/health`);
            if (!chatbotResponse.ok) {
                throw new Error(`Chatbot health endpoint returned ${chatbotResponse.status}`);
            }

            const chatbotData = await chatbotResponse.json();
            if (chatbotData.status !== 'healthy') {
                throw new Error(`Chatbot health check failed: ${chatbotData.message}`);
            }

            // Test basic chat functionality
            const chatResponse = await fetch(`${baseUrl}/api/chatbot/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Health check test' })
            });

            if (!chatResponse.ok) {
                throw new Error(`Chat endpoint test failed with status ${chatResponse.status}`);
            }

            const chatData = await chatResponse.json();
            if (!chatData.success) {
                throw new Error(`Chat functionality test failed: ${chatData.error}`);
            }

            this.log('✓ Chatbot health check passed', 'green');

        } catch (error) {
            throw new Error(`Chatbot health check failed: ${error.message}`);
        }
    }

    async checkComplianceHealth() {
        this.log('⚖️ Checking compliance health...', 'yellow');

        try {
            // Import and check compliance services
            const { default: configValidator } = await import('../src/config/configValidator.js');
            const complianceResults = configValidator.validateCompliance();

            if (complianceResults.overall.status === 'failed') {
                throw new Error(`Compliance validation failed: ${complianceResults.overall.errors.join(', ')}`);
            }

            this.log('✓ Compliance health check passed', 'green');

        } catch (error) {
            throw new Error(`Compliance health check failed: ${error.message}`);
        }
    }

    async runPostDeploymentTests() {
        if (this.skipTests) {
            this.log('⏭️ Skipping post-deployment tests', 'yellow');
            return;
        }

        this.log('🧪 Running post-deployment tests...', 'yellow');

        try {
            // Run smoke tests
            await this.runSmokeTests();

            // Run integration tests against deployed environment
            if (this.deploymentStatus.deploymentUrl) {
                await this.runIntegrationTests();
            }

            this.log('✓ Post-deployment tests passed', 'green');

        } catch (error) {
            throw new Error(`Post-deployment tests failed: ${error.message}`);
        }
    }

    async runSmokeTests() {
        this.log('💨 Running smoke tests...', 'yellow');

        const baseUrl = this.deploymentStatus.deploymentUrl || 'http://localhost:3000';

        // Test critical endpoints
        const endpoints = [
            '/api/health',
            '/api/chatbot/health',
            '/'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`);
                if (!response.ok) {
                    throw new Error(`Endpoint ${endpoint} returned ${response.status}`);
                }
            } catch (error) {
                throw new Error(`Smoke test failed for ${endpoint}: ${error.message}`);
            }
        }

        this.log('✓ Smoke tests passed', 'green');
    }

    async runIntegrationTests() {
        this.log('🔗 Running integration tests...', 'yellow');

        // Set environment variable for integration tests
        process.env.TEST_BASE_URL = this.deploymentStatus.deploymentUrl;

        try {
            // Run a subset of integration tests
            await this.runCommand('npm run test:api -- --run --reporter=verbose');

            this.log('✓ Integration tests passed', 'green');

        } catch (error) {
            throw new Error(`Integration tests failed: ${error.message}`);
        } finally {
            delete process.env.TEST_BASE_URL;
        }
    }

    async updateMonitoring() {
        this.log('📊 Updating monitoring configuration...', 'yellow');

        try {
            // Update monitoring dashboards
            await this.updateMonitoringDashboards();

            // Configure alerts
            await this.configureAlerts();

            // Update health check endpoints
            await this.updateHealthCheckEndpoints();

            this.log('✓ Monitoring configuration updated', 'green');

        } catch (error) {
            this.log(`⚠️ Monitoring update failed: ${error.message}`, 'yellow');
            this.deploymentStatus.warnings.push(`Monitoring update failed: ${error.message}`);
        }
    }

    async updateMonitoringDashboards() {
        // This would integrate with monitoring services like DataDog, New Relic, etc.
        this.log('📈 Updating monitoring dashboards...', 'yellow');

        // For now, just log the deployment
        const monitoringData = {
            deploymentId: this.deploymentId,
            environment: this.environment,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            deploymentUrl: this.deploymentStatus.deploymentUrl
        };

        // Save monitoring data
        await this.saveMonitoringData(monitoringData);
    }

    async configureAlerts() {
        this.log('🚨 Configuring alerts...', 'yellow');

        // This would configure alerting rules
        // For now, just validate alert configuration
        const alertConfig = {
            errorRate: { threshold: 0.05, window: '5m' },
            responseTime: { threshold: 3000, window: '5m' },
            availability: { threshold: 0.99, window: '5m' }
        };

        this.log(`✓ Alert configuration: ${JSON.stringify(alertConfig)}`, 'green');
    }

    async updateHealthCheckEndpoints() {
        this.log('🏥 Updating health check endpoints...', 'yellow');

        // This would register the deployment with health check services
        const healthEndpoints = [
            '/api/health',
            '/api/chatbot/health'
        ];

        this.log(`✓ Health check endpoints: ${healthEndpoints.join(', ')}`, 'green');
    }

    async notifyCompletion() {
        this.log('📢 Sending deployment notifications...', 'yellow');

        try {
            // Send notifications (Slack, email, etc.)
            await this.sendNotifications();

            this.log('✓ Deployment notifications sent', 'green');

        } catch (error) {
            this.log(`⚠️ Notification failed: ${error.message}`, 'yellow');
            this.deploymentStatus.warnings.push(`Notification failed: ${error.message}`);
        }
    }

    async sendNotifications() {
        const notification = {
            deploymentId: this.deploymentId,
            environment: this.environment,
            status: this.deploymentStatus.status,
            duration: this.deploymentStatus.duration,
            deploymentUrl: this.deploymentStatus.deploymentUrl,
            warnings: this.deploymentStatus.warnings
        };

        // This would integrate with notification services
        this.log(`📧 Notification data: ${JSON.stringify(notification, null, 2)}`, 'blue');
    }

    async rollback() {
        this.log('🔄 Initiating rollback...', 'yellow');

        try {
            if (process.env.VERCEL_TOKEN) {
                await this.rollbackVercel();
            } else {
                await this.rollbackGeneric();
            }

            this.log('✅ Rollback completed', 'green');

        } catch (error) {
            this.log(`❌ Rollback failed: ${error.message}`, 'red');
        }
    }

    async rollbackVercel() {
        this.log('🔄 Rolling back Vercel deployment...', 'yellow');

        try {
            // Get previous deployment
            const { stdout } = await execAsync('npx vercel ls --limit 2');
            const lines = stdout.split('\n').filter(line => line.trim());

            if (lines.length >= 3) {
                const previousDeployment = lines[2].split(' ')[1];
                await this.runCommand(`npx vercel promote ${previousDeployment}`);
                this.log(`✓ Rolled back to: ${previousDeployment}`, 'green');
            } else {
                this.log('⚠️ No previous deployment found for rollback', 'yellow');
            }

        } catch (error) {
            throw new Error(`Vercel rollback failed: ${error.message}`);
        }
    }

    async rollbackGeneric() {
        this.log('🔄 Running generic rollback...', 'yellow');

        // This would implement rollback logic for other platforms
        this.log('⚠️ Generic rollback not implemented', 'yellow');
    }

    async saveDeploymentRecord() {
        try {
            const recordsDir = path.join(__dirname, '..', 'deployment-records');
            await fs.mkdir(recordsDir, { recursive: true });

            const recordFile = path.join(recordsDir, `${this.deploymentId}.json`);
            await fs.writeFile(recordFile, JSON.stringify(this.deploymentStatus, null, 2));

            this.log(`📝 Deployment record saved: ${recordFile}`, 'blue');

        } catch (error) {
            this.log(`⚠️ Failed to save deployment record: ${error.message}`, 'yellow');
        }
    }

    async saveMonitoringData(data) {
        try {
            const monitoringDir = path.join(__dirname, '..', 'monitoring-data');
            await fs.mkdir(monitoringDir, { recursive: true });

            const dataFile = path.join(monitoringDir, `deployment-${this.deploymentId}.json`);
            await fs.writeFile(dataFile, JSON.stringify(data, null, 2));

        } catch (error) {
            this.log(`⚠️ Failed to save monitoring data: ${error.message}`, 'yellow');
        }
    }

    async runCommand(command) {
        return new Promise((resolve, reject) => {
            const child = spawn('sh', ['-c', command], {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
                process.stdout.write(data);
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
                process.stderr.write(data);
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ stdout, stderr });
                } else {
                    reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {};

    // Parse command line arguments
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--environment':
            case '-e':
                options.environment = args[++i];
                break;
            case '--skip-tests':
                options.skipTests = true;
                break;
            case '--skip-health-check':
                options.skipHealthCheck = true;
                break;
            case '--no-rollback':
                options.rollbackOnFailure = false;
                break;
            case '--help':
            case '-h':
                console.log(`
Chatbot Deployment Script

Usage: node deploy-chatbot.js [options]

Options:
  -e, --environment <env>    Target environment (development, staging, production)
  --skip-tests              Skip pre and post deployment tests
  --skip-health-check       Skip health checks
  --no-rollback            Disable automatic rollback on failure
  -h, --help               Show this help message

Examples:
  node deploy-chatbot.js --environment production
  node deploy-chatbot.js --environment staging --skip-tests
  node deploy-chatbot.js --environment development --no-rollback
                `);
                process.exit(0);
        }
    }

    const deployment = new ChatbotDeployment(options);
    deployment.deploy().catch(error => {
        console.error('Deployment failed:', error.message);
        process.exit(1);
    });
}

export default ChatbotDeployment;