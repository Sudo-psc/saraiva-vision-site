#!/usr/bin/env node

/**
 * PostHog Configuration Test Script
 * Verifica se as variáveis de ambiente estão configuradas corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PostHog Configuration Test\n');

// Check .env.production
const envPath = path.join(__dirname, '../.env.production');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.error('❌ .env.production not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Check PostHog variables
const posthogVars = {
  'VITE_POSTHOG_KEY': false,
  'VITE_POSTHOG_HOST': false,
  'POSTHOG_API_KEY': false,
  'POSTHOG_PROJECT_ID': false
};

envLines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    Object.keys(posthogVars).forEach(varName => {
      if (trimmed.startsWith(varName + '=')) {
        const value = trimmed.split('=')[1]?.trim();
        if (value && !value.includes('PLACEHOLDER') && !value.includes('your_')) {
          posthogVars[varName] = true;
        }
      }
    });
  }
});

// Report results
console.log('📋 Environment Variables Check:\n');

let allConfigured = true;
Object.entries(posthogVars).forEach(([varName, isConfigured]) => {
  const status = isConfigured ? '✅' : '⚠️ ';
  const message = isConfigured ? 'Configured' : 'Not configured (using placeholder)';
  console.log(`${status} ${varName}: ${message}`);
  if (!isConfigured) {
    allConfigured = false;
  }
});

console.log('\n📦 Files Check:\n');

// Check if PostHogProvider exists
const providerPath = path.join(__dirname, '../src/providers/PostHogProvider.jsx');
const providerExists = fs.existsSync(providerPath);
console.log(providerExists ? '✅ PostHogProvider.jsx exists' : '❌ PostHogProvider.jsx not found');

// Check if hook exists
const hookPath = path.join(__dirname, '../src/hooks/useHealthcareAnalytics.js');
const hookExists = fs.existsSync(hookPath);
console.log(hookExists ? '✅ useHealthcareAnalytics.js exists' : '❌ useHealthcareAnalytics.js not found');

// Check if examples exist
const examplesPath = path.join(__dirname, '../src/examples/PostHogIntegrationExample.jsx');
const examplesExist = fs.existsSync(examplesPath);
console.log(examplesExist ? '✅ PostHogIntegrationExample.jsx exists' : '❌ PostHogIntegrationExample.jsx not found');

// Check if documentation exists
const docsPath = path.join(__dirname, '../docs/POSTHOG_SETUP.md');
const docsExist = fs.existsSync(docsPath);
console.log(docsExist ? '✅ POSTHOG_SETUP.md exists' : '❌ POSTHOG_SETUP.md not found');

// Check if main.jsx is integrated
const mainPath = path.join(__dirname, '../src/main.jsx');
if (fs.existsSync(mainPath)) {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  const hasImport = mainContent.includes('PostHogProvider');
  const hasUsage = mainContent.includes('<PostHogProvider>');

  console.log(hasImport ? '✅ main.jsx imports PostHogProvider' : '❌ main.jsx missing PostHogProvider import');
  console.log(hasUsage ? '✅ main.jsx uses PostHogProvider' : '❌ main.jsx not using PostHogProvider');
}

console.log('\n📊 Summary:\n');

if (allConfigured && providerExists && hookExists && examplesExist && docsExist) {
  console.log('✅ PostHog is fully configured and ready to use!');
  console.log('\n📚 Next Steps:');
  console.log('   1. Update .env.production with your PostHog keys');
  console.log('   2. Build: npm run build:vite');
  console.log('   3. Deploy: sudo npm run deploy:quick');
  console.log('   4. Test: Visit your site and check PostHog dashboard');
  console.log('\n📖 Documentation: docs/POSTHOG_SETUP.md');
  process.exit(0);
} else {
  console.log('⚠️  PostHog configuration is incomplete');
  console.log('\n🔧 Action Required:');

  if (!allConfigured) {
    console.log('   - Configure PostHog API keys in .env.production');
  }

  if (!providerExists || !hookExists || !examplesExist) {
    console.log('   - Some files are missing, review implementation');
  }

  console.log('\n📖 See docs/POSTHOG_SETUP.md for full setup guide');
  process.exit(1);
}
