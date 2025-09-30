#!/usr/bin/env node
/**
 * Post-Build Validation Script
 * Validates build output for missing assets, broken images, and 404 errors
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const BLOG_DIR = path.join(DIST_DIR, 'Blog');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const results = {
  errors: [],
  warnings: [],
  success: [],
};

async function log(type, message) {
  const color = type === 'error' ? colors.red : type === 'warning' ? colors.yellow : colors.green;
  console.log(`${color}${message}${colors.reset}`);
}

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function validateDistDirectory() {
  console.log(`\n${colors.blue}🔍 Validating build output...${colors.reset}\n`);

  // Check if dist exists
  const distExists = await checkFileExists(DIST_DIR);
  if (!distExists) {
    results.errors.push('dist/ directory not found');
    return false;
  }
  results.success.push('dist/ directory exists');

  // Check critical files
  const criticalFiles = ['index.html', 'sw.js', 'site.webmanifest'];
  for (const file of criticalFiles) {
    const filePath = path.join(DIST_DIR, file);
    const exists = await checkFileExists(filePath);
    if (exists) {
      results.success.push(`✓ ${file}`);
    } else {
      results.errors.push(`✗ Missing critical file: ${file}`);
    }
  }

  return true;
}

async function validateBlogImages() {
  console.log(`\n${colors.blue}📸 Validating blog images...${colors.reset}\n`);

  const blogExists = await checkFileExists(BLOG_DIR);
  if (!blogExists) {
    results.warnings.push('Blog/ directory not found in dist');
    return;
  }

  // Get all image files
  const files = await fs.readdir(BLOG_DIR);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|webp|avif)$/i.test(f));

  console.log(`Found ${imageFiles.length} image files in Blog/`);

  // Check for responsive variants
  const baseImages = imageFiles.filter(f => !/-\d+w\.(webp|avif)$/i.test(f));
  const responsiveSizes = ['480w', '768w', '1280w'];
  const formats = ['webp', 'avif'];

  let missingCount = 0;
  for (const baseImage of baseImages) {
    const baseName = baseImage.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '');

    for (const size of responsiveSizes) {
      for (const format of formats) {
        const responsiveFile = `${baseName}-${size}.${format}`;
        const exists = imageFiles.includes(responsiveFile);

        if (!exists) {
          missingCount++;
          if (missingCount <= 10) { // Only show first 10 to avoid spam
            results.warnings.push(`Missing ${format.toUpperCase()}: ${responsiveFile}`);
          }
        }
      }
    }
  }

  if (missingCount > 0) {
    results.warnings.push(`Total missing responsive images: ${missingCount}`);
  } else {
    results.success.push('All responsive image variants present');
  }
}

async function validateAssets() {
  console.log(`\n${colors.blue}🎨 Validating bundled assets...${colors.reset}\n`);

  const assetsDir = path.join(DIST_DIR, 'assets');
  const exists = await checkFileExists(assetsDir);

  if (!exists) {
    results.errors.push('assets/ directory not found');
    return;
  }

  const files = await fs.readdir(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  if (jsFiles.length === 0) {
    results.errors.push('No JavaScript bundles found in assets/');
  } else {
    results.success.push(`✓ ${jsFiles.length} JS bundles`);
  }

  if (cssFiles.length === 0) {
    results.errors.push('No CSS bundles found in assets/');
  } else {
    results.success.push(`✓ ${cssFiles.length} CSS bundles`);
  }
}

async function validateServiceWorker() {
  console.log(`\n${colors.blue}⚙️  Validating Service Worker...${colors.reset}\n`);

  const swPath = path.join(DIST_DIR, 'sw.js');
  const exists = await checkFileExists(swPath);

  if (!exists) {
    results.errors.push('Service Worker (sw.js) not found');
    return;
  }

  const content = await fs.readFile(swPath, 'utf-8');

  // Check for version
  if (!content.includes('SW_VERSION')) {
    results.warnings.push('Service Worker missing version constant');
  } else {
    const versionMatch = content.match(/SW_VERSION = ['"](.+?)['"]/);
    if (versionMatch) {
      results.success.push(`✓ Service Worker version: ${versionMatch[1]}`);
    }
  }

  // Check for blog images cache
  if (!content.includes('BLOG_IMAGES_CACHE')) {
    results.warnings.push('Service Worker missing blog images cache');
  } else {
    results.success.push('✓ Service Worker has blog images cache');
  }
}

async function printResults() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.blue}📊 Validation Results${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);

  if (results.success.length > 0) {
    console.log(`${colors.green}✅ Success (${results.success.length}):${colors.reset}`);
    results.success.forEach(msg => console.log(`  ${msg}`));
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Warnings (${results.warnings.length}):${colors.reset}`);
    results.warnings.forEach(msg => console.log(`  ${msg}`));
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log(`${colors.red}❌ Errors (${results.errors.length}):${colors.reset}`);
    results.errors.forEach(msg => console.log(`  ${msg}`));
    console.log('');
  }

  console.log(`${'='.repeat(60)}\n`);

  // Exit code
  if (results.errors.length > 0) {
    console.log(`${colors.red}Build validation FAILED${colors.reset}`);
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log(`${colors.yellow}Build validation passed with warnings${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}Build validation PASSED${colors.reset}`);
    process.exit(0);
  }
}

async function main() {
  try {
    await validateDistDirectory();
    await validateBlogImages();
    await validateAssets();
    await validateServiceWorker();
    await printResults();
  } catch (error) {
    console.error(`${colors.red}Validation script error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
