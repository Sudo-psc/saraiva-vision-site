#!/usr/bin/env node
/**
 * Blog Image Optimization Script
 * Compresses and converts blog images to WebP and AVIF formats
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../public/Blog');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.tiff'];
const QUALITY = {
  webp: 85,
  avif: 75,
  jpeg: 85
};

const SIZES = [
  { width: 1920, suffix: '-1920w' },
  { width: 1280, suffix: '-1280w' },
  { width: 768, suffix: '-768w' },
  { width: 480, suffix: '-480w' }
];

async function getImageFiles() {
  const files = await fs.readdir(BLOG_DIR);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });
}

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024 / 1024).toFixed(2); // MB
}

async function optimizeImage(filename) {
  const inputPath = path.join(BLOG_DIR, filename);
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);

  console.log(`\n📸 Processing: ${filename}`);

  const originalSize = await getFileSize(inputPath);
  console.log(`   Original: ${originalSize}MB`);

  let totalSaved = 0;
  const outputFiles = [];

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Generate responsive sizes
    for (const size of SIZES) {
      if (metadata.width <= size.width) continue;

      // WebP
      const webpPath = path.join(BLOG_DIR, `${basename}${size.suffix}.webp`);
      await image
        .clone()
        .resize(size.width, null, { withoutEnlargement: true })
        .webp({ quality: QUALITY.webp, effort: 6 })
        .toFile(webpPath);

      const webpSize = await getFileSize(webpPath);
      outputFiles.push({ path: webpPath, size: webpSize, format: 'webp', width: size.width });

      // AVIF (smaller but slower)
      const avifPath = path.join(BLOG_DIR, `${basename}${size.suffix}.avif`);
      await image
        .clone()
        .resize(size.width, null, { withoutEnlargement: true })
        .avif({ quality: QUALITY.avif, effort: 6 })
        .toFile(avifPath);

      const avifSize = await getFileSize(avifPath);
      outputFiles.push({ path: avifPath, size: avifSize, format: 'avif', width: size.width });
    }

    // Optimize original to WebP at original size
    const webpOriginalPath = path.join(BLOG_DIR, `${basename}.webp`);
    await image
      .clone()
      .webp({ quality: QUALITY.webp, effort: 6 })
      .toFile(webpOriginalPath);

    const webpOriginalSize = await getFileSize(webpOriginalPath);
    outputFiles.push({ path: webpOriginalPath, size: webpOriginalSize, format: 'webp', width: metadata.width });

    // AVIF original
    const avifOriginalPath = path.join(BLOG_DIR, `${basename}.avif`);
    await image
      .clone()
      .avif({ quality: QUALITY.avif, effort: 6 })
      .toFile(avifOriginalPath);

    const avifOriginalSize = await getFileSize(avifOriginalPath);
    outputFiles.push({ path: avifOriginalPath, size: avifOriginalSize, format: 'avif', width: metadata.width });

    // Calculate savings
    outputFiles.forEach(file => {
      console.log(`   ✓ ${path.basename(file.path)}: ${file.size}MB (${file.format}, ${file.width}w)`);
    });

    const avgNewSize = outputFiles.reduce((sum, f) => sum + parseFloat(f.size), 0) / outputFiles.length;
    totalSaved = parseFloat(originalSize) - avgNewSize;

    console.log(`   💾 Average savings: ${totalSaved.toFixed(2)}MB per format`);

    return {
      filename,
      originalSize: parseFloat(originalSize),
      outputFiles,
      saved: totalSaved
    };

  } catch (error) {
    console.error(`   ❌ Error processing ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🖼️  Blog Image Optimization Tool');
  console.log('================================\n');

  const imageFiles = await getImageFiles();
  console.log(`Found ${imageFiles.length} images to optimize\n`);

  const results = [];

  for (const file of imageFiles) {
    const result = await optimizeImage(file);
    if (result) {
      results.push(result);
    }
  }

  console.log('\n\n📊 Summary');
  console.log('==========');
  console.log(`Images processed: ${results.length}`);

  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalSaved = results.reduce((sum, r) => sum + r.saved, 0);
  const totalOutputFiles = results.reduce((sum, r) => sum + r.outputFiles.length, 0);

  console.log(`Total original size: ${totalOriginal.toFixed(2)}MB`);
  console.log(`Average savings per image: ${(totalSaved / results.length).toFixed(2)}MB`);
  console.log(`Total output files created: ${totalOutputFiles}`);
  console.log(`\n✅ Optimization complete!`);

  // Create optimization manifest
  const manifest = {
    date: new Date().toISOString(),
    originalCount: imageFiles.length,
    processed: results.length,
    totalOriginalSize: `${totalOriginal.toFixed(2)}MB`,
    totalSavings: `${totalSaved.toFixed(2)}MB`,
    results: results.map(r => ({
      filename: r.filename,
      originalSize: `${r.originalSize}MB`,
      formats: r.outputFiles.map(f => ({
        format: f.format,
        width: f.width,
        size: `${f.size}MB`
      }))
    }))
  };

  await fs.writeFile(
    path.join(BLOG_DIR, 'optimization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n📝 Manifest saved to: public/Blog/optimization-manifest.json`);
}

main().catch(console.error);
