#!/usr/bin/env node

import { readdir, stat, mkdir, writeFile } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Configuration
const CONFIG = {
  srcDir: join(projectRoot, 'public/images/src'),
  outputDir: join(projectRoot, 'public/images'),
  formats: {
    webp: {
      quality: 75,
      effort: 6,
      nearLossless: false
    },
    avif: {
      quality: 50,
      effort: 4,
      speed: 5
    }
  },
  sizes: [320, 640, 960, 1280, 1920],
  supportedInputs: ['.jpg', '.jpeg', '.png', '.webp'],
  removeMetadata: true
};

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Process a single image with Sharp
 */
async function processImageWithSharp(inputPath, outputPath, format, width, quality) {
  try {
    let pipeline = sharp(inputPath)
      .resize(width, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });

    // Remove metadata if configured
    if (CONFIG.removeMetadata) {
      pipeline = pipeline.withMetadata(false);
    }

    if (format === 'webp') {
      pipeline = pipeline.webp({
        quality: quality || CONFIG.formats.webp.quality,
        effort: CONFIG.formats.webp.effort,
        nearLossless: CONFIG.formats.webp.nearLossless
      });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({
        quality: quality || CONFIG.formats.avif.quality,
        effort: CONFIG.formats.avif.effort,
        speed: CONFIG.formats.avif.speed
      });
    }

    await pipeline.toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error processing ${inputPath} with Sharp:`, error.message);
    return false;
  }
}

/**
 * Optimize image with imagemin (fallback)
 */
async function optimizeWithImagemin(inputPath, outputDir, format) {
  try {
    const plugins = [];
    
    if (format === 'webp') {
      plugins.push(imageminWebp({
        quality: CONFIG.formats.webp.quality,
        method: 6
      }));
    }

    if (plugins.length === 0) return false;

    const files = await imagemin([inputPath], {
      destination: outputDir,
      plugins
    });

    return files.length > 0;
  } catch (error) {
    console.error(`Error optimizing ${inputPath} with imagemin:`, error.message);
    return false;
  }
}

/**
 * Get adaptive quality based on file size and format
 */
function getAdaptiveQuality(fileSize, format, width) {
  const sizeMB = fileSize / (1024 * 1024);
  
  if (format === 'avif') {
    // AVIF: 45-60 quality range
    if (sizeMB > 2) return Math.max(45, 55 - Math.floor(width / 400));
    if (sizeMB > 1) return Math.max(50, 60 - Math.floor(width / 400));
    return Math.min(60, 50 + Math.floor(width / 600));
  } else if (format === 'webp') {
    // WebP: 70-80 quality range
    if (sizeMB > 2) return Math.max(70, 75 - Math.floor(width / 400));
    if (sizeMB > 1) return Math.max(72, 80 - Math.floor(width / 400));
    return Math.min(80, 72 + Math.floor(width / 600));
  }
  
  return CONFIG.formats[format]?.quality || 75;
}

/**
 * Process single image file
 */
async function processImage(inputPath, stats) {
  const filename = basename(inputPath, extname(inputPath));
  const inputExt = extname(inputPath).toLowerCase();
  
  if (!CONFIG.supportedInputs.includes(inputExt)) {
    console.log(`⏭️ Skipping unsupported format: ${inputPath}`);
    return { processed: 0, originalSize: 0, totalSize: 0 };
  }

  console.log(`🖼️ Processing: ${basename(inputPath)} (${formatBytes(stats.size)})`);
  
  let totalOutputSize = 0;
  let processedCount = 0;

  for (const format of ['webp', 'avif']) {
    for (const width of CONFIG.sizes) {
      const outputFilename = `${filename}-${width}w.${format}`;
      const outputPath = join(CONFIG.outputDir, outputFilename);
      
      // Create output directory if it doesn't exist
      await mkdir(dirname(outputPath), { recursive: true });
      
      // Get adaptive quality
      const quality = getAdaptiveQuality(stats.size, format, width);
      
      // Try Sharp first, fallback to imagemin for WebP
      let success = await processImageWithSharp(inputPath, outputPath, format, width, quality);
      
      if (!success && format === 'webp') {
        console.log(`  📦 Fallback to imagemin for ${outputFilename}`);
        success = await optimizeWithImagemin(inputPath, dirname(outputPath), format);
      }
      
      if (success) {
        const outputSize = await getFileSize(outputPath);
        totalOutputSize += outputSize;
        processedCount++;
        
        const reductionPercent = Math.round(((stats.size - outputSize) / stats.size) * 100);
        console.log(`  ✅ ${outputFilename} (${formatBytes(outputSize)}, ${reductionPercent}% reduction)`);
      } else {
        console.log(`  ❌ Failed to create ${outputFilename}`);
      }
    }
  }

  return {
    processed: processedCount,
    originalSize: stats.size,
    totalSize: totalOutputSize
  };
}

/**
 * Process all images in source directory
 */
async function processAllImages() {
  console.log('🚀 Starting image optimization pipeline...\n');
  
  let files;
  try {
    files = await readdir(CONFIG.srcDir);
  } catch (error) {
    console.error(`❌ Cannot read source directory: ${CONFIG.srcDir}`);
    console.error('   Please create the directory and add images to process.');
    process.exit(1);
  }

  const imageFiles = files.filter(file => 
    CONFIG.supportedInputs.includes(extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    console.log(`📂 No supported images found in ${CONFIG.srcDir}`);
    console.log(`   Supported formats: ${CONFIG.supportedInputs.join(', ')}`);
    return;
  }

  console.log(`📋 Found ${imageFiles.length} image(s) to process:`);
  imageFiles.forEach(file => console.log(`  • ${file}`));
  console.log();

  let totalOriginalSize = 0;
  let totalOutputSize = 0;
  let totalProcessed = 0;

  // Ensure output directory exists
  await mkdir(CONFIG.outputDir, { recursive: true });

  // Process each image
  for (const file of imageFiles) {
    const inputPath = join(CONFIG.srcDir, file);
    const stats = await stat(inputPath);
    
    const result = await processImage(inputPath, stats);
    totalOriginalSize += result.originalSize;
    totalOutputSize += result.totalSize;
    totalProcessed += result.processed;
    
    console.log(); // Empty line between files
  }

  // Summary
  console.log('📊 Processing Summary:');
  console.log(`   Images processed: ${imageFiles.length}`);
  console.log(`   Variants created: ${totalProcessed}`);
  console.log(`   Original total size: ${formatBytes(totalOriginalSize)}`);
  console.log(`   Optimized total size: ${formatBytes(totalOutputSize)}`);
  
  if (totalOriginalSize > 0) {
    const reductionPercent = Math.round(((totalOriginalSize - totalOutputSize) / totalOriginalSize) * 100);
    console.log(`   Total reduction: ${reductionPercent}%`);
    
    if (reductionPercent >= 50) {
      console.log('   ✅ Target reduction achieved (≥50%)');
    } else {
      console.log('   ⚠️ Target reduction not achieved (<50%)');
    }
  }

  // Create manifest file
  const manifest = {
    timestamp: new Date().toISOString(),
    processedFiles: imageFiles.length,
    variantsCreated: totalProcessed,
    originalSize: totalOriginalSize,
    optimizedSize: totalOutputSize,
    reductionPercent: Math.round(((totalOriginalSize - totalOutputSize) / totalOriginalSize) * 100),
    config: CONFIG
  };

  await writeFile(
    join(CONFIG.outputDir, 'optimization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('\n✨ Image optimization pipeline completed!');
}

/**
 * Check if images need processing
 */
async function checkImages() {
  console.log('🔍 Checking image optimization status...\n');
  
  let files;
  try {
    files = await readdir(CONFIG.srcDir);
  } catch (error) {
    console.error(`❌ Source directory not found: ${CONFIG.srcDir}`);
    process.exit(1);
  }

  const imageFiles = files.filter(file => 
    CONFIG.supportedInputs.includes(extname(file).toLowerCase())
  );

  if (imageFiles.length === 0) {
    console.log('✅ No images to check');
    return;
  }

  let missingVariants = 0;
  let totalVariants = 0;

  for (const file of imageFiles) {
    const filename = basename(file, extname(file));
    console.log(`📸 Checking: ${file}`);
    
    for (const format of ['webp', 'avif']) {
      for (const width of CONFIG.sizes) {
        const variantName = `${filename}-${width}w.${format}`;
        const variantPath = join(CONFIG.outputDir, variantName);
        
        totalVariants++;
        const size = await getFileSize(variantPath);
        
        if (size === 0) {
          console.log(`  ❌ Missing: ${variantName}`);
          missingVariants++;
        } else {
          console.log(`  ✅ Found: ${variantName} (${formatBytes(size)})`);
        }
      }
    }
    console.log();
  }

  console.log('📋 Check Summary:');
  console.log(`   Total expected variants: ${totalVariants}`);
  console.log(`   Missing variants: ${missingVariants}`);

  if (missingVariants > 0) {
    console.log('\n❌ Some image variants are missing. Run "npm run images:build" to generate them.');
    process.exit(1);
  } else {
    console.log('\n✅ All image variants are present.');
  }
}

// CLI handling
const command = process.argv[2];

if (command === 'check') {
  checkImages().catch(console.error);
} else {
  processAllImages().catch(console.error);
}