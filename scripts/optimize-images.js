#!/usr/bin/env node
/**
 * Image Optimization Script
 * Generates AVIF, WebP, and JPEG variants in multiple resolutions
 *
 * Solves: 404 errors on AVIF images by ensuring all variants are generated
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SIZES = [480, 768, 1200];
const FORMATS = ['avif', 'webp', 'jpeg'];
const INPUT_DIR = path.join(__dirname, '..', 'public', 'Blog');
const QUALITY = {
  avif: 80,
  webp: 85,
  jpeg: 90
};

/**
 * Optimize a single image to multiple formats and sizes
 */
async function optimizeImage(inputPath) {
  const parsedPath = path.parse(inputPath);
  const basename = parsedPath.name.replace(/-optimized.*$/, '');

  console.log(`\n📸 Processing: ${basename}`);

  let totalSize = 0;
  let generatedCount = 0;

  for (const size of SIZES) {
    for (const format of FORMATS) {
      const outputPath = path.join(
        INPUT_DIR,
        `${basename}-optimized-${size}w.${format}`
      );

      try {
        const sharpInstance = sharp(inputPath).resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        });

        // Apply format-specific options
        if (format === 'avif') {
          await sharpInstance.avif({ quality: QUALITY.avif }).toFile(outputPath);
        } else if (format === 'webp') {
          await sharpInstance.webp({ quality: QUALITY.webp }).toFile(outputPath);
        } else if (format === 'jpeg') {
          await sharpInstance.jpeg({ quality: QUALITY.jpeg, progressive: true }).toFile(outputPath);
        }

        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        totalSize += stats.size;
        generatedCount++;

        console.log(`  ✅ ${path.basename(outputPath)} (${sizeKB} KB)`);
      } catch (error) {
        console.error(`  ❌ Failed to create ${outputPath}:`, error.message);
      }
    }
  }

  console.log(`  📊 Total: ${generatedCount} variants, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`📂 Input directory: ${INPUT_DIR}`);
  console.log(`📐 Sizes: ${SIZES.join(', ')}px`);
  console.log(`🎨 Formats: ${FORMATS.join(', ')}`);

  try {
    // Find all source images (exclude already optimized ones)
    const images = await glob(`${INPUT_DIR}/capa-*.{jpg,jpeg,png}`, {
      ignore: [
        '**/*-optimized*',
        '**/*-{480,768,1200}w*',
        '**/*-placeholder*'
      ]
    });

    if (images.length === 0) {
      console.log('\n⚠️  No images found to optimize');
      console.log('Expected pattern: public/Blog/capa-*.{jpg,jpeg,png}');
      return;
    }

    console.log(`\n✨ Found ${images.length} images to optimize\n`);
    console.log('━'.repeat(60));

    for (const image of images) {
      await optimizeImage(image);
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n✅ Image optimization complete!\n');

    // List generated files
    const generated = await glob(`${INPUT_DIR}/*-optimized-*.{avif,webp,jpeg,jpg}`);
    console.log(`📦 Generated ${generated.length} optimized images`);

  } catch (error) {
    console.error('\n❌ Error during optimization:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
