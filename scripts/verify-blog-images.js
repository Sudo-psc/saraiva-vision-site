#!/usr/bin/env node

/**
 * Blog Image Verification Script
 * Scans public/Blog/ directory and validates image references in blogPosts.js
 * Reports missing images, broken extensions, and missing modern format variants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BLOG_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'Blog');
const BLOG_POSTS_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'blogPosts.js');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg', '.tiff'];
const MODERN_FORMATS = ['.webp', '.avif'];
const LEGACY_FORMATS = ['.png', '.jpg', '.jpeg'];

// Common extension typos
const EXTENSION_TYPOS = {
  '.avi': '.avif',
  '.avit': '.avif',
  '.webpp': '.webp',
  '.pn': '.png',
  '.jpe': '.jpg'
};

/**
 * Scan directory for all image files
 */
function scanImageDirectory(directory) {
  const images = [];

  try {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push({
          filename: file,
          path: path.join(directory, file),
          extension: ext,
          basename: path.basename(file, ext)
        });
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${directory}:`, error.message);
  }

  return images;
}

/**
 * Extract image references from blogPosts.js
 */
function extractImageReferences(filePath) {
  const references = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract all image references (coverImage, images array, inline references)
    const imagePatterns = [
      /coverImage:\s*['"]([^'"]+)['"]/g,
      /image:\s*['"]([^'"]+)['"]/g,
      /src:\s*['"]([^'"]+)['"]/g,
      /url:\s*['"]([^'"]+)['"]/g,
      /\/Blog\/([^'")\s]+)/g
    ];

    imagePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const imageRef = match[1] || match[0];

        // Extract just the filename if it's a full path
        let filename = imageRef;
        if (imageRef.includes('/Blog/')) {
          filename = imageRef.split('/Blog/')[1];
        }

        // Clean up the filename
        filename = filename.replace(/^\/+/, '').replace(/['")}\]]+$/, '');

        if (filename && IMAGE_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext))) {
          references.push({
            reference: imageRef,
            filename: filename,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    });

    // Remove duplicates
    const uniqueRefs = Array.from(new Map(references.map(ref => [ref.filename, ref])).values());
    return uniqueRefs;

  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Check for extension typos
 */
function detectExtensionTypos(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (EXTENSION_TYPOS[ext]) {
    return {
      hasTypo: true,
      actual: ext,
      suggested: EXTENSION_TYPOS[ext],
      fixedFilename: filename.replace(new RegExp(`${ext}$`), EXTENSION_TYPOS[ext])
    };
  }
  return { hasTypo: false };
}

/**
 * Check for missing modern format variants
 */
function checkModernFormatVariants(availableImages, image) {
  const missingVariants = [];

  if (LEGACY_FORMATS.includes(image.extension)) {
    MODERN_FORMATS.forEach(modernExt => {
      const variantName = `${image.basename}${modernExt}`;
      const variantExists = availableImages.some(img => img.filename === variantName);

      if (!variantExists) {
        missingVariants.push({
          format: modernExt,
          suggestedFilename: variantName,
          sourceImage: image.filename
        });
      }
    });
  }

  return missingVariants;
}

/**
 * Verify all image references
 */
function verifyImageReferences(availableImages, references) {
  const results = {
    valid: [],
    missing: [],
    typos: [],
    missingVariants: [],
    statistics: {
      totalReferences: references.length,
      validReferences: 0,
      missingImages: 0,
      extensionTypos: 0,
      imagesNeedingVariants: 0
    }
  };

  references.forEach(ref => {
    const imageExists = availableImages.some(img => img.filename === ref.filename);

    if (imageExists) {
      results.valid.push(ref);
      results.statistics.validReferences++;

      // Check for missing modern format variants
      const image = availableImages.find(img => img.filename === ref.filename);
      const missingVariants = checkModernFormatVariants(availableImages, image);

      if (missingVariants.length > 0) {
        results.missingVariants.push({
          reference: ref,
          image: image,
          missingFormats: missingVariants
        });
        results.statistics.imagesNeedingVariants++;
      }
    } else {
      // Check for extension typos
      const typoCheck = detectExtensionTypos(ref.filename);

      if (typoCheck.hasTypo) {
        const fixedExists = availableImages.some(img => img.filename === typoCheck.fixedFilename);
        results.typos.push({
          reference: ref,
          typo: typoCheck,
          fixedImageExists: fixedExists
        });
        results.statistics.extensionTypos++;
      } else {
        results.missing.push(ref);
        results.statistics.missingImages++;
      }
    }
  });

  return results;
}

/**
 * Check for unused images
 */
function findUnusedImages(availableImages, references) {
  const referencedFilenames = new Set(references.map(ref => ref.filename));

  return availableImages.filter(img => !referencedFilenames.has(img.filename));
}

/**
 * Generate human-readable report
 */
function generateReport(availableImages, references, verificationResults, unusedImages) {
  console.log('\n' + '='.repeat(80));
  console.log('  BLOG IMAGE VERIFICATION REPORT');
  console.log('='.repeat(80) + '\n');

  // Summary Statistics
  console.log('📊 SUMMARY STATISTICS');
  console.log('-'.repeat(80));
  console.log(`Total images in public/Blog/: ${availableImages.length}`);
  console.log(`Total image references in blogPosts.js: ${references.length}`);
  console.log(`Valid references: ${verificationResults.statistics.validReferences}`);
  console.log(`Missing images: ${verificationResults.statistics.missingImages}`);
  console.log(`Extension typos: ${verificationResults.statistics.extensionTypos}`);
  console.log(`Images needing modern variants: ${verificationResults.statistics.imagesNeedingVariants}`);
  console.log(`Unused images: ${unusedImages.length}\n`);

  // Missing Images
  if (verificationResults.missing.length > 0) {
    console.log('❌ MISSING IMAGES');
    console.log('-'.repeat(80));
    verificationResults.missing.forEach(ref => {
      console.log(`  • ${ref.filename}`);
      console.log(`    Referenced at line ${ref.line}: "${ref.reference}"`);
    });
    console.log();
  }

  // Extension Typos
  if (verificationResults.typos.length > 0) {
    console.log('🔤 EXTENSION TYPOS DETECTED');
    console.log('-'.repeat(80));
    verificationResults.typos.forEach(item => {
      console.log(`  • ${item.reference.filename}`);
      console.log(`    Line ${item.reference.line}: "${item.reference.reference}"`);
      console.log(`    Typo: "${item.typo.actual}" → Suggested: "${item.typo.suggested}"`);
      console.log(`    Fixed filename: ${item.typo.fixedFilename}`);
      console.log(`    Fixed image exists: ${item.fixedImageExists ? 'YES' : 'NO'}`);
    });
    console.log();
  }

  // Missing Modern Format Variants
  if (verificationResults.missingVariants.length > 0) {
    console.log('🖼️  MISSING MODERN FORMAT VARIANTS');
    console.log('-'.repeat(80));
    verificationResults.missingVariants.forEach(item => {
      console.log(`  • ${item.image.filename}`);
      item.missingFormats.forEach(variant => {
        console.log(`    → Missing ${variant.format}: ${variant.suggestedFilename}`);
      });
    });
    console.log();
  }

  // Unused Images
  if (unusedImages.length > 0) {
    console.log('🗑️  UNUSED IMAGES (not referenced in blogPosts.js)');
    console.log('-'.repeat(80));
    unusedImages.forEach(img => {
      console.log(`  • ${img.filename}`);
    });
    console.log();
  }

  // Suggestions
  console.log('💡 SUGGESTED FIXES');
  console.log('-'.repeat(80));

  if (verificationResults.typos.length > 0) {
    console.log('\n1. Fix Extension Typos in blogPosts.js:');
    verificationResults.typos.forEach(item => {
      console.log(`   Replace "${item.reference.filename}" with "${item.typo.fixedFilename}"`);
    });
  }

  if (verificationResults.missing.length > 0) {
    console.log('\n2. Add Missing Images to public/Blog/:');
    verificationResults.missing.forEach(ref => {
      console.log(`   Add: ${ref.filename}`);
    });
  }

  if (verificationResults.missingVariants.length > 0) {
    console.log('\n3. Generate Modern Format Variants:');
    const uniqueSources = new Set();
    verificationResults.missingVariants.forEach(item => {
      uniqueSources.add(item.image.filename);
    });
    uniqueSources.forEach(source => {
      console.log(`   Convert ${source} to .webp and .avif formats`);
    });
    console.log('\n   Suggested command:');
    console.log('   npx @squoosh/cli --webp auto --avif auto public/Blog/*.{png,jpg,jpeg}');
  }

  if (unusedImages.length > 0) {
    console.log('\n4. Consider Removing Unused Images (optional):');
    console.log('   Review and delete if no longer needed');
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Generate JSON report
 */
function generateJSONReport(availableImages, references, verificationResults, unusedImages, outputPath) {
  const report = {
    timestamp: new Date().toISOString(),
    paths: {
      imagesDirectory: BLOG_IMAGES_DIR,
      blogPostsFile: BLOG_POSTS_FILE
    },
    summary: {
      totalImagesAvailable: availableImages.length,
      totalReferences: references.length,
      validReferences: verificationResults.statistics.validReferences,
      missingImages: verificationResults.statistics.missingImages,
      extensionTypos: verificationResults.statistics.extensionTypos,
      imagesNeedingVariants: verificationResults.statistics.imagesNeedingVariants,
      unusedImages: unusedImages.length
    },
    availableImages: availableImages.map(img => ({
      filename: img.filename,
      extension: img.extension,
      basename: img.basename
    })),
    imageReferences: references,
    validReferences: verificationResults.valid,
    missingImages: verificationResults.missing,
    extensionTypos: verificationResults.typos,
    missingModernVariants: verificationResults.missingVariants,
    unusedImages: unusedImages.map(img => ({
      filename: img.filename,
      extension: img.extension
    }))
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 JSON report saved to: ${outputPath}`);
  } catch (error) {
    console.error(`Error writing JSON report:`, error.message);
  }

  return report;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Starting blog image verification...\n');

  // Check if directories exist
  if (!fs.existsSync(BLOG_IMAGES_DIR)) {
    console.error(`Error: Blog images directory not found: ${BLOG_IMAGES_DIR}`);
    process.exit(1);
  }

  if (!fs.existsSync(BLOG_POSTS_FILE)) {
    console.error(`Error: Blog posts file not found: ${BLOG_POSTS_FILE}`);
    process.exit(1);
  }

  // Scan available images
  console.log(`📁 Scanning ${BLOG_IMAGES_DIR}...`);
  const availableImages = scanImageDirectory(BLOG_IMAGES_DIR);
  console.log(`   Found ${availableImages.length} images\n`);

  // Extract image references
  console.log(`📖 Extracting references from ${BLOG_POSTS_FILE}...`);
  const references = extractImageReferences(BLOG_POSTS_FILE);
  console.log(`   Found ${references.length} image references\n`);

  // Verify references
  console.log('✅ Verifying image references...');
  const verificationResults = verifyImageReferences(availableImages, references);

  // Find unused images
  console.log('🔍 Checking for unused images...\n');
  const unusedImages = findUnusedImages(availableImages, references);

  // Generate reports
  generateReport(availableImages, references, verificationResults, unusedImages);

  const jsonOutputPath = path.join(PROJECT_ROOT, 'blog-image-verification-report.json');
  generateJSONReport(availableImages, references, verificationResults, unusedImages, jsonOutputPath);

  // Exit with error code if issues found
  const hasIssues = verificationResults.statistics.missingImages > 0 ||
                    verificationResults.statistics.extensionTypos > 0;

  if (hasIssues) {
    console.log('⚠️  Verification completed with issues\n');
    process.exit(1);
  } else {
    console.log('✅ Verification completed successfully\n');
    process.exit(0);
  }
}

// Execute
main();
