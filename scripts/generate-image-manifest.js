#!/usr/bin/env node
/**
 * Generate Image Manifest
 * Scans /public/Blog for available image variants and creates manifest.json
 * This ensures OptimizedImage only generates srcsets for existing files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '../public/Blog');
const MANIFEST_PATH = path.join(__dirname, '../public/image-manifest.json');

const RESPONSIVE_SIZES = [480, 768, 1280, 1920];
const FORMATS = ['avif', 'webp', 'png', 'jpg', 'jpeg'];

/**
 * Get base filename without extension
 */
function getBasename(filename) {
  const ext = path.extname(filename);
  return path.basename(filename, ext);
}

/**
 * Check if file is a responsive variant (e.g., filename-480w.avif)
 */
function isResponsiveVariant(filename) {
  return /-(480w|768w|1280w|1920w)\.(avif|webp|png|jpe?g)$/.test(filename);
}

/**
 * Parse responsive variant details
 */
function parseVariant(filename) {
  const match = filename.match(/^(.+)-(480w|768w|1280w|1920w)\.(avif|webp|png|jpe?g)$/);
  if (!match) return null;

  return {
    basename: match[1],
    size: parseInt(match[2]),
    format: match[3]
  };
}

/**
 * Scan directory for images
 */
function scanImages() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`❌ Blog directory not found: ${BLOG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(BLOG_DIR);
  const manifest = {};

  // First pass: identify base images
  files.forEach(filename => {
    if (isResponsiveVariant(filename)) return; // Skip variants for now

    const ext = path.extname(filename).toLowerCase();
    if (!FORMATS.some(fmt => ext === `.${fmt}`)) return;

    const basename = getBasename(filename);
    if (!manifest[basename]) {
      manifest[basename] = {
        original: filename,
        path: `/Blog/${filename}`,
        variants: {
          avif: [],
          webp: [],
          png: [],
          jpg: []
        }
      };
    }
  });

  // Second pass: map variants to base images
  files.forEach(filename => {
    if (!isResponsiveVariant(filename)) return;

    const variant = parseVariant(filename);
    if (!variant) return;

    if (manifest[variant.basename]) {
      const format = variant.format === 'jpeg' ? 'jpg' : variant.format;
      if (!manifest[variant.basename].variants[format]) {
        manifest[variant.basename].variants[format] = [];
      }
      manifest[variant.basename].variants[format].push(variant.size);
    }
  });

  // Sort variant sizes
  Object.keys(manifest).forEach(basename => {
    Object.keys(manifest[basename].variants).forEach(format => {
      manifest[basename].variants[format].sort((a, b) => a - b);
    });
  });

  return manifest;
}

/**
 * Generate statistics
 */
function generateStats(manifest) {
  const stats = {
    totalImages: Object.keys(manifest).length,
    withAvif: 0,
    withWebp: 0,
    withoutVariants: 0,
    incompleteVariants: [],
    warnings: []
  };

  Object.entries(manifest).forEach(([basename, data]) => {
    const hasAvif = data.variants.avif.length > 0;
    const hasWebp = data.variants.webp.length > 0;
    const hasNoVariants = data.variants.avif.length === 0 && data.variants.webp.length === 0;

    if (hasAvif) stats.withAvif++;
    if (hasWebp) stats.withWebp++;
    if (hasNoVariants) {
      stats.withoutVariants++;
      stats.warnings.push(`⚠️  ${basename}: No AVIF/WebP variants found`);
    }

    // Check for incomplete sets
    const expectedSizes = RESPONSIVE_SIZES.filter(size => size <= 1280); // Only check up to 1280
    ['avif', 'webp'].forEach(format => {
      const available = data.variants[format];
      const missing = expectedSizes.filter(size => !available.includes(size));
      if (available.length > 0 && missing.length > 0) {
        stats.incompleteVariants.push({
          basename,
          format,
          missing
        });
      }
    });
  });

  return stats;
}

/**
 * Validate typos and inconsistencies
 */
function validateNames(manifest) {
  const issues = [];
  const basenames = Object.keys(manifest);

  // Common typos
  const typoPatterns = [
    { wrong: 'descolamente', correct: 'descolamento' },
    { wrong: 'retina_capa', correct: 'capa_retina' },
  ];

  basenames.forEach(basename => {
    typoPatterns.forEach(({ wrong, correct }) => {
      if (basename.includes(wrong)) {
        issues.push({
          type: 'typo',
          basename,
          suggestion: basename.replace(wrong, correct),
          message: `Possible typo: "${wrong}" should be "${correct}"`
        });
      }
    });

    // Check for spaces in filenames
    if (manifest[basename].original.includes(' ')) {
      issues.push({
        type: 'spaces',
        basename,
        filename: manifest[basename].original,
        message: 'Filename contains spaces - may cause URL encoding issues'
      });
    }

    // Check for inconsistent naming (mixed separators)
    if (basename.includes('_') && basename.includes('-')) {
      issues.push({
        type: 'mixed_separators',
        basename,
        message: 'Mixed underscores and hyphens in filename'
      });
    }
  });

  return issues;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Scanning /public/Blog for images...\n');

  const manifest = scanImages();
  const stats = generateStats(manifest);
  const issues = validateNames(manifest);

  // Write manifest
  fs.writeFileSync(
    MANIFEST_PATH,
    JSON.stringify({ manifest, stats, issues, generated: new Date().toISOString() }, null, 2)
  );

  // Output report
  console.log('📊 Image Manifest Generated\n');
  console.log(`✅ Total images: ${stats.totalImages}`);
  console.log(`🎨 With AVIF variants: ${stats.withAvif} (${Math.round(stats.withAvif / stats.totalImages * 100)}%)`);
  console.log(`🖼️  With WebP variants: ${stats.withWebp} (${Math.round(stats.withWebp / stats.totalImages * 100)}%)`);
  console.log(`⚠️  Without modern variants: ${stats.withoutVariants}\n`);

  if (stats.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    stats.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }

  if (stats.incompleteVariants.length > 0) {
    console.log('📋 Incomplete Variant Sets:');
    stats.incompleteVariants.forEach(({ basename, format, missing }) => {
      console.log(`   ${basename} (${format}): missing ${missing.join(', ')}w`);
    });
    console.log('');
  }

  if (issues.length > 0) {
    console.log('🚨 Naming Issues:');
    issues.forEach(issue => {
      console.log(`   [${issue.type}] ${issue.basename}: ${issue.message}`);
      if (issue.suggestion) {
        console.log(`      → Suggested fix: ${issue.suggestion}`);
      }
    });
    console.log('');
  }

  console.log(`✅ Manifest written to: ${MANIFEST_PATH}\n`);

  // Exit with error if critical issues found
  const criticalIssues = issues.filter(i => i.type === 'typo');
  if (criticalIssues.length > 0) {
    console.error('❌ Critical naming issues detected. Please fix typos before deploying.');
    process.exit(1);
  }
}

main();
