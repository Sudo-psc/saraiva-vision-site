#!/usr/bin/env node
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../public/Blog');
const QUALITY = 80;
const EFFORT = 4;

const sourceFile = 'capa_post_10_imagen4_opt1_20251001_095940.png';
const targetBaseName = 'capa-post-10-imagen4-opt1-20251001-095940';

const widths = [480, 768, 1280, 1920];

async function generateAVIF(sourceName, targetBase, width) {
  const sourcePath = path.join(SOURCE_DIR, sourceName);
  const outputName = `${targetBase}-${width}w.avif`;
  const outputPath = path.join(SOURCE_DIR, outputName);

  try {
    await sharp(sourcePath)
      .resize(width, null, { fit: 'inside' })
      .avif({ quality: QUALITY, effort: EFFORT })
      .toFile(outputPath);

    console.log(`✅ Generated ${outputName}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed ${outputName}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Generating post-10 AVIF files with correct naming\n');

  for (const width of widths) {
    await generateAVIF(sourceFile, targetBaseName, width);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
