#!/usr/bin/env node

/**
 * Vercel Environment Variables Configuration Script
 * 
 * This script helps configure environment variables for Vercel deployment
 * across production and preview environments.
 * 
 * Usage:
 * - node scripts/vercel-env-config.js --help
 * - node scripts/vercel-env-config.js --validate
 * - node scripts/vercel-env-config.js --generate-template
 */

import fs from 'fs';
import path from 'path';

// Environment variable definitions with validation rules
const ENV_VARIABLES = {
    // WordPress Integration
    WORDPRESS_GRAPHQL_ENDPOINT: {
        required: true,
        description: 'WordPress GraphQL API endpoint',
        example: 'https://cms.saraivavision.com.br/graphql',
        environments: ['production', 'preview']
    },
    WORDPRESS_DOMAIN: {
        required: true,
        description: 'WordPress domain for content fetching',
        example: 'https://cms.saraivavision.com.br',
        environments: ['production', 'preview']
    },
    WP_REVALIDATE_SECRET: {
        required: true,
        description: 'Secret token for WordPress revalidation webhooks',
        example: 'supersecret_revalidate_token_here',
        environments: ['production', 'preview'],
        sensitive: true
    },
    WP_WEBHOOK_SECRET: {
        required: true,
        description: 'Secret token for WordPress webhook validation',
        example: 'supersecret_webhook_token_here',
        environments: ['production', 'preview'],
        sensitive: true
    },

    // Database Configuration
    SUPABASE_URL: {
        required: true,
        description: 'Supabase project URL',
        example: 'https://your-project.supabase.co',
        environments: ['production', 'preview']
    },
    SUPABASE_ANON_KEY: {
        required: true,
        description: 'Supabase anonymous key',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        environments: ['production', 'preview'],
        sensitive: true
    },
    SUPABASE_SERVICE_ROLE_KEY: {
        required: true,
        description: 'Supabase service role key (full access)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        environments: ['production', 'preview'],
        sensitive: true
    },

    // Email & SMS Services
    RESEND_API_KEY: {
        required: true,
        description: 'Resend API key for email delivery',
        example: 're_xxxxxxxxxxxxxxxxxxxxxxxxxx',
        environments: ['production', 'preview'],
        sensitive: true
    },
    DOCTOR_EMAIL: {
        required: true,
        description: 'Doctor email address for notifications',
        example: 'philipe_cruz@outlook.com',
        environments: ['production', 'preview']
    },
    CONTACT_EMAIL_FROM: {
        required: true,
        description: 'From email address for contact form',
        example: 'contato@saraivavision.com.br',
        environments: ['production', 'preview']
    },
    ZENVIA_API_TOKEN: {
        required: true,
        description: 'Zenvia API token for SMS delivery',
        example: 'your_zenvia_api_token_here',
        environments: ['production', 'preview'],
        sensitive: true
    },
    ZENVIA_FROM_NUMBER: {
        required: true,
        description: 'Zenvia sender phone number',
        example: '+5511999999999',
        environments: ['production', 'preview']
    },

    // External Services
    SPOTIFY_RSS_URL: {
        required: true,
        description: 'Spotify podcast RSS feed URL',
        example: 'https://anchor.fm/s/your-podcast/podcast/rss',
        environments: ['production', 'preview']
    },
    OPENAI_API_KEY: {
        required: true,
        description: 'OpenAI API key for chatbot functionality',
        example: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environments: ['production', 'preview'],
        sensitive: true
    },

    // Analytics
    POSTHOG_KEY: {
        required: true,
        description: 'PostHog public key for analytics',
        example: 'phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environments: ['production', 'preview']
    },
    POSTHOG_API_KEY: {
        required: false,
        description: 'PostHog API key for server-side analytics',
        example: 'phx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environments: ['production', 'preview'],
        sensitive: true
    },
    POSTHOG_PROJECT_ID: {
        required: false,
        description: 'PostHog project ID',
        example: '12345',
        environments: ['production', 'preview']
    },

    // System Configuration
    NODE_ENV: {
        required: true,
        description: 'Node.js environment',
        example: 'production',
        environments: ['production', 'preview'],
        defaultValue: {
            production: 'production',
            preview: 'development'
        }
    },
    TIMEZONE: {
        required: true,
        description: 'System timezone',
        example: 'America/Sao_Paulo',
        environments: ['production', 'preview'],
        defaultValue: 'America/Sao_Paulo'
    },
    NEXT_PUBLIC_SITE_URL: {
        required: true,
        description: 'Public site URL',
        example: 'https://saraivavision.com.br',
        environments: ['production', 'preview']
    },

    // Rate Limiting
    RATE_LIMIT_WINDOW: {
        required: false,
        description: 'Rate limit window in minutes',
        example: '15',
        environments: ['production', 'preview'],
        defaultValue: '15'
    },
    RATE_LIMIT_MAX: {
        required: false,
        description: 'Maximum requests per window',
        example: '10',
        environments: ['production', 'preview'],
        defaultValue: {
            production: '5',
            preview: '10'
        }
    },

    // Security (Optional)
    RECAPTCHA_SECRET_KEY: {
        required: false,
        description: 'reCAPTCHA secret key (if using reCAPTCHA)',
        example: '6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        environments: ['production', 'preview'],
        sensitive: true
    }
};

