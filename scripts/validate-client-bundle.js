#!/usr/bin/env node
/**
 * Client Bundle Validator
 * Ensures no Node.js-only modules leak into the browser bundle
 *
 * This script scans the built dist/ assets for forbidden Node.js references
 * that would cause runtime errors in the browser.
 */

import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');

// Forbidden patterns that indicate Node.js modules in client bundle
const FORBIDDEN_PATTERNS = [
  {
    pattern: /\brequire\(['"`]buffer['"`]\)/g,
    name: 'Buffer (require)',
    description: 'Node.js Buffer module imported via require()'
  },
  {
    pattern: /\bfrom ['"`]buffer['"`]/g,
    name: 'Buffer (import)',
    description: 'Node.js Buffer module imported via ES6 import'
  },
  {
    pattern: /\bBuffer\.from\(/g,
    name: 'Buffer.from()',
    description: 'Direct usage of Buffer.from() - not available in browser'
  },
  {
    pattern: /\bBuffer\.alloc\(/g,
    name: 'Buffer.alloc()',
    description: 'Direct usage of Buffer.alloc() - not available in browser'
  },
  {
    pattern: /\bBuffer\.byteLength\(/g,
    name: 'Buffer.byteLength()',
    description: 'Direct usage of Buffer.byteLength() - not available in browser'
  },
  {
    pattern: /\brequire\(['"`]crypto['"`]\)/g,
    name: 'crypto (require)',
    description: 'Node.js crypto module imported via require()'
  },
  {
    pattern: /\bfrom ['"`]crypto['"`]/g,
    name: 'crypto (import)',
    description: 'Node.js crypto module imported via ES6 import (excluding Web Crypto API)'
  },
  {
    pattern: /\brequire\(['"`]fs['"`]\)/g,
    name: 'fs (require)',
    description: 'Node.js fs module - file system not available in browser'
  },
  {
    pattern: /\bfrom ['"`]fs['"`]/g,
    name: 'fs (import)',
    description: 'Node.js fs module imported - file system not available in browser'
  },
  {
    pattern: /\brequire\(['"`]path['"`]\)/g,
    name: 'path (require)',
    description: 'Node.js path module - not needed in browser'
  },
  {
    pattern: /\bfrom ['"`]path['"`]/g,
    name: 'path (import)',
    description: 'Node.js path module imported - not needed in browser'
  },
  {
    pattern: /\bgray-matter/g,
    name: 'gray-matter',
    description: 'Markdown frontmatter parser (uses Buffer) - should run at build-time only'
  }
];

/**
 * Validate a single file for forbidden patterns
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  FORBIDDEN_PATTERNS.forEach(({ pattern, name, description }) => {
    const matches = content.match(pattern);
    if (matches) {
      errors.push({
        file: path.relative(DIST_DIR, filePath),
        pattern: name,
        description,
        occurrences: matches.length
      });
    }
  });

  return errors;
}

/**
 * Main validation function
 */
async function validateBundle() {
  console.log('🔍 Validating client bundle for Node.js dependencies...\n');

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Error: dist directory not found at ${DIST_DIR}`);
    console.error('   Run "npm run build" first to generate the bundle.\n');
    process.exit(1);
  }

  // Find all JS files in dist
  const jsFiles = await glob('assets/**/*.js', { cwd: DIST_DIR, absolute: true });

  if (jsFiles.length === 0) {
    console.error('❌ Error: No JavaScript files found in dist/assets/');
    console.error('   The build may have failed.\n');
    process.exit(1);
  }

  console.log(`📦 Scanning ${jsFiles.length} JavaScript bundles...\n`);

  let totalErrors = 0;
  const fileErrors = new Map();

  // Validate each file
  jsFiles.forEach(file => {
    const errors = validateFile(file);
    if (errors.length > 0) {
      fileErrors.set(file, errors);
      totalErrors += errors.length;
    }
  });

  // Report results
  if (totalErrors === 0) {
    console.log('✅ Bundle validation passed!');
    console.log('   No Node.js modules detected in client bundle.\n');
    return true;
  } else {
    console.error('❌ Bundle validation failed!\n');
    console.error(`   Found ${totalErrors} Node.js reference(s) in ${fileErrors.size} file(s):\n`);

    fileErrors.forEach((errors, file) => {
      const relativePath = path.relative(DIST_DIR, file);
      console.error(`   📄 ${relativePath}:`);
      errors.forEach(({ pattern, description, occurrences }) => {
        console.error(`      ⚠️  ${pattern} (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`);
        console.error(`          ${description}`);
      });
      console.error('');
    });

    console.error('💡 Recommended fixes:');
    console.error('   1. Move Node.js services to api/ directory');
    console.error('   2. Create API endpoints to expose functionality');
    console.error('   3. Update client components to use fetch() instead of direct imports');
    console.error('   4. See claudedocs/BUFFER_ERROR_DIAGNOSIS_AND_FIX.md for details\n');

    return false;
  }
}

// Execute validation
const success = await validateBundle();
process.exit(success ? 0 : 1);
