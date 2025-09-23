#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * Comprehensive testing for both VPS and Vercel components
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class ProductionReadinessChecker {
    constructor() {
        this.results = {
            vercel: { passed: 0, failed: 0, warnings: 0 },
            vps: { passed: 0, failed: 0, warnings: 0 },
            security: { passed: 0, failed: 0, warnings: 0 },
            performance: { passed: 0, failed: 0, warnings: 0 }
        };
        this.startTime = Date.now();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const colorMap = {
            info: colors.blue,
            success: colors.green,
            warning: colors.yellow,
            error: colors.red,
            header: colors.magenta
        };

        console.log(`${colorMap[type]}[${timestamp}] ${message}${colors.reset}`);
    }

    async checkUrl(url, expectedStatus = 200, timeout = 10000) {
        return new Promise((resolve) => {
            const protocol = url.startsWith('https') ? https : http;
            const startTime = Date.now();

            const req = protocol.get(url, { timeout }, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: res.statusCode === expectedStatus,
                    statusCode: res.statusCode,
                    responseTime,
                    headers: res.headers
                });
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ success: false, error: 'Timeout', responseTime: timeout });
            });

            req.on('error', (error) => {
                resolve({ success: false, error: error.message, responseTime: Date.now() - startTime });
            });
        });
    }

    async checkVercelDeployment() {
        this.log('🚀 Checking Vercel Deployment...', 'header');

        // Check if vercel.json exists and is valid
        try {
            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            this.log('✅ vercel.json is valid JSON', 'success');
            this.results.vercel.passed++;

            // Check required configurations
            const requiredConfigs = ['functions', 'crons', 'headers', 'rewrites'];
            for (const config of requiredConfigs) {
                if (vercelConfig[config]) {
                    this.log(`✅ ${config} configuration found`, 'success');
                    this.results.vercel.passed++;
                } else {
                    this.log(`❌ Missing ${config} configuration`, 'error');
                    this.results.vercel.failed++;
                }
            }

            // Check function configurations
            if (vercelConfig.functions) {
                const criticalFunctions = [
                    'api/contact/index.js',
                    'api/appointments/index.js',
                    'api/podcast/sync.js',
                    'api/outbox/drain.js'
                ];

                for (const func of criticalFunctions) {
                    if (vercelConfig.functions[func] || vercelConfig.functions['api/**']) {
                        this.log(`✅ Function ${func} configured`, 'success');
                        this.results.vercel.passed++;
                    } else {
                        this.log(`⚠️  Function ${func} not specifically configured`, 'warning');
                        this.results.vercel.warnings++;
                    }
                }
            }

            // Check cron jobs
            if (vercelConfig.crons && vercelConfig.crons.length > 0) {
                this.log(`✅ ${vercelConfig.crons.length} cron jobs configured`, 'success');
                this.results.vercel.passed++;

                const requiredCrons = ['/api/outbox/drain', '/api/podcast/sync'];
                for (const cronPath of requiredCrons) {
                    const cronExists = vercelConfig.crons.some(cron => cron.path === cronPath);
                    if (cronExists) {
                        this.log(`✅ Required cron job ${cronPath} found`, 'success');
                        this.results.vercel.passed++;
                    } else {
                        this.log(`❌ Missing required cron job ${cronPath}`, 'error');
                        this.results.vercel.failed++;
                    }
                }
            }

        } catch (error) {
            this.log(`❌ Error reading vercel.json: ${error.message}`, 'error');
            this.results.vercel.failed++;
        }

        // Check environment variables
        const requiredEnvVars = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY',
            'RESEND_API_KEY',
            'WORDPRESS_GRAPHQL_ENDPOINT'
        ];

        this.log('Checking environment variables...', 'info');
        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                this.log(`✅ Environment variable ${envVar} is set`, 'success');
                this.results.vercel.passed++;
            } else {
                this.log(`❌ Missing environment variable ${envVar}`, 'error');
                this.results.vercel.failed++;
            }
        }

        // Test API endpoints if deployed
        const baseUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL;
        if (baseUrl) {
            this.log(`Testing API endpoints at ${baseUrl}...`, 'info');

            const endpoints = [
                { path: '/api/health', expectedStatus: 200 },
                { path: '/api/ping', expectedStatus: 200 }
            ];

            for (const endpoint of endpoints) {
                const url = `${baseUrl}${endpoint.path}`;
                const result = await this.checkUrl(url, endpoint.expectedStatus);

                if (result.success) {
                    this.log(`✅ ${endpoint.path} responded in ${result.responseTime}ms`, 'success');
                    this.results.vercel.passed++;
                } else {
                    this.log(`❌ ${endpoint.path} failed: ${result.error || `Status ${result.statusCode}`}`, 'error');
                    this.results.vercel.failed++;
                }
            }
        }
    }

    async checkVPSDeployment() {
        this.log('🖥️  Checking VPS Deployment...', 'header');

        // Check Docker Compose configuration
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            this.log('✅ Docker Compose configuration found', 'success');
            this.results.vps.passed++;

            try {
                const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');

                // Check for required services
                const requiredServices = ['db', 'redis', 'wordpress', 'nginx'];
                for (const service of requiredServices) {
                    if (dockerComposeContent.includes(`${service}:`)) {
                        this.log(`✅ Service ${service} configured`, 'success');
                        this.results.vps.passed++;
                    } else {
                        this.log(`❌ Missing service ${service}`, 'error');
                        this.results.vps.failed++;
                    }
                }

                // Check for health checks
                if (dockerComposeContent.includes('healthcheck:')) {
                    this.log('✅ Health checks configured', 'success');
                    this.results.vps.passed++;
                } else {
                    this.log('⚠️  No health checks found', 'warning');
                    this.results.vps.warnings++;
                }

                // Check for volumes
                if (dockerComposeContent.includes('volumes:')) {
                    this.log('✅ Persistent volumes configured', 'success');
                    this.results.vps.passed++;
                } else {
                    this.log('❌ No persistent volumes configured', 'error');
                    this.results.vps.failed++;
                }

            } catch (error) {
                this.log(`❌ Error reading Docker Compose file: ${error.message}`, 'error');
                this.results.vps.failed++;
            }
        } else {
            this.log('❌ Docker Compose configuration not found', 'error');
            this.results.vps.failed++;
        }

        // Check VPS setup scripts
        const setupScripts = [
            'vps-wordpress/setup-vps.sh',
            'vps-wordpress/setup-ssl.sh',
            'vps-wordpress/deploy.sh'
        ];

        for (const script of setupScripts) {
            if (fs.existsSync(script)) {
                this.log(`✅ Setup script ${script} found`, 'success');
                this.results.vps.passed++;

                // Check if script is executable
                try {
                    const stats = fs.statSync(script);
                    if (stats.mode & parseInt('111', 8)) {
                        this.log(`✅ Script ${script} is executable`, 'success');
                        this.results.vps.passed++;
                    } else {
                        this.log(`⚠️  Script ${script} is not executable`, 'warning');
                        this.results.vps.warnings++;
                    }
                } catch (error) {
                    this.log(`❌ Error checking script permissions: ${error.message}`, 'error');
                    this.results.vps.failed++;
                }
            } else {
                this.log(`❌ Setup script ${script} not found`, 'error');
                this.results.vps.failed++;
            }
        }

        // Test WordPress endpoint if configured
        const wpEndpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
        if (wpEndpoint) {
            this.log(`Testing WordPress GraphQL endpoint: ${wpEndpoint}`, 'info');

            const result = await this.checkUrl(wpEndpoint, 200);
            if (result.success) {
                this.log(`✅ WordPress GraphQL endpoint accessible in ${result.responseTime}ms`, 'success');
                this.results.vps.passed++;
            } else {
                this.log(`❌ WordPress GraphQL endpoint failed: ${result.error || `Status ${result.statusCode}`}`, 'error');
                this.results.vps.failed++;
            }
        }
    }

    async checkSSLConfiguration() {
        this.log('🔒 Checking SSL Configuration...', 'header');

        const wpDomain = process.env.WORDPRESS_DOMAIN || 'https://cms.saraivavision.com.br';
        const siteDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br';

        const domains = [wpDomain, siteDomain];

        for (const domain of domains) {
            if (domain.startsWith('https://')) {
                this.log(`Testing SSL for ${domain}...`, 'info');

                const result = await this.checkUrl(domain, 200);
                if (result.success) {
                    this.log(`✅ SSL working for ${domain} (${result.responseTime}ms)`, 'success');
                    this.results.security.passed++;

                    // Check security headers
                    if (result.headers) {
                        const securityHeaders = [
                            'strict-transport-security',
                            'x-content-type-options',
                            'x-frame-options'
                        ];

                        for (const header of securityHeaders) {
                            if (result.headers[header]) {
                                this.log(`✅ Security header ${header} present`, 'success');
                                this.results.security.passed++;
                            } else {
                                this.log(`⚠️  Missing security header ${header}`, 'warning');
                                this.results.security.warnings++;
                            }
                        }
                    }
                } else {
                    this.log(`❌ SSL test failed for ${domain}: ${result.error}`, 'error');
                    this.results.security.failed++;
                }
            }
        }

        // Check SSL setup scripts
        const sslScript = 'vps-wordpress/setup-ssl.sh';
        if (fs.existsSync(sslScript)) {
            this.log('✅ SSL setup script found', 'success');
            this.results.security.passed++;
        } else {
            this.log('❌ SSL setup script not found', 'error');
            this.results.security.failed++;
        }
    }

    async checkBackupProcedures() {
        this.log('💾 Checking Backup Procedures...', 'header');

        // Check for backup scripts in VPS setup
        const vpsSetupScript = 'vps-wordpress/setup-vps.sh';
        if (fs.existsSync(vpsSetupScript)) {
            const content = fs.readFileSync(vpsSetupScript, 'utf8');

            if (content.includes('wordpress-backup.sh')) {
                this.log('✅ WordPress backup script configured', 'success');
                this.results.vps.passed++;
            } else {
                this.log('❌ WordPress backup script not found', 'error');
                this.results.vps.failed++;
            }

            if (content.includes('crontab') && content.includes('backup')) {
                this.log('✅ Automated backup scheduling configured', 'success');
                this.results.vps.passed++;
            } else {
                this.log('❌ Automated backup scheduling not configured', 'error');
                this.results.vps.failed++;
            }
        }

        // Check for database backup procedures
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            if (content.includes('volumes:')) {
                this.log('✅ Database volumes configured for backup', 'success');
                this.results.vps.passed++;
            } else {
                this.log('❌ Database volumes not properly configured', 'error');
                this.results.vps.failed++;
            }
        }
    }

    async checkPerformanceOptimization() {
        this.log('⚡ Checking Performance Optimization...', 'header');

        // Check Vercel configuration for performance
        try {
            const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

            // Check for caching headers
            if (vercelConfig.headers && vercelConfig.headers.some(h => h.headers.some(header => header.key === 'Cache-Control'))) {
                this.log('✅ Caching headers configured', 'success');
                this.results.performance.passed++;
            } else {
                this.log('⚠️  No caching headers found', 'warning');
                this.results.performance.warnings++;
            }

            // Check for function memory allocation
            if (vercelConfig.functions) {
                const functionsWithMemory = Object.values(vercelConfig.functions).filter(f => f.memory);
                if (functionsWithMemory.length > 0) {
                    this.log('✅ Function memory allocation configured', 'success');
                    this.results.performance.passed++;
                } else {
                    this.log('⚠️  No explicit memory allocation for functions', 'warning');
                    this.results.performance.warnings++;
                }
            }

            // Check for regions configuration
            if (vercelConfig.regions && vercelConfig.regions.includes('gru1')) {
                this.log('✅ Brazil region (gru1) configured', 'success');
                this.results.performance.passed++;
            } else {
                this.log('⚠️  Brazil region not specifically configured', 'warning');
                this.results.performance.warnings++;
            }

        } catch (error) {
            this.log(`❌ Error checking performance configuration: ${error.message}`, 'error');
            this.results.performance.failed++;
        }

        // Check for Redis configuration in VPS
        const dockerComposePath = 'vps-wordpress/docker-compose.yml';
        if (fs.existsSync(dockerComposePath)) {
            const content = fs.readFileSync(dockerComposePath, 'utf8');

            if (content.includes('redis:')) {
                this.log('✅ Redis caching configured', 'success');
                this.results.performance.passed++;
            } else {
                this.log('❌ Redis caching not configured', 'error');
                this.results.performance.failed++;
            }
        }
    }

    async runTests() {
        this.log('🧪 Running Test Suite...', 'header');

        try {
            // Run API tests
            this.log('Running API tests...', 'info');
            execSync('npm run test:api -- --run', { stdio: 'inherit' });
            this.log('✅ API tests passed', 'success');
            this.results.vercel.passed++;
        } catch (error) {
            this.log('❌ API tests failed', 'error');
            this.results.vercel.failed++;
        }

        try {
            // Run comprehensive tests
            this.log('Running comprehensive test suite...', 'info');
            execSync('npm run test:run', { stdio: 'inherit' });
            this.log('✅ Comprehensive tests passed', 'success');
            this.results.vercel.passed++;
        } catch (error) {
            this.log('❌ Some tests failed', 'error');
            this.results.vercel.failed++;
        }
    }

    generateReport() {
        const totalTime = Date.now() - this.startTime;

        this.log('\n📊 Production Readiness Report', 'header');
        this.log('='.repeat(50), 'info');

        const categories = ['vercel', 'vps', 'security', 'performance'];
        let totalPassed = 0;
        let totalFailed = 0;
        let totalWarnings = 0;

        for (const category of categories) {
            const result = this.results[category];
            totalPassed += result.passed;
            totalFailed += result.failed;
            totalWarnings += result.warnings;

            const total = result.passed + result.failed + result.warnings;
            const percentage = total > 0 ? Math.round((result.passed / total) * 100) : 0;

            this.log(`${category.toUpperCase()}: ${result.passed}✅ ${result.failed}❌ ${result.warnings}⚠️  (${percentage}%)`, 'info');
        }

        this.log('='.repeat(50), 'info');
        this.log(`TOTAL: ${totalPassed}✅ ${totalFailed}❌ ${totalWarnings}⚠️`, 'info');
        this.log(`Execution time: ${(totalTime / 1000).toFixed(2)}s`, 'info');

        const overallScore = Math.round((totalPassed / (totalPassed + totalFailed + totalWarnings)) * 100);

        if (overallScore >= 90) {
            this.log(`🎉 Production Ready! Score: ${overallScore}%`, 'success');
            return 0;
        } else if (overallScore >= 75) {
            this.log(`⚠️  Nearly Ready. Score: ${overallScore}% - Address warnings before deployment`, 'warning');
            return 1;
        } else {
            this.log(`❌ Not Ready for Production. Score: ${overallScore}% - Critical issues must be resolved`, 'error');
            return 2;
        }
    }

    async run() {
        this.log('🚀 Starting Production Readiness Check...', 'header');

        await this.checkVercelDeployment();
        await this.checkVPSDeployment();
        await this.checkSSLConfiguration();
        await this.checkBackupProcedures();
        await this.checkPerformanceOptimization();
        await this.runTests();

        return this.generateReport();
    }
}

// Run the checker
if (import.meta.url === `file://${process.argv[1]}`) {
    const checker = new ProductionReadinessChecker();
    checker.run().then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('❌ Production readiness check failed:', error);
        process.exit(3);
    });
}

export default ProductionReadinessChecker;