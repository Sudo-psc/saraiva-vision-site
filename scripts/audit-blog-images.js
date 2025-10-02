#!/usr/bin/env node

/**
 * Blog Cover Images Audit Script
 * Saraiva Vision Medical Clinic
 *
 * This script audits all blog cover images to:
 * - Check which images exist vs referenced
 * - Identify missing or broken references
 * - Analyze image quality and dimensions
 * - Check file sizes and formats
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog image references from blogPosts.js
const referencedImages = [
  '/Blog/capa-amaurose-congenita-leber.png',
  '/Blog/olhinho.png',
  '/Blog/retinose-pigmentar.png',
  '/Blog/capa-moscas-volantes.png',
  '/Blog/capa-cuidados-visuais-esportes.png',
  '/Blog/capa-lentes-daltonismo.png',
  '/Blog/capa-descolamento-retina.png',
  '/Blog/futuristic-eye-examination.png',
  '/Blog/descolamento-retina-capa.png',
  '/Blog/pterigio-capa.png',
  '/Blog/capa-digital.png',
  '/Blog/capa_post_10_imagen4_opt1_20251001_095940.png',
  '/Blog/capa-estrabismo-tratamento.png',
  '/Blog/capa-alimentacao-microbioma-ocular.png',
  '/Blog/capa-sensibilidade-luz-fotofobia.png',
  '/Blog/capa-post-6-imagen4-opt1-20250930-184946.png',
  '/Blog/capa-post-23-imagen4-opt1-20250930-185601.png',
  '/Blog/capa_post_1_imagen4_opt1_20251001_100736.png',
  '/Blog/capa-exercicios-oculares.png',
  '/Blog/capa-ductolacrimal.png',
  '/Blog/capa-lentes-premium-catarata.png',
  '/Blog/capa-pediatria.png',
  '/Blog/capa-post-24-imagen4-opt1-20250930-185815.png'
];

const blogDir = path.join(__dirname, '../public/Blog');

function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return {
      exists: true,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024 * 100) / 100,
      extension: ext,
      format: ext.replace('.', '').toUpperCase(),
      lastModified: stats.mtime
    };
  } catch (error) {
    return { exists: false, error: error.code };
  }
}

function analyzeImageDirectory() {
  console.log('🔍 SARAIVA VISION - BLOG COVER IMAGES AUDIT\n');
  console.log('=' .repeat(60));

  const existingFiles = fs.readdirSync(blogDir)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.avif', '.webp'].includes(ext);
    })
    .sort();

  console.log(`📁 Total image files in directory: ${existingFiles.length}`);
  console.log(`📝 Total referenced images: ${referencedImages.length}`);
  console.log('');

  // Check each referenced image
  const auditResults = [];
  let missingImages = [];
  let largeImages = [];
  let oversizedImages = [];

  referencedImages.forEach((ref, index) => {
    const fileName = path.basename(ref);
    const fullPath = path.join(blogDir, fileName);
    const stats = getFileStats(fullPath);

    const result = {
      reference: ref,
      fileName: fileName,
      ...stats
    };

    auditResults.push(result);

    if (!stats.exists) {
      missingImages.push(result);
    } else if (stats.sizeKB > 500) {
      largeImages.push(result);
      if (stats.sizeKB > 1000) {
        oversizedImages.push(result);
      }
    }
  });

  // Display results
  console.log('📊 AUDIT RESULTS:');
  console.log('-'.repeat(60));

  // Missing images
  if (missingImages.length > 0) {
    console.log(`\n❌ MISSING IMAGES (${missingImages.length}):`);
    missingImages.forEach(img => {
      console.log(`   ❌ ${img.fileName} - Referenced but not found`);
    });
  } else {
    console.log('\n✅ All referenced images found!');
  }

  // Large images
  if (largeImages.length > 0) {
    console.log(`\n⚠️  LARGE IMAGES (>500KB) (${largeImages.length}):`);
    largeImages.forEach(img => {
      console.log(`   ⚠️  ${img.fileName} - ${img.sizeKB}KB (${img.format})`);
    });
  }

  // Oversized images
  if (oversizedImages.length > 0) {
    console.log(`\n🚨 OVERSIZED IMAGES (>1MB) (${oversizedImages.length}):`);
    oversizedImages.forEach(img => {
      console.log(`   🚨 ${img.fileName} - ${img.sizeKB}KB (${img.format})`);
    });
  }

  // Format analysis
  console.log('\n📈 FORMAT ANALYSIS:');
  const formatCounts = {};
  auditResults.forEach(img => {
    if (img.exists) {
      formatCounts[img.format] = (formatCounts[img.format] || 0) + 1;
    }
  });

  Object.entries(formatCounts).forEach(([format, count]) => {
    console.log(`   ${format}: ${count} images`);
  });

  // Size analysis
  const existingImages = auditResults.filter(img => img.exists);
  if (existingImages.length > 0) {
    const totalSize = existingImages.reduce((sum, img) => sum + img.sizeKB, 0);
    const avgSize = totalSize / existingImages.length;
    console.log(`\n📏 SIZE ANALYSIS:`);
    console.log(`   Total size: ${Math.round(totalSize)}KB`);
    console.log(`   Average size: ${Math.round(avgSize)}KB`);
  }

  // Orphaned files (files not referenced)
  const referencedNames = new Set(referencedImages.map(ref => path.basename(ref)));
  const orphanedFiles = existingFiles.filter(file => !referencedNames.has(file));

  if (orphanedFiles.length > 0) {
    console.log(`\n🗑️  ORPHANED FILES (${orphanedFiles.length}):`);
    orphanedFiles.slice(0, 10).forEach(file => {
      const stats = getFileStats(path.join(blogDir, file));
      console.log(`   🗑️  ${file} - ${stats.sizeKB}KB`);
    });
    if (orphanedFiles.length > 10) {
      console.log(`   ... and ${orphanedFiles.length - 10} more files`);
    }
  }

  // Summary
  console.log('\n📋 SUMMARY:');
  console.log(`   ✅ Referenced images found: ${auditResults.filter(r => r.exists).length}/${referencedImages.length}`);
  console.log(`   ❌ Missing images: ${missingImages.length}`);
  console.log(`   ⚠️  Large images (>500KB): ${largeImages.length}`);
  console.log(`   🚨 Oversized images (>1MB): ${oversizedImages.length}`);
  console.log(`   🗑️  Orphaned files: ${orphanedFiles.length}`);

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (missingImages.length > 0) {
    console.log('   🔧 Generate missing cover images');
  }
  if (largeImages.length > 0) {
    console.log('   🗜️  Optimize large images for web performance');
  }
  if (orphanedFiles.length > 0) {
    console.log('   🧹 Clean up orphaned files or add proper references');
  }

  return {
    auditResults,
    missingImages,
    largeImages,
    oversizedImages,
    orphanedFiles
  };
}

// Run the audit
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const results = analyzeImageDirectory();

    // Exit with error code if there are missing images
    if (results.missingImages.length > 0) {
      console.log('\n❌ Audit completed with issues found.');
      process.exit(1);
    } else {
      console.log('\n✅ Audit completed successfully!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running audit:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeImageDirectory, getFileStats };