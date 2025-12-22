#!/usr/bin/env node
/**
 * Generate sitemap.xml for Saraiva Vision
 * Author: Dr. Philipe Saraiva Cruz
 *
 * This script generates a sitemap.xml based on the routes defined in the application.
 * It should be run after the build process to ensure all routes are included.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://saraivavision.com.br';

// Define all public routes with their priorities and change frequencies
// Based on App.jsx routes (lines 76-113)
const routes = [
  // Main pages - High priority
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/servicos', priority: 0.9, changefreq: 'weekly' },
  { path: '/sobre', priority: 0.8, changefreq: 'monthly' },
  { path: '/agendamento', priority: 0.95, changefreq: 'weekly' },

  // Services - Important
  { path: '/lentes', priority: 0.8, changefreq: 'monthly' },

  // Plans - High conversion pages
  { path: '/planos', priority: 0.9, changefreq: 'monthly' },
  { path: '/planobasico', priority: 0.85, changefreq: 'monthly' },
  { path: '/planopadrao', priority: 0.85, changefreq: 'monthly' },
  { path: '/planopremium', priority: 0.85, changefreq: 'monthly' },
  { path: '/planosonline', priority: 0.85, changefreq: 'monthly' },
  { path: '/planosflex', priority: 0.85, changefreq: 'monthly' },

  // Content pages
  { path: '/blog', priority: 0.8, changefreq: 'weekly' },
  { path: '/podcast', priority: 0.7, changefreq: 'weekly' },
  { path: '/faq', priority: 0.7, changefreq: 'monthly' },

  // Campaign pages
  { path: '/questionario-olho-seco', priority: 0.6, changefreq: 'monthly' },
  { path: '/campanha/outubro-olho-seco', priority: 0.6, changefreq: 'yearly' },

  // Medical content
  { path: '/artigos/catarata', priority: 0.7, changefreq: 'yearly' },
  { path: '/meibografia', priority: 0.75, changefreq: 'monthly' },
  { path: '/blefaroplastia-jato-plasma', priority: 0.8, changefreq: 'monthly' },

  // Legal
  { path: '/privacy', priority: 0.4, changefreq: 'yearly' },

  // Thank you pages (lower priority, but indexed for completeness)
  { path: '/agendamento/obrigado', priority: 0.3, changefreq: 'yearly' },
  { path: '/assine', priority: 0.5, changefreq: 'monthly' },
  { path: '/waitlist', priority: 0.5, changefreq: 'monthly' },
];

// Generate XML
function generateSitemap() {
  const now = new Date().toISOString();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
  xml += '  <!-- Generated: ' + now + ' -->\n';
  xml += '  <!-- Saraiva Vision - Clínica Oftalmológica -->\n';
  xml += '  <!-- Dr. Philipe Saraiva Cruz - CRM-MG 69.870 -->\n';
  xml += '\n';

  routes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${route.path}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Write to public directory (for static hosting)
function writeSitemap() {
  const sitemap = generateSitemap();
  const publicDir = path.join(__dirname, '..', 'public');
  const distDir = path.join(__dirname, '..', 'dist');

  // Write to public directory (development)
  const publicPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicPath, sitemap, 'utf8');
  console.log('✅ Sitemap generated:', publicPath);

  // Also write to dist directory if it exists (production)
  if (fs.existsSync(distDir)) {
    const distPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distPath, sitemap, 'utf8');
    console.log('✅ Sitemap copied to dist:', distPath);
  }

  console.log(`\n📊 Sitemap statistics:`);
  console.log(`   - Total URLs: ${routes.length}`);
  console.log(`   - Base URL: ${baseUrl}`);
  console.log(`   - Generated: ${new Date().toLocaleString('pt-BR')}\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  writeSitemap();
}

export { generateSitemap, writeSitemap };
