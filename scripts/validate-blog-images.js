#!/usr/bin/env node
/**
 * Blog Images Validation Script
 * Validates aspect ratios and sizes of blog cover images
 * Usage: node scripts/validate-blog-images.js
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

const BLOG_DIR = './public/Blog';
const EXPECTED_ASPECT_RATIO = 16 / 9;
const TOLERANCE = 0.05; // 5% tolerance

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

async function validateImage(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    const { width, height, format, size } = metadata;

    if (!width || !height) {
      return {
        valid: false,
        error: 'Could not read dimensions'
      };
    }

    const aspectRatio = width / height;
    const ratioMatch = Math.abs(aspectRatio - EXPECTED_ASPECT_RATIO) < TOLERANCE;

    return {
      valid: ratioMatch,
      width,
      height,
      aspectRatio: aspectRatio.toFixed(2),
      expected: EXPECTED_ASPECT_RATIO.toFixed(2),
      format,
      size: (size / 1024).toFixed(2) + ' KB'
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

async function main() {
  console.log(`${colors.bold}${colors.blue}Blog Images Validation Report${colors.reset}\n`);
  console.log(`Directory: ${BLOG_DIR}`);
  console.log(`Expected Aspect Ratio: ${EXPECTED_ASPECT_RATIO.toFixed(2)} (16:9)`);
  console.log(`Tolerance: ±${(TOLERANCE * 100).toFixed(0)}%\n`);

  let totalImages = 0;
  let validImages = 0;
  let invalidImages = [];
  let largeFiles = [];

  try {
    const files = readdirSync(BLOG_DIR);

    // Filter for primary images only (not responsive variants)
    const primaryImages = files.filter(file => {
      return (
        (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') ||
         file.endsWith('.webp') || file.endsWith('.avif')) &&
        !file.includes('-480w') &&
        !file.includes('-768w') &&
        !file.includes('-1280w')
      );
    });

    console.log(`Found ${primaryImages.length} primary images\n`);

    for (const file of primaryImages) {
      const filePath = join(BLOG_DIR, file);
      const stat = statSync(filePath);

      totalImages++;

      const validation = await validateImage(filePath);

      if (validation.valid) {
        validImages++;
        console.log(`${colors.green}✓${colors.reset} ${file}`);
        console.log(`  ${validation.width}x${validation.height} (${validation.aspectRatio}:1) - ${validation.size}\n`);
      } else {
        invalidImages.push({ file, ...validation });
        console.log(`${colors.red}✗${colors.reset} ${file}`);
        if (validation.error) {
          console.log(`  Error: ${validation.error}\n`);
        } else {
          console.log(`  ${validation.width}x${validation.height} (${validation.aspectRatio}:1) - Expected ${validation.expected}:1\n`);
        }
      }

      // Check for large files (>500KB for primary images)
      if (stat.size > 500 * 1024 && !file.endsWith('.png')) {
        largeFiles.push({
          file,
          size: (stat.size / 1024 / 1024).toFixed(2) + ' MB'
        });
      }
    }

    // Summary
    console.log(`\n${colors.bold}Summary:${colors.reset}`);
    console.log(`Total Images: ${totalImages}`);
    console.log(`${colors.green}Valid: ${validImages}${colors.reset}`);
    console.log(`${colors.red}Invalid: ${invalidImages.length}${colors.reset}`);

    if (largeFiles.length > 0) {
      console.log(`\n${colors.yellow}⚠ Large Files (>500KB):${colors.reset}`);
      largeFiles.forEach(({ file, size }) => {
        console.log(`  ${file} - ${size}`);
      });
      console.log(`\n💡 Consider optimizing these files with AVIF/WebP formats`);
    }

    if (invalidImages.length > 0) {
      console.log(`\n${colors.yellow}⚠ Invalid Aspect Ratios:${colors.reset}`);
      invalidImages.forEach(({ file, aspectRatio, expected }) => {
        if (aspectRatio) {
          console.log(`  ${file} - ${aspectRatio}:1 (expected ${expected}:1)`);
        } else {
          console.log(`  ${file} - Could not validate`);
        }
      });
    }

    // Exit code
    process.exit(invalidImages.length > 0 ? 1 : 0);

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

main();
