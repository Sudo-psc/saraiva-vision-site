#!/usr/bin/env node

/**
 * Vercel Environment Variables Setup Script
 * 
 * This script helps configure environment variables for different Vercel environments.
 * Run this script to set up environment variables for production, preview, and development.
 * 
 * Usage:
 *   node scripts/vercel-env-setup.js
 * 
 * Prerequisites:
 *   - Vercel CLI installed: npm i -g vercel
 *   - Logged in to Vercel: vercel login
 *   - Project linked: vercel link
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Environment variable configurations
const ENV_CONFIGS = {
    production: {
        'NODE_ENV': 'production',
        'VITE_API_URL': 'https://saraivavision.com.br/api',
        'VITE_WORDPRESS_URL': 'https://saraivavision.com.br',
        'CONTACT_EMAIL_FROM': 'contato@saraivavision.com.br',
        'RATE_LIMIT_WINDOW': '15',
        'RATE_LIMIT_MAX': '5'
    },
    preview: {
        'NODE_ENV': 'preview',
        'VITE_API_URL': 'https://saraivavision-preview.vercel.app/api',
        'VITE_WORDPRESS_URL': 'https://saraivavision.com.br',
        'CONTACT_EMAIL_FROM': 'preview@saraivavision.com.br',
        'RATE_LIMIT_WINDOW': '10',
        'RATE_LIMIT_MAX': '10'
    },
    development: {
        'NODE_ENV': 'development',
        'VITE_API_URL': 'http://localhost:3000/api',
        'VITE_WORDPRESS_URL': 'https://saraivavision.com.br',
        'CONTACT_EMAIL_FROM': 'dev@saraivavision.com.br',
        'RATE_LIMIT_WINDOW': '5',
        'RATE_LIMIT_MAX': '20'
    }
};

// Sensitive environment variables that need to be set manually
const SENSITIVE_VARS = [
    'RESEND_API_KEY',
    'DOCTOR_EMAIL',
    'RECAPTCHA_SECRET_KEY'
];

/**
 * Execute Vercel CLI command
 */
function execVercel(command) {
    try {
        const result = execSync(`vercel ${command}`, { encoding: 'utf8' });
        return result.trim();
    } catch (error) {
        console.error(`Error executing vercel command: ${error.message}`);
        return null;
    }
}

/**
 * Set environment variable in Vercel
 */
function setEnvVar(name, value, environments) {
    console.log(`Setting ${name} for environments: ${environments.join(', ')}`);

    // Build arguments array for spawn
    const args = ['env', 'add', name];
    environments.forEach(env => {
        args.push('--environment', env);
    });

    try {
        // Spawn vercel process
        const vercelProcess = spawn('vercel', args, {
            stdio: ['pipe', 'inherit', 'inherit'] // pipe stdin, inherit stdout/stderr
        });

        // Write the value to stdin
        vercelProcess.stdin.write(value);
        vercelProcess.stdin.end();

        // Handle process completion
        return new Promise((resolve, reject) => {
            vercelProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Successfully set ${name}`);
                    resolve();
                } else {
                    reject(new Error(`Vercel CLI exited with code ${code}`));
                }
            });

            vercelProcess.on('error', (error) => {
                reject(new Error(`Failed to spawn vercel process: ${error.message}`));
            });
        });
    } catch (error) {
        console.error(`❌ Failed to set ${name}: ${error.message}`);
        throw error;
    }
}

/**
 * Check if Vercel CLI is available and user is logged in
 */
function checkVercelSetup() {
    try {
        execSync('vercel --version', { encoding: 'utf8' });
    } catch (error) {
        console.error('❌ Vercel CLI not found. Please install it with: npm i -g vercel');
        process.exit(1);
    }

    try {
        const whoami = execVercel('whoami');
        if (!whoami) {
            console.error('❌ Not logged in to Vercel. Please run: vercel login');
            process.exit(1);
        }
        console.log(`✅ Logged in to Vercel as: ${whoami}`);
    } catch (error) {
        console.error('❌ Not logged in to Vercel. Please run: vercel login');
        process.exit(1);
    }
}

/**
 * Check if project is linked to Vercel
 */
function checkProjectLink() {
    if (!existsSync('.vercel/project.json')) {
        console.error('❌ Project not linked to Vercel. Please run: vercel link');
        process.exit(1);
    }

    try {
        const projectConfig = JSON.parse(readFileSync('.vercel/project.json', 'utf8'));
        console.log(`✅ Project linked: ${projectConfig.projectId}`);
    } catch (error) {
        console.error('❌ Invalid project configuration. Please run: vercel link');
        process.exit(1);
    }
}

/**
 * Set up environment variables for all environments
 */
async function setupEnvironmentVariables() {
    console.log('\n🔧 Setting up environment variables...\n');

    // Set non-sensitive environment variables
    for (const [env, config] of Object.entries(ENV_CONFIGS)) {
        console.log(`\n📝 Configuring ${env} environment:`);

        for (const [name, value] of Object.entries(config)) {
            await setEnvVar(name, value, [env]);
        }
    }

    // Instructions for sensitive variables
    console.log('\n🔐 Sensitive Environment Variables Setup Required:');
    console.log('The following environment variables contain sensitive data and must be set manually:\n');

    SENSITIVE_VARS.forEach(varName => {
        console.log(`${varName}:`);
        console.log(`  Production: vercel env add ${varName} production`);
        console.log(`  Preview:    vercel env add ${varName} preview`);
        console.log(`  Development: vercel env add ${varName} development`);
        console.log('');
    });

    console.log('📋 Required values:');
    console.log('  RESEND_API_KEY: Your Resend API key (get from https://resend.com/api-keys)');
    console.log('  DOCTOR_EMAIL: Dr. Philipe\'s email address (philipe_cruz@outlook.com)');
    console.log('  RECAPTCHA_SECRET_KEY: reCAPTCHA secret key (if using reCAPTCHA)');
}

/**
 * Validate current environment variables
 */
function validateEnvironmentVariables() {
    console.log('\n🔍 Validating environment variables...\n');

    try {
        const envList = execVercel('env ls');
        if (envList) {
            console.log('Current environment variables:');
            console.log(envList);
        }
    } catch (error) {
        console.error('Failed to list environment variables:', error.message);
    }
}

/**
 * Main setup function
 */
async function main() {
    console.log('🚀 Vercel Environment Variables Setup\n');

    // Check prerequisites
    checkVercelSetup();
    checkProjectLink();

    // Setup environment variables
    await setupEnvironmentVariables();

    // Validate setup
    validateEnvironmentVariables();

    console.log('\n✅ Environment setup complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Set the sensitive environment variables listed above');
    console.log('2. Run: vercel --prod (for production deployment)');
    console.log('3. Run: vercel (for preview deployment)');
    console.log('4. Test the contact form functionality');
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    });
}

export { setupEnvironmentVariables, validateEnvironmentVariables };