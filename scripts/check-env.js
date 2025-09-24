#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks for placeholder values and validates environment configuration
 */

import fs from 'fs';
import path from 'path';

// Required VITE_ environment variables
const REQUIRED_VITE_VARS = [
    'VITE_API_BASE_URL',
    'VITE_WORDPRESS_API_URL',
    'VITE_WORDPRESS_GRAPHQL_ENDPOINT',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_MAPS_API_KEY',
    'VITE_GOOGLE_PLACE_ID',
    'VITE_RECAPTCHA_SITE_KEY',
    'VITE_PUBLIC_POSTHOG_KEY',
    'VITE_PUBLIC_POSTHOG_HOST',
    'VITE_SPOTIFY_SHOW_ID'
];

// Optional VITE_ environment variables
const OPTIONAL_VITE_VARS = [
    'VITE_VERCEL_ENV',
    'VITE_VERCEL_URL',
    'VITE_VERCEL_BRANCH_URL',
    'VITE_SENTRY_DSN',
    'VITE_HYPERTUNE_TOKEN',
    'VITE_EXPERIMENTATION_CONFIG',
    'VITE_EXPERIMENTATION_CONFIG_ITEM_KEY',
    'VITE_INSTAGRAM_ACCESS_TOKEN',
    'VITE_INSTAGRAM_USER_ID',
    'VITE_ENCRYPTION_KEY'
];

// Placeholder patterns to detect
const PLACEHOLDER_PATTERNS = [
    'template-blog-webapp-nextjs.git',
    'contentful',
    'your-api-key-here',
    'your-domain-here',
    'localhost:3000',
    'example.com',
    'placeholder',
    'change-me',
    'replace-me'
];

/**
 * Check if a value is a placeholder
 */
function isPlaceholder(value) {
    if (!value) return true;

    return PLACEHOLDER_PATTERNS.some(pattern =>
        value.toLowerCase().includes(pattern.toLowerCase())
    );
}

/**
 * Validate URL format
 */
function isValidUrl(value, allowLocalhost = false) {
    try {
        const url = new URL(value);
        if (!allowLocalhost && url.hostname === 'localhost') {
            return false;
        }
        return url.protocol === 'https:' || (allowLocalhost && url.protocol === 'http:');
    } catch {
        return false;
    }
}

/**
 * Validate API key format
 */
function isValidApiKey(value, minLength = 10) {
    return value && value.length >= minLength && !isPlaceholder(value);
}

/**
 * Load environment variables from .env file
 */
function loadEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    const envVars = {};

    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        }
    }

    return envVars;
}

/**
 * Main validation function
 */
