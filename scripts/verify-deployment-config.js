#!/usr/bin/env node

/**
 * Deployment Configuration Verification Script
 * 
 * This script verifies that all deployment configuration is correct
 * before attempting to deploy to Vercel.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Required files for deployment
const REQUIRED_FILES = [
    'vercel.json',
    '.env.example',
    '.env.production',
    '.env.preview',
    'api/contact/index.js',
    'api/contact/emailService.js',
    'api/contact/rateLimiter.js',
    'api/contact/utils.js',
    'api/health.js',
    'package.json'
];

// Required environment variables
const REQUIRED_ENV_VARS = [
    'RESEND_API_KEY',
    'DOCTOR_EMAIL',
    'NODE_ENV',
    'VITE_API_URL',
    'RATE_LIMIT_WINDOW',
    'RATE_LIMIT_MAX'
];

// Optional environment variables
const OPTIONAL_ENV_VARS = [
    'RECAPTCHA_SECRET_KEY',
    'CONTACT_EMAIL_FROM'
];

/**
 * Check if all required files exist
 */
function checkRequiredFiles() {
    console.log('📁 Checking required files...');

    const missingFiles = [];

    for (const file of REQUIRED_FILES) {
        if (!existsSync(file)) {
            missingFiles.push(file);
        } else {
            console.log(`✅ ${file}`);
        }
    }

    if (missingFiles.length > 0) {
        console.log('\n❌ Missing required files:');
        missingFiles.forEach(file => console.log(`   - ${file}`));
        return false;
    }

    console.log('✅ All required files present\n');
    return true;
}

/**
 * Validate vercel.json configuration
 */
function validateVercelConfig() {
    console.log('⚙️  Validating vercel.json configuration...');

    try {
        const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

        // Check required sections
        const requiredSections = ['functions', 'env'];
        const missingSections = requiredSections.filter(section => !vercelConfig[section]);

        if (missingSections.length > 0) {
            console.log('❌ Missing sections in vercel.json:', missingSections);
            return false;
        }

        // Check function configuration
        if (!vercelConfig.functions['api/contact/index.js']) {
            console.log('❌ Missing contact API function configuration');
            return false;
        }

        // Check environment variable references
        const envVars = vercelConfig.env;
        const missingEnvRefs = REQUIRED_ENV_VARS.filter(varName => !envVars[varName]);

        if (missingEnvRefs.length > 0) {
            console.log('❌ Missing environment variable references:', missingEnvRefs);
            return false;
        }

        console.log('✅ vercel.json configuration is valid');
        return true;

    } catch (error) {
        console.log('❌ Invalid vercel.json:', error.message);
        return false;
    }
}

/**
 * Validate package.json scripts
 */
function validatePackageScripts() {
    console.log('📦 Validating package.json scripts...');

    try {
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

        const requiredScripts = [
            'build',
            'deploy:setup',
            'deploy:test',
            'test:contact'
        ];

        const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

        if (missingScripts.length > 0) {
            console.log('❌ Missing package.json scripts:', missingScripts);
            return false;
        }

        console.log('✅ Package.json scripts are configured');
        return true;

    } catch (error) {
        console.log('❌ Invalid package.json:', error.message);
        return false;
    }
}

/**
 * Check API endpoint structure
 */
function validateApiStructure() {
    console.log('🔌 Validating API endpoint structure...');

    try {
        // Check contact API exports
        const contactApiContent = readFileSync('api/contact/index.js', 'utf8');

        if (!contactApiContent.includes('export default')) {
            console.log('❌ Contact API missing default export');
            return false;
        }

        // Check email service exports
        const emailServiceContent = readFileSync('api/contact/emailService.js', 'utf8');

        if (!emailServiceContent.includes('sendContactEmail')) {
            console.log('❌ Email service missing sendContactEmail function');
            return false;
        }

        // Check health endpoint
        const healthContent = readFileSync('api/health.js', 'utf8');

        if (!healthContent.includes('export default')) {
            console.log('❌ Health endpoint missing default export');
            return false;
        }

        console.log('✅ API endpoint structure is valid');
        return true;

    } catch (error) {
        console.log('❌ API structure validation failed:', error.message);
        return false;
    }
}

/**
 * Validate environment configuration files
 */
function validateEnvironmentFiles() {
    console.log('🌍 Validating environment configuration files...');

    const envFiles = ['.env.example', '.env.production', '.env.preview'];

    for (const envFile of envFiles) {
        try {
            const content = readFileSync(envFile, 'utf8');

            // Check if required variables are mentioned
            const missingVars = REQUIRED_ENV_VARS.filter(varName =>
                !content.includes(varName)
            );

            if (missingVars.length > 0) {
                console.log(`❌ ${envFile} missing variables:`, missingVars);
                return false;
            }

            console.log(`✅ ${envFile} is configured`);

        } catch (error) {
            console.log(`❌ Failed to read ${envFile}:`, error.message);
            return false;
        }
    }

    return true;
}

/**
 * Check deployment scripts
 */
function validateDeploymentScripts() {
    console.log('🚀 Validating deployment scripts...');

    const scripts = [
        'scripts/vercel-env-setup.js',
        'scripts/test-deployment.js'
    ];

    for (const script of scripts) {
        if (!existsSync(script)) {
            console.log(`❌ Missing deployment script: ${script}`);
            return false;
        }

        console.log(`✅ ${script}`);
    }

    return true;
}

/**
 * Generate deployment readiness report
 */
function generateReport(checks) {
    console.log('\n📊 Deployment Readiness Report');
    console.log('================================');

    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;

    console.log(`✅ Passed: ${passedChecks}/${totalChecks} checks`);

    if (passedChecks === totalChecks) {
        console.log('\n🎉 Configuration is ready for deployment!');
        console.log('\nNext steps:');
        console.log('1. Run: npm run deploy:setup');
        console.log('2. Set sensitive environment variables');
        console.log('3. Run: vercel --prod');
        console.log('4. Run: npm run deploy:test');
        return true;
    } else {
        console.log('\n⚠️  Configuration issues found. Please fix the above errors before deploying.');

        console.log('\nFailed checks:');
        Object.entries(checks).forEach(([check, passed]) => {
            if (!passed) {
                console.log(`   ❌ ${check}`);
            }
        });

        return false;
    }
}

/**
 * Main verification function
 */
function main() {
    console.log('🔍 Verifying Deployment Configuration\n');

    const checks = {
        'Required Files': checkRequiredFiles(),
        'Vercel Configuration': validateVercelConfig(),
        'Package Scripts': validatePackageScripts(),
        'API Structure': validateApiStructure(),
        'Environment Files': validateEnvironmentFiles(),
        'Deployment Scripts': validateDeploymentScripts()
    };

    const isReady = generateReport(checks);

    process.exit(isReady ? 0 : 1);
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main as verifyDeploymentConfig };