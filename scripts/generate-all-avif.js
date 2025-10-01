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

async function generateAVIF(sourcePath, basename) {
  console.log(`\n📸 Processing: ${basename}`);

  const baseNameNoExt = path.basename(basename, path.extname(basename));
  let anyGenerated = false;

  for (const width of WIDTHS) {
    const outputName = `${baseNameNoExt}-${width}w.avif`;
    const outputPath = path.join(SOURCE_DIR, outputName);

    try {
      // Check if already exists
      await fs.access(outputPath);
      console.log(`  ⏭️  Skipped ${outputName} (exists)`);
    } catch {
      // Doesn't exist, generate it
      try {
        await sharp(sourcePath)
          .resize(width, null, { width, fit: 'inside' })
          .avif({ quality: QUALITY, effort: EFFORT })
          .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        console.log(`  ✅ Generated ${outputName} (${(stats.size / 1024).toFixed(2)} KB)`);
        anyGenerated = true;
      } catch (error) {
        console.log(`  ❌ Failed ${outputName}: ${error.message}`);
      }
    }
  }

  return anyGenerated;
}

async function main() {
  console.log('🚀 Generating AVIF for ALL PNG files without AVIF\n');

  let processed = 0;
  let generated = 0;
  let skipped = 0;

  // Read all PNG files
  const files = await fs.readdir(SOURCE_DIR);
  const pngFiles = files.filter(f => f.endsWith('.png'));

  console.log(`Found ${pngFiles.length} PNG files\n`);

  for (const filename of pngFiles) {
    const sourcePath = path.join(SOURCE_DIR, filename);
    const baseNameNoExt = path.basename(filename, '.png');

    // Check if at least one AVIF variant exists
    const avifExists = await Promise.any(
      WIDTHS.map(async (w) => {
        try {
          await fs.access(path.join(SOURCE_DIR, `${baseNameNoExt}-${w}w.avif`));
          return true;
        } catch {
          return false;
        }
      })
    ).catch(() => false);

    if (avifExists) {
      skipped++;
      continue;
    }

    try {
      const wasGenerated = await generateAVIF(sourcePath, filename);
      processed++;
      if (wasGenerated) generated++;
    } catch (error) {
      console.log(`⚠️  Error processing ${filename}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ AVIF generation complete!');
  console.log(`📊 Total PNG files: ${pngFiles.length}`);
  console.log(`✅ Processed: ${processed}`);
  console.log(`🆕 Generated: ${generated}`);
  console.log(`⏭️  Skipped (already have AVIF): ${skipped}`);
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);
