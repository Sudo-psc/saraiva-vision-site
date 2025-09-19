#!/usr/bin/env node

/**
 * Saraiva Vision Logo Generator
 * Cria um logo PNG simples como fallback para a clínica
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG logo
const svgLogo = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="200" height="60" fill="#ffffff" stroke="#3B82F6" stroke-width="2"/>

  <!-- Eye icon (representing ophthalmology) -->
  <g transform="translate(20, 15)">
    <ellipse cx="15" cy="15" rx="15" ry="10" fill="none" stroke="#3B82F6" stroke-width="2"/>
    <circle cx="15" cy="15" r="6" fill="#1E40AF"/>
    <circle cx="17" cy="13" r="2" fill="#ffffff"/>
  </g>

  <!-- Text -->
  <text x="50" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#1E40AF">
    SARAIVA
  </text>
  <text x="50" y="42" font-family="Arial, sans-serif" font-size="12" fill="#3B82F6">
    VISION
  </text>
</svg>`;

// Convert SVG to PNG data URL (simple approach)
const createPngLogo = () => {
  // For now, create a simple PNG header with minimal data
  // This creates a 1x1 transparent PNG as fallback
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x1D, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, // compressed data
    0x00, 0x00, 0x00, 0x00, // CRC
    0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);

  return pngData;
};

// Write logo files
const outputPath = '/var/www/saraivavision/current/';
const logoPngPath = path.join(outputPath, 'logo.png');
const logoSvgPath = path.join(outputPath, 'logo.svg');

try {
  // Write SVG logo
  fs.writeFileSync(logoSvgPath, svgLogo);
  console.log(`✅ SVG logo created: ${logoSvgPath}`);

  // Write PNG fallback
  const pngData = createPngLogo();
  fs.writeFileSync(logoPngPath, pngData);
  console.log(`✅ PNG fallback logo created: ${logoPngPath}`);

  // Set proper permissions
  fs.chmodSync(logoPngPath, 0o644);
  fs.chmodSync(logoSvgPath, 0o644);

  console.log('✅ Logo files created successfully for Saraiva Vision');
  console.log('📁 SVG: Professional logo with eye icon');
  console.log('📁 PNG: Fallback transparent PNG');

} catch (error) {
  console.error('❌ Error creating logo files:', error.message);
  process.exit(1);
}