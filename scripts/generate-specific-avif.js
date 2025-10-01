#!/usr/bin/env node
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, '../public/Blog');
const QUALITY = 80;
const EFFORT = 4;

const images = [
  { source: 'capa-catarata.png', width: 1280 },
  { source: 'capa-catarata.png', width: 1920 },
  { source: 'capa-digital.png', width: 1280 },
  { source: 'capa-digital.png', width: 1920 }
];

async function generateAVIF(sourceName, width) {
  const sourcePath = path.join(SOURCE_DIR, sourceName);
  const baseNameNoExt = path.basename(sourceName, path.extname(sourceName));
  const outputName = `${baseNameNoExt}-${width}w.avif`;
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
  console.log('🚀 Generating missing 1280w and 1920w AVIF files\n');

  for (const { source, width } of images) {
    await generateAVIF(source, width);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
