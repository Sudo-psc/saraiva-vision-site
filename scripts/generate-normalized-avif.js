#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../public/Blog');
const WIDTHS = [480, 768, 1280, 1920];
const QUALITY = 80;
const EFFORT = 4;

const TARGET_FILES = [
  'gym-capa.png',
  'capa-daltonismo.png',
  'futuristic-eye-examination.png',
  'terapia-genetica.png',
  'descolamento-retina-capa.png'
];

async function generateAVIF(sourcePath, basename) {
  console.log(`\n📸 Processing: ${basename}`);
  
  for (const width of WIDTHS) {
    const outputName = `${path.basename(basename, path.extname(basename))}-${width}w.avif`;
    const outputPath = path.join(SOURCE_DIR, outputName);
    
    try {
      // Check if already exists
      await fs.access(outputPath);
      console.log(`  ⏭️  Skipped ${outputName} (exists)`);
      continue;
    } catch {
      // Doesn't exist, generate it
      await sharp(sourcePath)
        .resize(width, null, { width, fit: 'inside' })
        .avif({ quality: QUALITY, effort: EFFORT })
        .toFile(outputPath);
      
      const stats = await fs.stat(outputPath);
      console.log(`  ✅ Generated ${outputName} (${(stats.size / 1024).toFixed(2)} KB)`);
    }
  }
}

async function main() {
  console.log('🚀 Generating AVIF for normalized files\n');
  
  let processed = 0;
  let generated = 0;
  
  for (const filename of TARGET_FILES) {
    const sourcePath = path.join(SOURCE_DIR, filename);
    
    try {
      await fs.access(sourcePath);
      await generateAVIF(sourcePath, filename);
      processed++;
    } catch {
      console.log(`⚠️  Source not found: ${filename}`);
    }
  }
  
  console.log('\n✅ AVIF generation complete!');
}

main().catch(console.error);
