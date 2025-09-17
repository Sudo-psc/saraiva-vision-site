#!/usr/bin/env node
import { writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outSvgPath = join(__dirname, '..', 'public', 'images', 'src', 'catarata_cover.svg');
const outPngPath = join(__dirname, '..', 'public', 'images', 'src', 'catarata_cover.png');
const outOgPngPath = join(__dirname, '..', 'public', 'images', 'catarata_cover-og-1200x630.png');

const width = 1600; // good base for responsive derivatives
const height = 900; // 16:9

const title = 'Catarata: Guia Completo';
const subtitle = 'Sintomas • Tratamento • Cirurgia • Lentes';
const brand = 'Saraiva Vision';

// Accessible color choices (WCAG contrast against gradient)
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Capa do artigo sobre catarata: guia completo">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>

  <!-- Abstract eye shape -->
  <g transform="translate(${width/2}, ${height/2 + 40}) scale(1.1)" opacity="0.12">
    <ellipse cx="0" cy="0" rx="520" ry="220" fill="#fff"/>
    <ellipse cx="0" cy="0" rx="380" ry="160" fill="none" stroke="#fff" stroke-width="6"/>
    <circle cx="0" cy="0" r="90" fill="#0ea5e9"/>
    <circle cx="0" cy="0" r="46" fill="#0b658a"/>
  </g>

  <!-- Title -->
  <g filter="url(#softShadow)">
    <text x="80" y="360" fill="#ffffff" font-family="'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="88" font-weight="800" letter-spacing="0.5" style="paint-order: stroke; stroke: rgba(0,0,0,0.2); stroke-width: 1.5;">
      ${title}
    </text>
    <text x="80" y="430" fill="#e2e8f0" font-family="'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="32" font-weight="600">
      ${subtitle}
    </text>
  </g>

  <!-- Brand -->
  <text x="80" y="820" fill="#bfdbfe" font-family="'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="28" font-weight="700">${brand}</text>
  <text x="${width-80}" y="820" fill="#cbd5e1" font-family="'Inter', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="600" text-anchor="end">2025</text>
</svg>`;

// Write SVG and PNG
await writeFile(outSvgPath, svg, 'utf8');
const png = await sharp(Buffer.from(svg)).png({ quality: 92 }).toBuffer();
await writeFile(outPngPath, png);
// Create OG size 1200x630 (cover crop)
await sharp(png)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png({ quality: 90 })
  .toFile(outOgPngPath);
console.log(`✅ Generated cover: \n - ${outSvgPath}\n - ${outPngPath}\n - ${outOgPngPath}`);
