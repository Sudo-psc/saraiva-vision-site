#!/usr/bin/env node
/**
 * Generate Missing AVIF Images
 * Creates responsive AVIF versions for images that are missing them
 *
 * Usage: node scripts/generate-missing-avif.js [--target production|local]
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SIZES = [480, 768, 1280];
const QUALITY = 80; // AVIF quality (0-100)
const EFFORT = 4;   // Compression effort (0-9, higher = slower but better)

// Parse command line arguments
const args = process.argv.slice(2);
const isProduction = args.includes('--target') && args[args.indexOf('--target') + 1] === 'production';

const SOURCE_DIR = isProduction ? '/var/www/html/Blog' : path.resolve(__dirname, '../public/Blog');
const TARGET_DIR = SOURCE_DIR;

// Images to process (based on 404 errors)
const IMAGES_TO_PROCESS = [
  'olhinho.png',
  'retinose_pigmentar.png',
  'moscas_volantes_capa.png'
];

/**
 * Generate AVIF versions for a single image
 */
async function generateAVIFVersions(sourceFile) {
  const basename = path.basename(sourceFile, path.extname(sourceFile));
  const sourcePath = path.join(SOURCE_DIR, sourceFile);

  console.log(`\n📸 Processing: ${sourceFile}`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`  ❌ Source file not found: ${sourcePath}`);
    return { success: false, error: 'File not found' };
  }

  const results = {
    success: true,
    generated: [],
    skipped: [],
    errors: []
  };

  for (const size of SIZES) {
    const outputFileName = `${basename}-${size}w.avif`;
    const outputPath = path.join(TARGET_DIR, outputFileName);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ⏭️  Skipping ${size}w (already exists)`);
      results.skipped.push(outputFileName);
      continue;
    }

    try {
      await sharp(sourcePath)
        .resize(size, null, {
          width: size,
          fit: 'inside',
          withoutEnlargement: true
        })
        .avif({
          quality: QUALITY,
          effort: EFFORT,
          chromaSubsampling: '4:2:0'
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ✅ Generated ${outputFileName} (${sizeKB} KB)`);
      results.generated.push({ file: outputFileName, size: sizeKB });

      // Set permissions if production
      if (isProduction) {
        fs.chmodSync(outputPath, 0o755);
        try {
          fs.chownSync(outputPath, 33, 33); // www-data uid/gid
        } catch (e) {
          console.warn(`  ⚠️  Could not change owner (needs sudo): ${e.message}`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error generating ${size}w: ${error.message}`);
      results.errors.push({ size, error: error.message });
      results.success = false;
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 AVIF Generation Script');
  console.log('========================\n');
  console.log(`Target: ${isProduction ? 'PRODUCTION' : 'LOCAL'}`);
  console.log(`Source Directory: ${SOURCE_DIR}`);
  console.log(`Sizes: ${SIZES.join(', ')}px width`);
  console.log(`Quality: ${QUALITY}, Effort: ${EFFORT}`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`\n❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const totalResults = {
    processed: 0,
    generated: 0,
    skipped: 0,
    errors: 0
  };

  for (const image of IMAGES_TO_PROCESS) {
    const results = await generateAVIFVersions(image);
    totalResults.processed++;
    totalResults.generated += results.generated.length;
    totalResults.skipped += results.skipped.length;
    totalResults.errors += results.errors.length;
  }

  console.log('\n📊 Summary');
  console.log('==========');
  console.log(`Images processed: ${totalResults.processed}`);
  console.log(`Files generated:  ${totalResults.generated}`);
  console.log(`Files skipped:    ${totalResults.skipped}`);
  console.log(`Errors:           ${totalResults.errors}`);

  if (totalResults.errors > 0) {
    console.log('\n⚠️  Some images failed to generate. Check errors above.');
    process.exit(1);
  }

  if (totalResults.generated === 0) {
    console.log('\n✨ All AVIF versions already exist!');
  } else {
    console.log('\n✅ AVIF generation completed successfully!');

    if (isProduction) {
      console.log('\n🔄 Next steps:');
      console.log('1. Verify files were created: ls -lh /var/www/html/Blog/*-{480,768,1280}w.avif');
      console.log('2. Test in browser: https://saraivavision.com.br/blog');
      console.log('3. Check DevTools Network tab for 200 responses (no more 404s)');
    }
  }
}

// Execute
main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
