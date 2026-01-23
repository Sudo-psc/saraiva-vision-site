
#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const INPUT_FILE = 'icone_olho_seco.tiff';

async function convertTiffToJpeg() {
  const inputFile = path.join(PUBLIC_DIR, INPUT_FILE);
  const outputFile = path.join(PUBLIC_DIR, path.basename(INPUT_FILE, '.tiff') + '.jpeg');

  try {
    const stats = await fs.stat(inputFile);
    if (!stats.isFile()) {
        console.log(`Input is not a file: ${inputFile}`);
        return;
    }
    
    await sharp(inputFile)
      .jpeg({ quality: 90 })
      .toFile(outputFile);
    console.log(`Successfully converted ${inputFile} to ${outputFile}`);
  } catch (error) {
    console.error('Error converting image:', error);
  }
}

convertTiffToJpeg();
