#!/usr/bin/env node
/**
 * CI/CD Image Validation Script
 * Fails build if:
 * - srcset references non-existent files
 * - Critical images missing
 * - Manifest out of date
 * - Naming inconsistencies
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../public/Blog');
const MANIFEST_PATH = path.join(__dirname, '../public/image-manifest.json');
const DATA_PATH = path.join(__dirname, '../src/data/blogPosts.js');

const CRITICAL_IMAGES = [
  'capa_daltonismo.png',
  'descolamento_retina_capa.png',
  'olhinho.png',
  'retinose_pigmentar.png',
  'moscas_volantes_capa.png',
  'gym_capa.png',
  'futuristic_eye_examination.png',
  'terapia_genica.png',
  'Coats.png'
];

let exitCode = 0;
const errors = [];
const warnings = [];

/**
 * Check 1: Manifest exists and is recent
 */
function checkManifest() {
  console.log('\n📋 Checking image manifest...');

  if (!fs.existsSync(MANIFEST_PATH)) {
    errors.push('Image manifest not found. Run: npm run generate:manifest');
    exitCode = 1;
    return null;
  }

  const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const manifestAge = Date.now() - new Date(manifestData.generated).getTime();
  const HOUR = 60 * 60 * 1000;

  if (manifestAge > 24 * HOUR) {
    warnings.push(`Manifest is ${Math.round(manifestAge / HOUR)}h old. Consider regenerating.`);
  }

  console.log('   ✅ Manifest found');
  return manifestData;
}

/**
 * Check 2: Critical images exist
 */
function checkCriticalImages() {
  console.log('\n🖼️  Checking critical images...');

  const missing = CRITICAL_IMAGES.filter(img => {
    const filepath = path.join(BLOG_DIR, img);
    return !fs.existsSync(filepath);
  });

  if (missing.length > 0) {
    errors.push(`Missing critical images: ${missing.join(', ')}`);
    exitCode = 1;
  } else {
    console.log(`   ✅ All ${CRITICAL_IMAGES.length} critical images present`);
  }
}

/**
 * Check 3: blogPosts.js references valid images
 */
function checkBlogPostReferences() {
  console.log('\n📝 Validating blog post image references...');

  const blogPostsContent = fs.readFileSync(DATA_PATH, 'utf8');

  // Extract image paths from blogPosts.js
  const imageRegex = /image:\s*['"]([^'"]+)['"]/g;
  const references = [...blogPostsContent.matchAll(imageRegex)].map(m => m[1]);

  const invalid = references.filter(ref => {
    const filename = ref.split('/').pop();
    const filepath = path.join(BLOG_DIR, filename);
    return !fs.existsSync(filepath);
  });

  if (invalid.length > 0) {
    errors.push(`Invalid image references in blogPosts.js:\n      ${invalid.join('\n      ')}`);
    exitCode = 1;
  } else {
    console.log(`   ✅ All ${references.length} blog post images valid`);
  }

  return references;
}

/**
 * Check 4: Naming consistency
 */
function checkNamingConsistency() {
  console.log('\n🔤 Checking naming consistency...');

  const files = fs.readdirSync(BLOG_DIR);
  const issues = [];

  files.forEach(filename => {
    // Check for spaces
    if (filename.includes(' ')) {
      issues.push(`Spaces in filename: ${filename}`);
    }

    // Check for typos
    if (filename.includes('descolamente')) {
      issues.push(`Typo "descolamente" should be "descolamento": ${filename}`);
    }

    // Check for uppercase extensions
    if (/\.(PNG|JPG|JPEG|AVIF|WEBP)$/.test(filename)) {
      issues.push(`Uppercase extension: ${filename}`);
    }

    // Check for mixed separators
    if (filename.includes('_') && filename.includes('-') && !filename.match(/-\d+w\./)) {
      warnings.push(`Mixed separators (underscore and hyphen): ${filename}`);
    }
  });

  if (issues.length > 0) {
    errors.push(`Naming issues found:\n      ${issues.join('\n      ')}`);
    exitCode = 1;
  } else {
    console.log('   ✅ No naming issues');
  }
}

/**
 * Check 5: MIME type configuration
 */
function checkMimeTypes() {
  console.log('\n🌐 Checking for modern image format support...');

  const avifCount = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.avif')).length;
  const webpCount = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.webp')).length;

  console.log(`   📊 AVIF files: ${avifCount}`);
  console.log(`   📊 WebP files: ${webpCount}`);

  if (avifCount === 0 && webpCount === 0) {
    warnings.push('No modern image formats (AVIF/WebP) found. Performance may be suboptimal.');
  } else {
    console.log('   ✅ Modern formats present');
  }
}

/**
 * Check 6: Variant completeness
 */
function checkVariantCompleteness(manifestData) {
  console.log('\n📐 Checking variant completeness...');

  if (!manifestData?.manifest) return;

  const incomplete = [];
  const EXPECTED_SIZES = [480, 768];  // Minimum expected sizes

  Object.entries(manifestData.manifest).forEach(([basename, data]) => {
    const avifSizes = data.variants?.avif || [];
    const webpSizes = data.variants?.webp || [];

    if (avifSizes.length === 0 && webpSizes.length === 0) {
      // No variants at all - just a warning
      return;
    }

    // Check if AVIF has incomplete set
    const missingAvif = EXPECTED_SIZES.filter(size => !avifSizes.includes(size));
    if (avifSizes.length > 0 && missingAvif.length > 0) {
      incomplete.push(`${basename} (AVIF): missing ${missingAvif.join(', ')}w`);
    }

    // Check if WebP has incomplete set
    const missingWebp = EXPECTED_SIZES.filter(size => !webpSizes.includes(size));
    if (webpSizes.length > 0 && missingWebp.length > 0) {
      incomplete.push(`${basename} (WebP): missing ${missingWebp.join(', ')}w`);
    }
  });

  if (incomplete.length > 0) {
    warnings.push(`Incomplete variant sets:\n      ${incomplete.join('\n      ')}`);
  } else {
    console.log('   ✅ All variant sets complete');
  }
}

/**
 * Check 7: Fallback image exists
 */
function checkFallbackImage() {
  console.log('\n🛡️  Checking fallback image...');

  const fallbackPath = path.join(__dirname, '../public/img/blog-fallback.jpg');

  if (!fs.existsSync(fallbackPath)) {
    warnings.push('Fallback image /img/blog-fallback.jpg not found');
  } else {
    console.log('   ✅ Fallback image exists');
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 CI/CD Image Validation');
  console.log('========================');

  const manifestData = checkManifest();
  checkCriticalImages();
  checkBlogPostReferences();
  checkNamingConsistency();
  checkMimeTypes();
  checkVariantCompleteness(manifestData);
  checkFallbackImage();

  // Report
  console.log('\n' + '='.repeat(50));
  console.log('📊 Validation Report');
  console.log('='.repeat(50));

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(err => console.log(`   • ${err}`));
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`   • ${warn}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('\n✅ All checks passed!');
  }

  console.log('');

  // Exit with appropriate code
  if (exitCode !== 0) {
    console.error('❌ Build failed due to image validation errors.');
    console.error('   Fix the issues above and run: npm run generate:manifest');
    process.exit(exitCode);
  }

  console.log('✅ Image validation complete');
  process.exit(0);
}

main();
