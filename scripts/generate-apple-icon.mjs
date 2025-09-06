import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT_PUBLIC = path.join(process.cwd(), 'public', 'apple-touch-icon.png');

async function ensureAppleIcon() {
  try {
    // Always (re)generate a compliant 180x180 PNG to avoid invalid icons in prod
    const size = 180;
    const png = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();

    fs.mkdirSync(path.dirname(OUT_PUBLIC), { recursive: true });
    fs.writeFileSync(OUT_PUBLIC, png);
    console.log('[icons] Generated compliant apple-touch-icon.png (180x180)');
  } catch (e) {
    console.error('[icons] Failed to generate apple-touch-icon.png:', e);
    process.exit(1);
  }
}

ensureAppleIcon();

