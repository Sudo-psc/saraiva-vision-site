#!/usr/bin/env node
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '../public/Blog');
const SIZE = 1920;

const files = await readdir(BLOG_DIR);
const pngs = files.filter(f => f.endsWith('.png'));

let count = 0;

for (const png of pngs) {
  const base = png.replace('.png', '');
  const avif = `${base}-${SIZE}w.avif`;
  const avifPath = join(BLOG_DIR, avif);
  
  try {
    await stat(avifPath);
  } catch {
    const pngPath = join(BLOG_DIR, png);
    try {
      await sharp(pngPath)
        .resize(SIZE, null, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 80, effort: 4 })
        .toFile(avifPath);
      const s = await stat(avifPath);
      console.log(`✅ ${avif} (${(s.size/1024).toFixed(2)} KB)`);
      count++;
    } catch (e) {
      console.error(`❌ ${avif}: ${e.message}`);
    }
  }
}

console.log(`\n✅ Generated ${count} files`);
