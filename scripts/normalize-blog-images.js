#!/usr/bin/env node
/**
 * Normalize Blog Images Script
 * Renames files with underscores to hyphens and fixes typos
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isProduction = args.includes('--production');

const SOURCE_DIR = isProduction ? '/var/www/html/Blog' : path.resolve(__dirname, '../public/Blog');

function slugify(text) {
  const map = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c', 'ñ': 'n',
  };

  return text.toLowerCase().split('').map(c => map[c] || c).join('')
    .replace(/[_\s]+/g, '-').replace(/[^a-z0-9.-]/g, '')
    .replace(/-{2,}/g, '-').replace(/^-|-$/g, '');
}

const MANUAL_FIXES = {
  'descolamente': 'descolamento',
  'genica': 'genetica',
};

function applyManualFixes(basename) {
  let fixed = basename;
  Object.entries(MANUAL_FIXES).forEach(([wrong, correct]) => {
    fixed = fixed.replace(new RegExp(wrong, 'gi'), correct);
  });
  return fixed;
}

function normalizeFilename(filename) {
  const ext = path.extname(filename);
  const basename = path.basename(filename, ext);
  const fixedBasename = applyManualFixes(basename);
  const normalized = slugify(fixedBasename);
  return normalized + ext;
}

async function main() {
  console.log('════════════════════════════════════════════════════');
  console.log('   NORMALIZE BLOG IMAGES');
  console.log('════════════════════════════════════════════════════\n');
  console.log(`Mode: ${isDryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Target: ${isProduction ? 'PRODUCTION' : 'LOCAL'}`);
  console.log(`Directory: ${SOURCE_DIR}\n`);

  const patterns = [
    `${SOURCE_DIR}/*_*.{png,jpg,jpeg,webp,avif}`,
    `${SOURCE_DIR}/*descolamente*.{png,jpg,jpeg,webp,avif}`,
    `${SOURCE_DIR}/*genica*.{png,jpg,jpeg,webp,avif}`,
  ];

  let allFiles = [];
  for (const pattern of patterns) {
    const files = await glob(pattern);
    allFiles = allFiles.concat(files);
  }
  allFiles = [...new Set(allFiles)];

  console.log(`Found ${allFiles.length} files to process\n`);

  const renames = [];

  for (const oldPath of allFiles) {
    const oldName = path.basename(oldPath);
    const newName = normalizeFilename(oldName);
    const newPath = path.join(path.dirname(oldPath), newName);

    if (oldName === newName) continue;

    try {
      await fs.access(newPath);
      console.log(`⚠️  Skip ${oldName} → ${newName} (exists)`);
      continue;
    } catch {}

    renames.push({ oldPath, newPath, oldName, newName });

    if (isDryRun) {
      console.log(`🔄 Would rename: ${oldName} → ${newName}`);
    } else {
      try {
        await fs.rename(oldPath, newPath);
        console.log(`✅ Renamed: ${oldName} → ${newName}`);
        if (isProduction) await fs.chmod(newPath, 0o755);
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log('   SUMMARY');
  console.log('════════════════════════════════════════════════════');
  console.log(`Files renamed: ${renames.length}`);
  if (isDryRun) console.log('\n⚠️  DRY RUN - No changes made');
  else if (renames.length > 0) console.log('\n✅ Normalization complete!');
  else console.log('\n✨ All files already normalized!');
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