function validateEnvironment() {
    console.log('🔍 Environment Variables Validation');
    console.log('=====================================\n');

    const envVars = { ...process.env, ...loadEnvFile() };
    const errors = [];
    const warnings = [];

    // Check required variables
    console.log('📋 Required Variables:');
    for (const varName of REQUIRED_VITE_VARS) {
        const value = envVars[varName];

        if (!value) {
            errors.push(`❌ ${varName}: Missing`);
            console.log(`  ❌ ${varName}: Missing`);
        } else if (isPlaceholder(value)) {
            errors.push(`❌ ${varName}: Contains placeholder value`);
            console.log(`  ❌ ${varName}: Contains placeholder value`);
        } else {
            // Specific validations
            if (varName.includes('URL') || varName.includes('HOST')) {
                if (!isValidUrl(value, varName.includes('API_BASE_URL'))) {
                    errors.push(`❌ ${varName}: Invalid URL format`);
                    console.log(`  ❌ ${varName}: Invalid URL format`);
                } else {
                    console.log(`  ✅ ${varName}: Valid`);
                }
            } else if (varName.includes('KEY') || varName.includes('TOKEN')) {
                if (!isValidApiKey(value, 10)) {
                    errors.push(`❌ ${varName}: Invalid key format`);
                    console.log(`  ❌ ${varName}: Invalid key format`);
                } else {
                    console.log(`  ✅ ${varName}: Valid`);
                }
            } else {
                console.log(`  ✅ ${varName}: Present`);
            }
        }
    }

    // Check optional variables
    console.log('\n📋 Optional Variables:');
    for (const varName of OPTIONAL_VITE_VARS) {
        const value = envVars[varName];

        if (!value) {
            console.log(`  ⚪ ${varName}: Not set`);
        } else if (isPlaceholder(value)) {
            warnings.push(`⚠️ ${varName}: Contains placeholder value`);
            console.log(`  ⚠️ ${varName}: Contains placeholder value`);
        } else {
            console.log(`  ✅ ${varName}: Present`);
        }
    }

    // Check for suspicious values
    console.log('\n🔍 Scanning for Placeholder Patterns:');
    let foundPlaceholders = false;

    for (const [key, value] of Object.entries(envVars)) {
        if (key.startsWith('VITE_') && value) {
            for (const pattern of PLACEHOLDER_PATTERNS) {
                if (value.toLowerCase().includes(pattern.toLowerCase())) {
                    errors.push(`❌ ${key}: Contains suspicious pattern "${pattern}"`);
                    console.log(`  ❌ ${key}: Contains suspicious pattern "${pattern}"`);
                    foundPlaceholders = true;
                }
            }
        }
    }

    if (!foundPlaceholders) {
        console.log('  ✅ No placeholder patterns detected');
    }

    // Summary
    console.log('\n📊 Validation Summary:');
    console.log('======================');

    if (errors.length === 0) {
        console.log('✅ All validations passed!');
        return true;
    } else {
        console.log(`❌ ${errors.length} error(s) found:`);
        errors.forEach(error => console.log(`  ${error}`));

        if (warnings.length > 0) {
            console.log(`\n⚠️ ${warnings.length} warning(s):`);
            warnings.forEach(warning => console.log(`  ${warning}`));
        }

        console.log('\n💡 Next Steps:');
        console.log('1. Check your .env file for placeholder values');
        console.log('2. Verify Vercel environment variables in Project Settings');
        console.log('3. Ensure all URLs use HTTPS (except localhost in development)');
        console.log('4. Validate API keys are properly formatted');

        return false;
    }
}

/**
 * Generate .env.example file
 */
function generateEnvExample() {
    const exampleContent = `# Environment Variables for Saraiva Vision Site
# Copy this file to .env and fill in the actual values

# Core API URLs
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WORDPRESS_API_URL=https://cms.saraivavision.com.br
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
VITE_GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key-here

# Analytics & Tracking
VITE_PUBLIC_POSTHOG_KEY=your-posthog-key-here
VITE_PUBLIC_POSTHOG_HOST=https://analytics.saraivavision.com.br
VITE_SENTRY_DSN=your-sentry-dsn-here

# Social Media
VITE_SPOTIFY_SHOW_ID=6sHIG7HbhF1w5O63CTtxwV
VITE_INSTAGRAM_ACCESS_TOKEN=your-instagram-token-here
VITE_INSTAGRAM_USER_ID=your-instagram-user-id-here

# Vercel Environment (auto-populated)
VITE_VERCEL_ENV=development
VITE_VERCEL_URL=your-vercel-url.vercel.app
VITE_VERCEL_BRANCH_URL=your-branch-url.vercel.app

# Feature Flags (optional)
VITE_HYPERTUNE_TOKEN=your-hypertune-token-here
VITE_EXPERIMENTATION_CONFIG=your-edge-config-id-here
VITE_EXPERIMENTATION_CONFIG_ITEM_KEY=your-config-item-key-here

# Security (optional)
VITE_ENCRYPTION_KEY=your-encryption-key-here
`;

    fs.writeFileSync('.env.example', exampleContent);
    console.log('📄 Generated .env.example file');
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);

    if (args.includes('--generate-example')) {
        generateEnvExample();
    } else {
        const isValid = validateEnvironment();
        process.exit(isValid ? 0 : 1);
    }
}