#!/usr/bin/env node
/**
 * Optimize specific blog images to optimized-1200w format
 * Fixes missing optimized versions for IA and Pterígio posts
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../public/Blog');
const TARGET_WIDTH = 1200;
const QUALITY = {
  webp: 85,
  avif: 75,
  jpeg: 85
};

// Images to optimize
const IMAGES = [
  {
    source: 'futuristic-eye-examination.png',
    basename: 'futuristic-eye-examination'
  },
  {
    source: 'pterigio-capa.png',
    basename: 'pterigio-capa'
  }
];

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024 / 1024).toFixed(2); // MB
}

async function optimizeImage(sourceFile, basename) {
  const inputPath = path.join(BLOG_DIR, sourceFile);

  console.log(`\n📸 Processing: ${sourceFile}`);

  try {
    const originalSize = await getFileSize(inputPath);
    console.log(`   Original: ${originalSize}MB`);

    const image = sharp(inputPath);
    const metadata = await image.metadata();

    console.log(`   Dimensions: ${metadata.width}x${metadata.height}`);

    // Generate optimized-1200w versions
    const outputs = [];

    // WebP optimized-1200w
    const webpPath = path.join(BLOG_DIR, `${basename}-optimized-1200w.webp`);
    await image
      .clone()
      .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
      .webp({ quality: QUALITY.webp, effort: 6 })
      .toFile(webpPath);

    const webpSize = await getFileSize(webpPath);
    outputs.push({ path: webpPath, size: webpSize, format: 'webp' });
    console.log(`   ✓ ${path.basename(webpPath)}: ${webpSize}MB`);

    // AVIF optimized-1200w
    const avifPath = path.join(BLOG_DIR, `${basename}-optimized-1200w.avif`);
    await image
      .clone()
      .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
      .avif({ quality: QUALITY.avif, effort: 6 })
      .toFile(avifPath);

    const avifSize = await getFileSize(avifPath);
    outputs.push({ path: avifPath, size: avifSize, format: 'avif' });
    console.log(`   ✓ ${path.basename(avifPath)}: ${avifSize}MB`);

    // JPEG optimized-1200w (fallback)
    const jpegPath = path.join(BLOG_DIR, `${basename}-optimized-1200w.jpeg`);
    await image
      .clone()
      .resize(TARGET_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
      .toFile(jpegPath);

    const jpegSize = await getFileSize(jpegPath);
    outputs.push({ path: jpegPath, size: jpegSize, format: 'jpeg' });
    console.log(`   ✓ ${path.basename(jpegPath)}: ${jpegSize}MB`);

    const avgNewSize = outputs.reduce((sum, f) => sum + parseFloat(f.size), 0) / outputs.length;
    const saved = parseFloat(originalSize) - avgNewSize;
    console.log(`   💾 Average savings: ${saved.toFixed(2)}MB per format`);

    return { success: true, outputs };

  } catch (error) {
    console.error(`   ❌ Error processing ${sourceFile}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🖼️  Specific Image Optimization Tool');
  console.log('====================================\n');

  const results = [];

  for (const img of IMAGES) {
    const result = await optimizeImage(img.source, img.basename);
    results.push({ ...img, ...result });
  }

  console.log('\n\n📊 Summary');
  console.log('==========');
  console.log(`Images processed: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);

  if (results.some(r => !r.success)) {
    console.log('\n❌ Some images failed to process:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.source}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('\n✅ All images optimized successfully!');
  console.log('\nNext steps:');
  console.log('1. Update blogPosts.js to use the new optimized images');
  console.log('2. Run npm run build:vite');
  console.log('3. Deploy with sudo npm run deploy:quick');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
