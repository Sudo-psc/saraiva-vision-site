#!/usr/bin/env node

/**
 * WordPress Headless CMS Integration Verification Script
 * Checks all components of the WordPress + VPS + Supabase + Vercel integration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const success = (message) => log(`✅ ${message}`, 'green');
const error = (message) => log(`❌ ${message}`, 'red');
const warning = (message) => log(`⚠️  ${message}`, 'yellow');
const info = (message) => log(`ℹ️  ${message}`, 'blue');

class WordPressIntegrationVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        };
    }

    async runCheck(name, checkFunction) {
        this.results.total++;
        try {
            const result = await checkFunction();
            if (result === true) {
                success(name);
                this.results.passed++;
            } else if (result === 'warning') {
                warning(name);
                this.results.warnings++;
            } else {
                error(name);
                this.results.failed++;
            }
        } catch (err) {
            error(`${name}: ${err.message}`);
            this.results.failed++;
        }
    }

    // Check if required files exist
    checkRequiredFiles() {
        const requiredFiles = [
            'src/lib/wordpress.js',
            'src/lib/wordpress-api.js',
            'src/lib/wordpress-queries.js',
            'src/lib/wordpress-isr.js',
            'src/hooks/useWordPress.js',
            'api/wordpress-webhook.js',
            'api/revalidate.js',
            'vps-wordpress/docker-compose.yml',
            'vps-wordpress/deploy.sh'
        ];

        return requiredFiles.every(file => {
            if (fs.existsSync(file)) {
                return true;
            } else {
                error(`Missing required file: ${file}`);
                return false;
            }
        });
    }

    // Check environment variables
    checkEnvironmentVariables() {
        const requiredEnvVars = [
            'WORDPRESS_GRAPHQL_ENDPOINT',
            'WP_REVALIDATE_SECRET',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY'
        ];

        const envFiles = ['.env', '.env.local', '.env.production'];
        let foundEnvFile = false;
        let missingVars = [];

        for (const envFile of envFiles) {
            if (fs.existsSync(envFile)) {
                foundEnvFile = true;
                const envContent = fs.readFileSync(envFile, 'utf8');

                for (const varName of requiredEnvVars) {
                    if (!envContent.includes(varName)) {
                        missingVars.push(varName);
                    }
                }
                break;
            }
        }

        if (!foundEnvFile) {
            error('No environment file found (.env, .env.local, or .env.production)');
            return false;
        }

        if (missingVars.length > 0) {
            error(`Missing environment variables: ${missingVars.join(', ')}`);
            return false;
        }

        return true;
    }

    // Check WordPress GraphQL endpoint
    async checkWordPressEndpoint() {
        const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://cms.saraivavision.com.br/graphql';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `
                        query HealthCheck {
                            generalSettings {
                                title
                                url
                            }
                        }
                    `
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.generalSettings) {
                    return true;
                } else {
                    error('WordPress GraphQL endpoint returned invalid response');
                    return false;
                }
            } else {
                error(`WordPress GraphQL endpoint returned ${response.status}`);
                return false;
            }
        } catch (err) {
            error(`Cannot reach WordPress GraphQL endpoint: ${err.message}`);
            return false;
        }
    }

    // Check Supabase connection
    async checkSupabaseConnection() {
        try {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseKey) {
                error('Supabase environment variables not configured');
                return false;
            }

            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });

            if (response.ok) {
                return true;
            } else {
                error(`Supabase connection failed: ${response.status}`);
                return false;
            }
        } catch (err) {
            error(`Supabase connection error: ${err.message}`);
            return false;
        }
    }

    // Check if WordPress integration files have correct imports
    checkWordPressImports() {
        try {
            const wordpressFile = fs.readFileSync('src/lib/wordpress.js', 'utf8');
            const apiFile = fs.readFileSync('src/lib/wordpress-api.js', 'utf8');
            const hooksFile = fs.readFileSync('src/hooks/useWordPress.js', 'utf8');

            // Check for GraphQL client import
            if (!wordpressFile.includes('GraphQLClient')) {
                error('GraphQL client not imported in wordpress.js');
                return false;
            }

            // Check for proper query imports
            if (!apiFile.includes('executeGraphQLQuery')) {
                error('executeGraphQLQuery not imported in wordpress-api.js');
                return false;
            }

            // Check for React hooks
            if (!hooksFile.includes('useState') || !hooksFile.includes('useEffect')) {
                error('React hooks not properly imported in useWordPress.js');
                return false;
            }

            return true;
        } catch (err) {
            error(`Error checking WordPress imports: ${err.message}`);
            return false;
        }
    }

    // Check VPS deployment configuration
    checkVPSConfiguration() {
        try {
            const dockerCompose = fs.readFileSync('vps-wordpress/docker-compose.yml', 'utf8');
            const deployScript = fs.readFileSync('vps-wordpress/deploy.sh', 'utf8');

            // Check Docker Compose services
            const requiredServices = ['db', 'redis', 'wordpress', 'nginx'];
            const hasAllServices = requiredServices.every(service =>
                dockerCompose.includes(`${service}:`)
            );

            if (!hasAllServices) {
                error('Docker Compose missing required services');
                return false;
            }

            // Check deploy script permissions
            const stats = fs.statSync('vps-wordpress/deploy.sh');
            if (!(stats.mode & parseInt('100', 8))) {
                warning('Deploy script is not executable (run: chmod +x vps-wordpress/deploy.sh)');
                return 'warning';
            }

            return true;
        } catch (err) {
            error(`Error checking VPS configuration: ${err.message}`);
            return false;
        }
    }

    // Check API endpoints
    checkAPIEndpoints() {
        const requiredEndpoints = [
            'api/wordpress-webhook.js',
            'api/revalidate.js'
        ];

        return requiredEndpoints.every(endpoint => {
            if (fs.existsSync(endpoint)) {
                const content = fs.readFileSync(endpoint, 'utf8');

                // Check for proper error handling
                if (!content.includes('try') || !content.includes('catch')) {
                    warning(`${endpoint} may be missing error handling`);
                    return 'warning';
                }

                return true;
            } else {
                error(`Missing API endpoint: ${endpoint}`);
                return false;
            }
        });
    }

    // Check package.json dependencies
    checkDependencies() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

            const requiredDeps = [
                'graphql-request',
                '@supabase/supabase-js',
                'next'
            ];

            const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);

            if (missingDeps.length > 0) {
                error(`Missing dependencies: ${missingDeps.join(', ')}`);
                return false;
            }

            return true;
        } catch (err) {
            error(`Error checking dependencies: ${err.message}`);
            return false;
        }
    }

    // Generate integration report
    generateReport() {
        log('\n' + '='.repeat(60), 'bold');
        log('WordPress Headless CMS Integration Report', 'bold');
        log('='.repeat(60), 'bold');

        log(`\nTotal Checks: ${this.results.total}`);
        success(`Passed: ${this.results.passed}`);
        if (this.results.warnings > 0) {
            warning(`Warnings: ${this.results.warnings}`);
        }
        if (this.results.failed > 0) {
            error(`Failed: ${this.results.failed}`);
        }

        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        log(`\nSuccess Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');

        if (this.results.failed === 0 && this.results.warnings === 0) {
            success('\n🎉 WordPress integration is fully configured and ready!');
            info('\nNext steps:');
            info('1. Deploy VPS using: cd vps-wordpress && ./deploy.sh');
            info('2. Complete WordPress setup at https://cms.saraivavision.com.br');
            info('3. Configure Vercel environment variables');
            info('4. Set up WordPress webhooks');
        } else if (this.results.failed === 0) {
            warning('\n⚠️  WordPress integration has minor issues that should be addressed');
        } else {
            error('\n❌ WordPress integration has critical issues that must be fixed');
        }
    }

    // Run all verification checks
    async runAllChecks() {
        log('Starting WordPress Headless CMS Integration Verification...\n', 'bold');

        await this.runCheck('Required files exist', () => this.checkRequiredFiles());
        await this.runCheck('Environment variables configured', () => this.checkEnvironmentVariables());
        await this.runCheck('WordPress GraphQL endpoint accessible', () => this.checkWordPressEndpoint());
        await this.runCheck('Supabase connection working', () => this.checkSupabaseConnection());
        await this.runCheck('WordPress imports correct', () => this.checkWordPressImports());
        await this.runCheck('VPS configuration valid', () => this.checkVPSConfiguration());
        await this.runCheck('API endpoints exist', () => this.checkAPIEndpoints());
        await this.runCheck('Required dependencies installed', () => this.checkDependencies());

        this.generateReport();
    }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const verifier = new WordPressIntegrationVerifier();
    verifier.runAllChecks().catch(console.error);
}

export default WordPressIntegrationVerifier;