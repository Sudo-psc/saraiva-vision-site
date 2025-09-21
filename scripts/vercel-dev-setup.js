#!/usr/bin/env node

/**
 * Vercel Development Setup Script
 * Helps configure local development environment for Vercel functions
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const ENV_FILE = join(PROJECT_ROOT, '.env');
const ENV_EXAMPLE = join(PROJECT_ROOT, '.env.example');

console.log('🚀 Setting up Vercel development environment...');

// Check if .env file exists
if (!existsSync(ENV_FILE)) {
    if (existsSync(ENV_EXAMPLE)) {
        console.log('📋 Creating .env file from .env.example...');
        execSync(`cp ${ENV_EXAMPLE} ${ENV_FILE}`);
        console.log('✅ .env file created. Please update with your actual values.');
    } else {
        console.log('⚠️  No .env.example found. Please create .env manually.');
    }
} else {
    console.log('✅ .env file already exists.');
}

// Check if Vercel CLI is installed
try {
    execSync('vercel --version', { stdio: 'ignore' });
    console.log('✅ Vercel CLI is installed.');
} catch (error) {
    console.log('📦 Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Pull environment variables from Vercel (if project is linked)
try {
    console.log('🔄 Pulling environment variables from Vercel...');
    execSync('vercel env pull .env.vercel', { stdio: 'inherit' });
    console.log('✅ Environment variables pulled successfully.');
} catch (error) {
    console.log('⚠️  Could not pull environment variables. Make sure project is linked to Vercel.');
    console.log('   Run: vercel link');
}

console.log('\n🎉 Setup complete! You can now run:');
console.log('   npm run dev:vercel  - Start Vercel development server');
console.log('   npm run test:contact - Run contact API tests');
console.log('   vercel --prod       - Deploy to production');