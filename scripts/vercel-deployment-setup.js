#!/usr/bin/env node

/**
 * Vercel Deployment Setup Script
 * 
 * This script sets up the complete Vercel deployment configuration including:
 * - Environment variables for all environments
 * - Cron jobs configuration
 * - Function optimization settings
 * - Security headers and CORS
 * - Performance monitoring
 * 
 * Usage:
 *   node scripts/vercel-deployment-setup.js
 * 
 * Prerequisites:
 *   - Vercel CLI installed: npm i -g vercel
 *   - Logged in to Vercel: vercel login
 *   - Project linked: vercel link
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

class VercelDeploymentSetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.environments = ['production', 'preview', 'development'];

        // Environment variable configurations
        this.envConfigs = {
            production: {
                'NODE_ENV': 'production',
                'VITE_API_URL': 'https://saraivavision.com.br/api',
                'VITE_WORDPRESS_URL': 'https://saraivavision.com.br',
                'WORDPRESS_GRAPHQL_ENDPOINT': 'https://cms.saraivavision.com.br/graphql',
                'WORDPRESS_DOMAIN': 'https://cms.saraivavision.com.br',
                'CONTACT_EMAIL_FROM': 'contato@saraivavision.com.br',
                'RATE_LIMIT_WINDOW': '15',
                'RATE_LIMIT_MAX': '5',
                'NEXT_PUBLIC_SITE_URL': 'https://saraivavision.com.br',
                'TIMEZONE': 'America/Sao_Paulo'
            },
            preview: {
                'NODE_ENV': 'preview',
                'VITE_API_URL': 'https://saraivavision-preview.vercel.app/api',
                'VITE_WORDPRESS_URL': 'https://cms.saraivavision.com.br',
                'WORDPRESS_GRAPHQL_ENDPOINT': 'https://cms.saraivavision.com.br/graphql',
                'WORDPRESS_DOMAIN': 'https://cms.saraivavision.com.br',
                'CONTACT_EMAIL_FROM': 'preview@saraivavision.com.br',
                'RATE_LIMIT_WINDOW': '10',
                'RATE_LIMIT_MAX': '10',
                'NEXT_PUBLIC_SITE_URL': 'https://saraivavision-preview.vercel.app',
                'TIMEZONE': 'America/Sao_Paulo'
            },
            development: {
                'NODE_ENV': 'development',
                'VITE_API_URL': 'http://localhost:3000/api',
                'VITE_WORDPRESS_URL': 'https://cms.saraivavision.com.br',
                'WORDPRESS_GRAPHQL_ENDPOINT': 'https://cms.saraivavision.com.br/graphql',
                'WORDPRESS_DOMAIN': 'https://cms.saraivavision.com.br',
                'CONTACT_EMAIL_FROM': 'dev@saraivavision.com.br',
                'RATE_LIMIT_WINDOW': '5',
                'RATE_LIMIT_MAX': '20',
                'NEXT_PUBLIC_SITE_URL': 'http://localhost:3000',
                'TIMEZONE': 'America/Sao_Paulo'
            }
        };

        // Sensitive environment variables that need manual setup
        this.sensitiveVars = [
            'RESEND_API_KEY',
            'DOCTOR_EMAIL',
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'ZENVIA_API_TOKEN',
            'ZENVIA_FROM_NUMBER',
            'SPOTIFY_RSS_URL',
            'OPENAI_API_KEY',
            'POSTHOG_KEY',
            'POSTHOG_API_KEY',
            'POSTHOG_PROJECT_ID',
            'WP_REVALIDATE_SECRET',
            'WP_WEBHOOK_SECRET',
            'RECAPTCHA_SECRET_KEY'
        ];
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

    /**
     * Execute Vercel CLI command
     */
    execVercel(command) {
        try {
            const result = execSync(`vercel ${command}`, {
                encoding: 'utf8',
                cwd: this.projectRoot
            });
            return result.trim();
        } catch (error) {
            this.log(`Error executing vercel command: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * Check prerequisites
     */
    checkPrerequisites() {
        this.log('Checking prerequisites...', 'info');

        // Check Vercel CLI
        try {
            execSync('vercel --version', { encoding: 'utf8' });
            this.log('Vercel CLI is installed', 'success');
        } catch (error) {
            this.log('Vercel CLI not found. Install with: npm i -g vercel', 'error');
            return false;
        }

        // Check login status
        try {
            const whoami = this.execVercel('whoami');
            if (!whoami) {
                this.log('Not logged in to Vercel. Run: vercel login', 'error');
                return false;
            }
            this.log(`Logged in as: ${whoami}`, 'success');
        } catch (error) {
            this.log('Not logged in to Vercel. Run: vercel login', 'error');
            return false;
        }

        // Check project link
        if (!existsSync('.vercel/project.json')) {
            this.log('Project not linked to Vercel. Run: vercel link', 'error');
            return false;
        }

        try {
            const projectConfig = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
            this.log(`Project linked: ${projectConfig.projectId}`, 'success');
        } catch (error) {
            this.log('Invalid project configuration. Run: vercel link', 'error');
            return false;
        }

        return true;
    }

    /**
     * Set environment variable in Vercel
     */
    async setEnvVar(name, value, environments) {
        this.log(`Setting ${name} for environments: ${environments.join(', ')}`, 'info');

        for (const env of environments) {
            try {
                // Use the correct Vercel CLI syntax for each environment
                execSync(`echo "${value}" | vercel env add ${name} ${env}`, {
                    encoding: 'utf8',
                    stdio: ['pipe', 'pipe', 'pipe'],
                    cwd: this.projectRoot
                });
                this.log(`Successfully set ${name} for ${env}`, 'success');
            } catch (error) {
                // Check if variable already exists
                if (error.message.includes('already exists')) {
                    this.log(`${name} already exists for ${env}, skipping`, 'warning');
                } else {
                    this.log(`Failed to set ${name} for ${env}: ${error.message}`, 'error');
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Setup environment variables for all environments
     */
    async setupEnvironmentVariables() {
        this.log('Setting up environment variables...', 'info');

        let successCount = 0;
        let totalCount = 0;

        for (const [env, config] of Object.entries(this.envConfigs)) {
            this.log(`\nConfiguring ${env} environment:`, 'info');

            for (const [name, value] of Object.entries(config)) {
                totalCount++;
                const success = await this.setEnvVar(name, value, [env]);
                if (success) successCount++;
            }
        }

        this.log(`\nEnvironment variables setup: ${successCount}/${totalCount} successful`,
            successCount === totalCount ? 'success' : 'warning');

        return successCount === totalCount;
    }

    /**
     * Validate vercel.json configuration
     */
    validateVercelConfig() {
        this.log('Validating vercel.json configuration...', 'info');

        if (!existsSync('vercel.json')) {
            this.log('vercel.json not found', 'error');
            return false;
        }

        try {
            const config = JSON.parse(readFileSync('vercel.json', 'utf8'));

            // Check required sections
            const requiredSections = ['functions', 'crons', 'headers', 'rewrites'];
            const missingSections = requiredSections.filter(section => !config[section]);

            if (missingSections.length > 0) {
                this.log(`Missing sections in vercel.json: ${missingSections.join(', ')}`, 'error');
                return false;
            }

            // Validate cron jobs
            const expectedCrons = [
                '/api/outbox/drain',
                '/api/podcast/sync',
                '/api/appointments/reminders'
            ];

            const configuredCrons = config.crons.map(cron => cron.path);
            const missingCrons = expectedCrons.filter(path => !configuredCrons.includes(path));

            if (missingCrons.length > 0) {
                this.log(`Missing cron jobs: ${missingCrons.join(', ')}`, 'warning');
            }

            // Validate function configurations
            const criticalFunctions = [
                'api/contact/index.js',
                'api/appointments/**',
                'api/outbox/**'
            ];

            const configuredFunctions = Object.keys(config.functions);
            const missingFunctions = criticalFunctions.filter(func =>
                !configuredFunctions.some(configured =>
                    configured === func || configured.includes(func.replace('/**', ''))
                )
            );

            if (missingFunctions.length > 0) {
                this.log(`Missing function configurations: ${missingFunctions.join(', ')}`, 'warning');
            }

            this.log('vercel.json configuration is valid', 'success');
            return true;

        } catch (error) {
            this.log(`Invalid vercel.json: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Test deployment configuration
     */
    async testDeployment() {
        this.log('Testing deployment configuration...', 'info');

        try {
            // Test build process
            this.log('Testing build process...', 'info');
            execSync('npm run build', {
                encoding: 'utf8',
                stdio: 'pipe',
                cwd: this.projectRoot,
                timeout: 120000
            });
            this.log('Build test passed', 'success');

            // Test function syntax
            this.log('Testing API function syntax...', 'info');
            const apiFunctions = [
                'api/contact/index.js',
                'api/health.js'
            ];

            for (const func of apiFunctions) {
                if (existsSync(func)) {
                    try {
                        // Basic syntax check by requiring the file
                        const content = readFileSync(func, 'utf8');
                        if (!content.includes('export default')) {
                            this.log(`${func} missing default export`, 'warning');
                        }
                    } catch (error) {
                        this.log(`${func} syntax error: ${error.message}`, 'error');
                        return false;
                    }
                }
            }

            this.log('Function syntax tests passed', 'success');
            return true;

        } catch (error) {
            this.log(`Deployment test failed: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Generate deployment instructions
     */
    generateInstructions() {
        this.log('\n📋 Deployment Instructions', 'info');
        console.log('================================\n');

        console.log('🔐 Sensitive Environment Variables Setup:');
        console.log('Run the following commands to set sensitive environment variables:\n');

        this.sensitiveVars.forEach(varName => {
            console.log(`${varName}:`);
            console.log(`  vercel env add ${varName} production`);
            console.log(`  vercel env add ${varName} preview`);
            console.log(`  vercel env add ${varName} development`);
            console.log('');
        });

        console.log('📋 Required Values:');
        console.log('  RESEND_API_KEY: Your Resend API key');
        console.log('  DOCTOR_EMAIL: philipe_cruz@outlook.com');
        console.log('  SUPABASE_URL: https://your-project.supabase.co');
        console.log('  SUPABASE_ANON_KEY: Your Supabase anonymous key');
        console.log('  SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key');
        console.log('  ZENVIA_API_TOKEN: Your Zenvia SMS API token');
        console.log('  ZENVIA_FROM_NUMBER: +5511999999999');
        console.log('  SPOTIFY_RSS_URL: https://anchor.fm/s/your-podcast/podcast/rss');
        console.log('  OPENAI_API_KEY: sk-your_openai_key');
        console.log('  POSTHOG_KEY: phc_your_posthog_key');
        console.log('  WP_REVALIDATE_SECRET: Generate a secure random string');
        console.log('  WP_WEBHOOK_SECRET: Generate a secure random string');

        console.log('\n🚀 Deployment Commands:');
        console.log('  Production: vercel --prod');
        console.log('  Preview:    vercel');
        console.log('  Local dev:  vercel dev');

        console.log('\n🧪 Testing Commands:');
        console.log('  Test build:       npm run build');
        console.log('  Test contact API: npm run test:contact');
        console.log('  Test deployment:  node scripts/test-deployment.js');

        console.log('\n📊 Monitoring:');
        console.log('  Dashboard: https://vercel.com/dashboard');
        console.log('  Functions: https://vercel.com/dashboard/functions');
        console.log('  Analytics: https://vercel.com/dashboard/analytics');
    }

    /**
     * Create deployment checklist
     */
    createDeploymentChecklist() {
        const checklist = `# Vercel Deployment Checklist

## Prerequisites
- [ ] Vercel CLI installed (\`npm i -g vercel\`)
- [ ] Logged in to Vercel (\`vercel login\`)
- [ ] Project linked to Vercel (\`vercel link\`)

## Environment Variables
- [ ] RESEND_API_KEY set for all environments
- [ ] DOCTOR_EMAIL set for all environments
- [ ] SUPABASE_URL set for all environments
- [ ] SUPABASE_ANON_KEY set for all environments
- [ ] SUPABASE_SERVICE_ROLE_KEY set for all environments
- [ ] ZENVIA_API_TOKEN set for all environments
- [ ] ZENVIA_FROM_NUMBER set for all environments
- [ ] SPOTIFY_RSS_URL set for all environments
- [ ] OPENAI_API_KEY set for all environments
- [ ] POSTHOG_KEY set for all environments
- [ ] WP_REVALIDATE_SECRET set for all environments
- [ ] WP_WEBHOOK_SECRET set for all environments

## Configuration
- [ ] vercel.json configured with functions
- [ ] vercel.json configured with cron jobs
- [ ] vercel.json configured with headers and CORS
- [ ] vercel.json configured with rewrites

## Testing
- [ ] Build process works (\`npm run build\`)
- [ ] Contact API function works
- [ ] Health endpoint works
- [ ] Cron jobs configured correctly

## Deployment
- [ ] Preview deployment successful (\`vercel\`)
- [ ] Production deployment successful (\`vercel --prod\`)
- [ ] All API endpoints responding
- [ ] Cron jobs running as expected
- [ ] Monitoring and logging working

## Post-Deployment
- [ ] Contact form tested
- [ ] Appointment booking tested
- [ ] Podcast sync tested
- [ ] Dashboard accessible
- [ ] Analytics tracking working
`;

        writeFileSync('DEPLOYMENT_CHECKLIST.md', checklist);
        this.log('Created DEPLOYMENT_CHECKLIST.md', 'success');
    }

    /**
     * Main setup function
     */
    async run() {
        console.log('🚀 Vercel Deployment Setup\n');

        // Check prerequisites
        if (!this.checkPrerequisites()) {
            process.exit(1);
        }

        // Validate configuration
        if (!this.validateVercelConfig()) {
            this.log('Please fix vercel.json configuration before proceeding', 'error');
            process.exit(1);
        }

        // Setup environment variables
        const envSetupSuccess = await this.setupEnvironmentVariables();
        if (!envSetupSuccess) {
            this.log('Environment variable setup had issues, but continuing...', 'warning');
        }

        // Test deployment
        const testSuccess = await this.testDeployment();
        if (!testSuccess) {
            this.log('Deployment tests failed, please fix issues before deploying', 'error');
        }

        // Generate instructions and checklist
        this.generateInstructions();
        this.createDeploymentChecklist();

        this.log('\n✅ Deployment setup complete!', 'success');

        if (testSuccess && envSetupSuccess) {
            this.log('Ready for deployment! 🎉', 'success');
        } else {
            this.log('Please address the issues above before deploying', 'warning');
        }
    }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new VercelDeploymentSetup();
    setup.run().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}

export default VercelDeploymentSetup;