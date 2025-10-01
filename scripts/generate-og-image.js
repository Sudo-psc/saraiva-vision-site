#!/usr/bin/env node
/**
 * Generate OpenGraph Image (1200x630)
 * Saraiva Vision - Clínica Oftalmológica
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIDTH = 1200;
const HEIGHT = 630;

async function generateOGImage() {
  console.log('🎨 Gerando imagem OpenGraph 1200x630...');

  try {
    // Criar background com gradiente (usando overlay)
    const background = await sharp({
      create: {
        width: WIDTH,
        height: HEIGHT,
        channels: 4,
        background: { r: 0, g: 87, b: 183, alpha: 1 } // #0057B7 (azul Saraiva Vision)
      }
    })
    .png()
    .toBuffer();

    // Criar SVG com texto e design
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <!-- Gradiente de fundo -->
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0057B7;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#003d82;stop-opacity:1" />
          </linearGradient>

          <!-- Padrão de círculos (decoração) -->
          <pattern id="circles" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="30" fill="rgba(255,255,255,0.05)" />
          </pattern>
        </defs>

        <!-- Background com gradiente -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad1)" />

        <!-- Padrão decorativo -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#circles)" />

        <!-- Linha decorativa superior -->
        <rect x="0" y="0" width="${WIDTH}" height="8" fill="rgba(255,255,255,0.2)" />

        <!-- Linha decorativa inferior -->
        <rect x="0" y="${HEIGHT - 8}" width="${WIDTH}" height="8" fill="rgba(255,255,255,0.2)" />

        <!-- Container de conteúdo -->
        <g>
          <!-- Logo placeholder (círculo branco) -->
          <circle cx="600" cy="180" r="80" fill="white" opacity="0.95" />
          <circle cx="600" cy="180" r="70" fill="none" stroke="#0057B7" stroke-width="3" />

          <!-- Ícone de olho simplificado dentro do círculo -->
          <ellipse cx="600" cy="180" rx="45" ry="25" fill="none" stroke="#0057B7" stroke-width="3" />
          <circle cx="600" cy="180" r="12" fill="#0057B7" />
          <circle cx="600" cy="180" r="6" fill="white" />

          <!-- Título principal -->
          <text
            x="600"
            y="320"
            font-family="Arial, Helvetica, sans-serif"
            font-size="52"
            font-weight="bold"
            fill="white"
            text-anchor="middle"
          >
            Saraiva Vision
          </text>

          <!-- Subtítulo -->
          <text
            x="600"
            y="380"
            font-family="Arial, Helvetica, sans-serif"
            font-size="32"
            font-weight="normal"
            fill="rgba(255,255,255,0.95)"
            text-anchor="middle"
          >
            Clínica Oftalmológica
          </text>

          <!-- Linha divisória -->
          <line x1="400" y1="410" x2="800" y2="410" stroke="rgba(255,255,255,0.4)" stroke-width="2" />

          <!-- Informações -->
          <text
            x="600"
            y="460"
            font-family="Arial, Helvetica, sans-serif"
            font-size="26"
            font-weight="normal"
            fill="rgba(255,255,255,0.9)"
            text-anchor="middle"
          >
            Dr. Philipe Saraiva • CRM-MG 69.870
          </text>

          <!-- Localização -->
          <text
            x="600"
            y="500"
            font-family="Arial, Helvetica, sans-serif"
            font-size="24"
            font-weight="normal"
            fill="rgba(255,255,255,0.85)"
            text-anchor="middle"
          >
            📍 Caratinga/MG
          </text>

          <!-- Call to action -->
          <text
            x="600"
            y="560"
            font-family="Arial, Helvetica, sans-serif"
            font-size="22"
            font-weight="600"
            fill="rgba(255,255,255,0.95)"
            text-anchor="middle"
            letter-spacing="1"
          >
            saraivavision.com.br
          </text>
        </g>
      </svg>
    `;

    // Gerar imagem final
    const outputPath = join(__dirname, '../public/og-image-1200x630.jpg');

    await sharp(Buffer.from(svg))
      .resize(WIDTH, HEIGHT)
      .jpeg({ quality: 90, progressive: true })
      .toFile(outputPath);

    console.log('✅ Imagem OpenGraph gerada com sucesso!');
    console.log(`📁 Localização: ${outputPath}`);
    console.log(`📏 Dimensões: ${WIDTH}x${HEIGHT}px`);
    console.log(`🎨 Formato: JPEG (qualidade 90%)`);

    // Verificar tamanho do arquivo
    const stats = await import('fs/promises').then(fs => fs.stat(outputPath));
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`💾 Tamanho: ${sizeKB} KB`);

    if (stats.size > 1024 * 1024) {
      console.warn('⚠️  Aviso: Imagem > 1MB. Recomendado: < 300KB para melhor performance');
    }

  } catch (error) {
    console.error('❌ Erro ao gerar imagem:', error);
    process.exit(1);
  }
}

// Executar
generateOGImage();
