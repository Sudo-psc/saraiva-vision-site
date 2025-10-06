#!/usr/bin/env node

/**
 * Otimização Automática de Imagens - Saraiva Vision
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

const CONFIG = {
  inputDirs: ['public/Blog', 'public/img', 'public'],
  quality: {
    jpeg: 85,
    webp: 85,
    avif: 75,
    png: 90
  },
  maxWidth: 2000,
  maxHeight: 2000,
  minSizeKB: 50,
  backupDir: 'public/.image-backups',
  stats: {
    processed: 0,
    skipped: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    errors: []
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function backupFile(filePath) {
  const relativePath = path.relative('public', filePath);
  const backupPath = path.join(CONFIG.backupDir, relativePath);
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  await fs.copyFile(filePath, backupPath);
  console.log(`  ✓ Backup: ${backupPath}`);
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  try {
    const stats = await fs.stat(filePath);
    const sizeKB = stats.size / 1024;

    if (sizeKB < CONFIG.minSizeKB) {
      console.log(`  ⊘ Skip ${path.basename(filePath)} (${formatBytes(stats.size)})`);
      CONFIG.stats.skipped++;
      return;
    }

    console.log(`\n📸 ${path.relative('public', filePath)}`);
    console.log(`  Original: ${formatBytes(stats.size)}`);

    await backupFile(filePath);

    const image = sharp(filePath);
    const metadata = await image.metadata();
    let pipeline = image;

    if (metadata.width > CONFIG.maxWidth || metadata.height > CONFIG.maxHeight) {
      pipeline = pipeline.resize(CONFIG.maxWidth, CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`  ↓ Resize: ${metadata.width}x${metadata.height} → max ${CONFIG.maxWidth}x${CONFIG.maxHeight}`);
    }

    let optimizedSize = 0;

    if (ext === '.png') {
      await pipeline
        .png({ quality: CONFIG.quality.png, compressionLevel: 9, adaptiveFiltering: true, palette: true })
        .toFile(filePath + '.tmp');
      await fs.rename(filePath + '.tmp', filePath);
      const newStats = await fs.stat(filePath);
      optimizedSize = newStats.size;

      const webpPath = path.join(dirName, fileName + '.webp');
      await sharp(filePath).webp({ quality: CONFIG.quality.webp, effort: 6 }).toFile(webpPath);

      const avifPath = path.join(dirName, fileName + '.avif');
      await sharp(filePath).avif({ quality: CONFIG.quality.avif, effort: 6 }).toFile(avifPath);

    } else if (['.jpg', '.jpeg'].includes(ext)) {
      await pipeline
        .jpeg({ quality: CONFIG.quality.jpeg, progressive: true, mozjpeg: true })
        .toFile(filePath + '.tmp');
      await fs.rename(filePath + '.tmp', filePath);
      const newStats = await fs.stat(filePath);
      optimizedSize = newStats.size;

      const webpPath = path.join(dirName, fileName + '.webp');
      await sharp(filePath).webp({ quality: CONFIG.quality.webp, effort: 6 }).toFile(webpPath);

      const avifPath = path.join(dirName, fileName + '.avif');
      await sharp(filePath).avif({ quality: CONFIG.quality.avif, effort: 6 }).toFile(avifPath);
    } else {
      console.log(`  ⊘ Unsupported: ${ext}`);
      CONFIG.stats.skipped++;
      return;
    }

    const savings = stats.size - optimizedSize;
    const savingsPercent = ((savings / stats.size) * 100).toFixed(1);

    console.log(`  ✓ Optimized: ${formatBytes(optimizedSize)} (saved ${formatBytes(savings)} / ${savingsPercent}%)`);
    console.log(`  ✓ WebP: ${fileName}.webp`);
    console.log(`  ✓ AVIF: ${fileName}.avif`);

    CONFIG.stats.processed++;
    CONFIG.stats.totalOriginalSize += stats.size;
    CONFIG.stats.totalOptimizedSize += optimizedSize;

  } catch (error) {
    console.error(`  ✗ Error: ${filePath}:`, error.message);
    CONFIG.stats.errors.push({ file: filePath, error: error.message });
  }
}

async function processDirectory(dir) {
  console.log(`\n📁 Processing: ${dir}`);
  const patterns = [
    path.join(dir, '**/*.png'),
    path.join(dir, '**/*.jpg'),
    path.join(dir, '**/*.jpeg')
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { nodir: true });
    files.push(...matches);
  }

  const imagesToProcess = files.filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext);
  });

  console.log(`Found ${imagesToProcess.length} images`);

  for (const file of imagesToProcess) {
    await optimizeImage(file);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log('Config:');
  console.log(`  - Quality JPEG/WebP: ${CONFIG.quality.jpeg}/${CONFIG.quality.webp}`);
  console.log(`  - Quality AVIF: ${CONFIG.quality.avif}`);
  console.log(`  - Max dimensions: ${CONFIG.maxWidth}x${CONFIG.maxHeight}px`);
  console.log(`  - Min size: ${CONFIG.minSizeKB}KB\n`);

  await fs.mkdir(CONFIG.backupDir, { recursive: true });

  for (const dir of CONFIG.inputDirs) {
    try {
      await processDirectory(dir);
    } catch (error) {
      console.error(`Error processing ${dir}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`Processed: ${CONFIG.stats.processed}`);
  console.log(`Skipped: ${CONFIG.stats.skipped}`);
  console.log(`Original size: ${formatBytes(CONFIG.stats.totalOriginalSize)}`);
  console.log(`Optimized size: ${formatBytes(CONFIG.stats.totalOptimizedSize)}`);

  if (CONFIG.stats.totalOriginalSize > 0) {
    const totalSavings = CONFIG.stats.totalOriginalSize - CONFIG.stats.totalOptimizedSize;
    const totalSavingsPercent = ((totalSavings / CONFIG.stats.totalOriginalSize) * 100).toFixed(1);
    console.log(`\n💰 TOTAL SAVINGS: ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  }

  if (CONFIG.stats.errors.length > 0) {
    console.log(`\n⚠️  Errors: ${CONFIG.stats.errors.length}`);
    CONFIG.stats.errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✅ Optimization complete!');
  console.log(`📦 Backups: ${CONFIG.backupDir}`);
}

main().catch(console.error);