class VercelEnvConfig {
    constructor() {
        this.args = process.argv.slice(2);
    }

    showHelp() {
        console.log(`
Vercel Environment Variables Configuration Script

Usage:
  node scripts/vercel-env-config.js [options]

Options:
  --help                Show this help message
  --validate           Validate current environment variables
  --generate-template  Generate environment template files
  --list-required      List all required environment variables
  --check-secrets      Check for sensitive variables in plain text files

Examples:
  node scripts/vercel-env-config.js --validate
  node scripts/vercel-env-config.js --generate-template
  node scripts/vercel-env-config.js --list-required
    `);
    }

    validateEnvironment() {
        console.log('🔍 Validating environment variables...\n');

        const errors = [];
        const warnings = [];

        // Check .env files
        const envFiles = ['.env', '.env.local', '.env.production', '.env.preview'];
        const foundVars = new Set();

        envFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                const lines = content.split('\n');

                lines.forEach(line => {
                    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
                    if (match) {
                        foundVars.add(match[1]);
                    }
                });
            }
        });

        // Validate required variables
        Object.entries(ENV_VARIABLES).forEach(([key, config]) => {
            if (config.required && !foundVars.has(key) && !process.env[key]) {
                errors.push(`❌ Missing required variable: ${key}`);
                console.log(`   Description: ${config.description}`);
                console.log(`   Example: ${config.example}\n`);
            } else if (foundVars.has(key) || process.env[key]) {
                console.log(`✅ ${key} - configured`);
            }
        });

        // Check for sensitive variables in plain text
        this.checkSensitiveVariables();

        if (errors.length > 0) {
            console.log('\n🚨 Validation Errors:');
            errors.forEach(error => console.log(error));
            console.log('\nPlease configure missing variables in Vercel dashboard or environment files.');
            process.exit(1);
        } else {
            console.log('\n✅ All required environment variables are configured!');
        }

        if (warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            warnings.forEach(warning => console.log(warning));
        }
    }

    checkSensitiveVariables() {
        console.log('\n🔒 Checking for sensitive variables in plain text files...\n');

        const sensitiveVars = Object.entries(ENV_VARIABLES)
            .filter(([key, config]) => config.sensitive)
            .map(([key]) => key);

        const envFiles = ['.env', '.env.local', '.env.production', '.env.preview'];

        envFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');

                sensitiveVars.forEach(varName => {
                    const regex = new RegExp(`^${varName}=(.+)$`, 'm');
                    const match = content.match(regex);

                    if (match && match[1] && !match[1].startsWith('#') && !match[1].startsWith('your_')) {
                        console.log(`⚠️  Sensitive variable ${varName} found in ${file}`);
                        console.log('   Consider moving to Vercel dashboard for security');
                    }
                });
            }
        });
    }

    generateTemplate() {
        console.log('📝 Generating environment template files...\n');

        // Generate .env.example
        this.generateEnvExample();

        // Generate Vercel environment setup guide
        this.generateVercelSetupGuide();

        // Generate environment validation script
        this.generateValidationScript();

        console.log('✅ Template files generated successfully!');
    }

    generateEnvExample() {
        let content = `# Saraiva Vision - Environment Variables Template
# Copy this file to .env.local and fill in your values
# DO NOT commit sensitive values to version control

`;

        const categories = {
            'WordPress Integration': ['WORDPRESS_GRAPHQL_ENDPOINT', 'WORDPRESS_DOMAIN', 'WP_REVALIDATE_SECRET', 'WP_WEBHOOK_SECRET'],
            'Database Configuration': ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
            'Email & SMS Services': ['RESEND_API_KEY', 'DOCTOR_EMAIL', 'CONTACT_EMAIL_FROM', 'ZENVIA_API_TOKEN', 'ZENVIA_FROM_NUMBER'],
            'External Services': ['SPOTIFY_RSS_URL', 'OPENAI_API_KEY'],
            'Analytics': ['POSTHOG_KEY', 'POSTHOG_API_KEY', 'POSTHOG_PROJECT_ID'],
            'System Configuration': ['NODE_ENV', 'TIMEZONE', 'NEXT_PUBLIC_SITE_URL'],
            'Rate Limiting': ['RATE_LIMIT_WINDOW', 'RATE_LIMIT_MAX'],
            'Security (Optional)': ['RECAPTCHA_SECRET_KEY']
        };

        Object.entries(categories).forEach(([category, vars]) => {
            content += `# ${category}\n`;
            vars.forEach(varName => {
                const config = ENV_VARIABLES[varName];
                if (config) {
                    content += `# ${config.description}\n`;
                    if (config.sensitive) {
                        content += `# ${varName}=your_${varName.toLowerCase()}_here\n`;
                    } else {
                        content += `${varName}=${config.example}\n`;
                    }
                    content += '\n';
                }
            });
        });

        fs.writeFileSync('.env.example.new', content);
        console.log('📄 Generated .env.example.new');
    }

    generateVercelSetupGuide() {
        const content = `# Vercel Environment Variables Setup Guide

## Required Environment Variables for Production

### WordPress Integration
\`\`\`bash
vercel env add WORDPRESS_GRAPHQL_ENDPOINT production
# Value: https://cms.saraivavision.com.br/graphql

vercel env add WORDPRESS_DOMAIN production  
# Value: https://cms.saraivavision.com.br

vercel env add WP_REVALIDATE_SECRET production
# Value: [Generate a secure random string]

vercel env add WP_WEBHOOK_SECRET production
# Value: [Generate a secure random string]
\`\`\`

### Database Configuration
\`\`\`bash
vercel env add SUPABASE_URL production
# Value: https://your-project.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Value: [Your Supabase anonymous key]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Value: [Your Supabase service role key]
\`\`\`

### Email & SMS Services
\`\`\`bash
vercel env add RESEND_API_KEY production
# Value: [Your Resend API key]

vercel env add DOCTOR_EMAIL production
# Value: philipe_cruz@outlook.com

vercel env add CONTACT_EMAIL_FROM production
# Value: contato@saraivavision.com.br

vercel env add ZENVIA_API_TOKEN production
# Value: [Your Zenvia API token]

vercel env add ZENVIA_FROM_NUMBER production
# Value: +5511999999999
\`\`\`

### External Services
\`\`\`bash
vercel env add SPOTIFY_RSS_URL production
# Value: [Your Spotify podcast RSS URL]

vercel env add OPENAI_API_KEY production
# Value: [Your OpenAI API key]
\`\`\`

### Analytics
\`\`\`bash
vercel env add POSTHOG_KEY production
# Value: [Your PostHog public key]

vercel env add POSTHOG_API_KEY production
# Value: [Your PostHog API key] (optional)

vercel env add POSTHOG_PROJECT_ID production
# Value: [Your PostHog project ID] (optional)
\`\`\`

### System Configuration
\`\`\`bash
vercel env add NODE_ENV production
# Value: production

vercel env add TIMEZONE production
# Value: America/Sao_Paulo

vercel env add NEXT_PUBLIC_SITE_URL production
# Value: https://saraivavision.com.br

vercel env add RATE_LIMIT_WINDOW production
# Value: 15

vercel env add RATE_LIMIT_MAX production
# Value: 5
\`\`\`

## Preview Environment Setup

For preview deployments, copy the same variables but with preview-specific values:

\`\`\`bash
# Copy production variables to preview
vercel env ls production | grep -E "^[A-Z_]+" | while read var; do
  vercel env add "$var" preview
done
\`\`\`

## Security Best Practices

1. **Never commit sensitive values** to version control
2. **Use different API keys** for production and preview environments
3. **Regularly rotate** API keys and secrets
4. **Monitor usage** of API keys for unusual activity
5. **Use least privilege** principle for service accounts

## Validation

Run the validation script to check your configuration:

\`\`\`bash
node scripts/vercel-env-config.js --validate
\`\`\`
`;

        fs.writeFileSync('docs/VERCEL_ENV_SETUP.md', content);
        console.log('📄 Generated docs/VERCEL_ENV_SETUP.md');
    }

    generateValidationScript() {
        const content = `#!/bin/bash

# Vercel Environment Variables Validation Script
# This script validates that all required environment variables are set in Vercel

echo "🔍 Validating Vercel environment variables..."

# Required variables for production
REQUIRED_VARS=(
  "WORDPRESS_GRAPHQL_ENDPOINT"
  "WORDPRESS_DOMAIN"
  "WP_REVALIDATE_SECRET"
  "WP_WEBHOOK_SECRET"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "RESEND_API_KEY"
  "DOCTOR_EMAIL"
  "CONTACT_EMAIL_FROM"
  "ZENVIA_API_TOKEN"
  "ZENVIA_FROM_NUMBER"
  "SPOTIFY_RSS_URL"
  "OPENAI_API_KEY"
  "POSTHOG_KEY"
  "NODE_ENV"
  "TIMEZONE"
  "NEXT_PUBLIC_SITE_URL"
)

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI not found. Please install it first:"
  echo "npm i -g vercel"
  exit 1
fi

# Check production environment variables
echo "Checking production environment variables..."
MISSING_VARS=()

for var in "\${REQUIRED_VARS[@]}"; do
  if ! vercel env ls production | grep -q "^$var"; then
    MISSING_VARS+=("$var")
    echo "❌ Missing: $var"
  else
    echo "✅ Found: $var"
  fi
done

if [ \${#MISSING_VARS[@]} -eq 0 ]; then
  echo "✅ All required environment variables are configured!"
else
  echo "🚨 Missing \${#MISSING_VARS[@]} required environment variables"
  echo "Please configure the missing variables using:"
  echo "vercel env add <VARIABLE_NAME> production"
  exit 1
fi

echo "🎉 Environment validation completed successfully!"
`;

        fs.writeFileSync('scripts/validate-vercel-env.sh', content);
        fs.chmodSync('scripts/validate-vercel-env.sh', '755');
        console.log('📄 Generated scripts/validate-vercel-env.sh');
    }

    listRequired() {
        console.log('📋 Required Environment Variables:\n');

        Object.entries(ENV_VARIABLES).forEach(([key, config]) => {
            if (config.required) {
                console.log(`${key}`);
                console.log(`  Description: ${config.description}`);
                console.log(`  Example: ${config.example}`);
                console.log(`  Environments: ${config.environments.join(', ')}`);
                if (config.sensitive) {
                    console.log(`  ⚠️  Sensitive: Do not commit to version control`);
                }
                console.log('');
            }
        });
    }

    run() {
        if (this.args.includes('--help') || this.args.length === 0) {
            this.showHelp();
            return;
        }

        if (this.args.includes('--validate')) {
            this.validateEnvironment();
            return;
        }

        if (this.args.includes('--generate-template')) {
            this.generateTemplate();
            return;
        }

        if (this.args.includes('--list-required')) {
            this.listRequired();
            return;
        }

        if (this.args.includes('--check-secrets')) {
            this.checkSensitiveVariables();
            return;
        }

        console.log('Unknown option. Use --help for usage information.');
    }
}

// Run the script
const config = new VercelEnvConfig();
config.run();