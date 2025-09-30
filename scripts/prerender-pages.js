#!/usr/bin/env node
/**
 * Pre-rendering Script for SEO Optimization
 * Generates static HTML with meta tags for main pages
 *
 * Usage: node scripts/prerender-pages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Page configurations with SEO metadata
const pages = {
  '/': {
    title: 'Saraiva Vision - Clínica Oftalmológica em Caratinga/MG',
    description: 'Clínica oftalmológica especializada em catarata, glaucoma, retina e cirurgia refrativa em Caratinga/MG. Atendimento médico de qualidade com tecnologia de ponta.',
    keywords: 'oftalmologia Caratinga, clínica oftalmológica MG, catarata Caratinga, cirurgia refrativa Vale do Aço',
    canonicalUrl: 'https://saraivavision.com.br/'
  },
  '/sobre': {
    title: 'Sobre a Clínica Saraiva Vision - Oftalmologia em Caratinga/MG',
    description: 'Conheça a Clínica Saraiva Vision em Caratinga/MG. Equipe médica especializada, tecnologia de ponta e atendimento humanizado em oftalmologia.',
    keywords: 'sobre Saraiva Vision, clínica Caratinga, oftalmologista Caratinga',
    canonicalUrl: 'https://saraivavision.com.br/sobre'
  },
  '/servicos': {
    title: 'Serviços Oftalmológicos - Saraiva Vision Caratinga/MG',
    description: 'Serviços oftalmológicos completos em Caratinga/MG: cirurgia de catarata, glaucoma, retina, cirurgia refrativa e mais. Agende sua consulta.',
    keywords: 'serviços oftalmológicos Caratinga, cirurgia catarata MG, tratamento glaucoma',
    canonicalUrl: 'https://saraivavision.com.br/servicos'
  },
  '/blog': {
    title: 'Blog - Artigos sobre Saúde Ocular | Saraiva Vision',
    description: 'Artigos informativos sobre saúde ocular, prevenção e tratamentos oftalmológicos escritos por especialistas da Clínica Saraiva Vision em Caratinga/MG.',
    keywords: 'blog oftalmologia, saúde ocular, artigos oftalmológicos, dicas visão',
    canonicalUrl: 'https://saraivavision.com.br/blog'
  },
  '/contato': {
    title: 'Contato - Agende sua Consulta | Saraiva Vision Caratinga/MG',
    description: 'Entre em contato com a Clínica Saraiva Vision em Caratinga/MG. Rua Catarina Maria Passos, 97 - Santa Zita. Telefone: (33) 99860-1427.',
    keywords: 'contato Saraiva Vision, agendar consulta Caratinga, telefone oftalmologista',
    canonicalUrl: 'https://saraivavision.com.br/contato'
  }
};

// NAP (Name, Address, Phone) - Official Data
const NAP = {
  name: 'Clínica Saraiva Vision',
  streetAddress: 'Rua Catarina Maria Passos, 97',
  neighborhood: 'Santa Zita',
  city: 'Caratinga',
  state: 'MG',
  postalCode: '35300-000',
  phone: '(33) 99860-1427',
  phoneInternational: '+55-33-99860-1427',
  whatsapp: '+5533998601427',
  email: 'contato@saraivavision.com.br',
  url: 'https://saraivavision.com.br',
  latitude: -19.7896,
  longitude: -42.1397
};

/**
 * Generate Schema.org LocalBusiness structured data
 */
function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': NAP.url,
    name: NAP.name,
    description: 'Clínica oftalmológica especializada em saúde ocular',
    url: NAP.url,
    telephone: NAP.phoneInternational,
    email: NAP.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: NAP.streetAddress,
      addressLocality: NAP.city,
      addressRegion: NAP.state,
      postalCode: NAP.postalCode,
      addressCountry: 'BR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: NAP.latitude,
      longitude: NAP.longitude
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    medicalSpecialty: 'Ophthalmology',
    priceRange: '$$'
  };
}

/**
 * Generate pre-rendered HTML for a page
 */
function generatePrerenderedHTML(route, metadata) {
  const schema = generateLocalBusinessSchema();

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEO Meta Tags -->
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}" />
    <meta name="keywords" content="${metadata.keywords}" />
    <link rel="canonical" href="${metadata.canonicalUrl}" />

    <!-- Open Graph -->
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${metadata.canonicalUrl}" />
    <meta property="og:site_name" content="Saraiva Vision" />
    <meta property="og:locale" content="pt_BR" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />

    <!-- Geo Meta Tags -->
    <meta name="geo.region" content="BR-MG" />
    <meta name="geo.placename" content="Caratinga" />
    <meta name="geo.position" content="${NAP.latitude};${NAP.longitude}" />
    <meta name="ICBM" content="${NAP.latitude}, ${NAP.longitude}" />

    <!-- Contact Info -->
    <meta name="contact" content="${NAP.email}" />
    <meta name="telephone" content="${NAP.phoneInternational}" />

    <!-- Robots -->
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>
  </head>
  <body>
    <div id="root">
      <!-- Pre-rendered content above the fold -->
      <header>
        <h1>${NAP.name}</h1>
        <p>${metadata.description}</p>
      </header>
      <main>
        <section>
          <h2>Informações de Contato</h2>
          <address>
            <p>${NAP.streetAddress}, ${NAP.neighborhood}</p>
            <p>${NAP.city} - ${NAP.state}, ${NAP.postalCode}</p>
            <p>Telefone: <a href="tel:${NAP.whatsapp}">${NAP.phone}</a></p>
            <p>Email: <a href="mailto:${NAP.email}">${NAP.email}</a></p>
          </address>
        </section>
      </main>
      <noscript>
        <p>Este site requer JavaScript para funcionar corretamente. Por favor, habilite JavaScript no seu navegador.</p>
      </noscript>
    </div>
    <script type="module" src="/src/main.jsx"></script>
    <script src="https://cdn.pulse.is/livechat/loader.js" data-live-chat-id="68d52f7bf91669800d0923ac" async></script>
  </body>
</html>
`;
}

/**
 * Main pre-rendering function
 */
function prerenderPages() {
  const distDir = path.resolve(__dirname, '../dist');

  // Check if dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log('🚀 Starting pre-rendering process...\n');

  let successCount = 0;
  let errorCount = 0;

  // Generate pre-rendered HTML for each page
  Object.entries(pages).forEach(([route, metadata]) => {
    try {
      const html = generatePrerenderedHTML(route, metadata);

      // Determine file path
      let filePath;
      if (route === '/') {
        filePath = path.join(distDir, 'index.html');
      } else {
        const routeDir = path.join(distDir, route.substring(1));
        fs.mkdirSync(routeDir, { recursive: true });
        filePath = path.join(routeDir, 'index.html');
      }

      // Write pre-rendered HTML
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ Pre-rendered: ${route} → ${path.relative(distDir, filePath)}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error pre-rendering ${route}:`, error.message);
      errorCount++;
    }
  });

  console.log(`\n📊 Pre-rendering Summary:`);
  console.log(`   ✅ Success: ${successCount} pages`);
  console.log(`   ❌ Errors: ${errorCount} pages`);
  console.log(`\n🎯 Pre-rendered pages include:`);
  console.log(`   - SEO meta tags with Caratinga/MG location`);
  console.log(`   - Schema.org LocalBusiness structured data`);
  console.log(`   - NAP consistency: ${NAP.phone}`);
  console.log(`   - Above-the-fold content for crawlers`);
  console.log(`\n✨ Deploy to production with:`);
  console.log(`   sudo cp -r dist/* /var/www/html/`);
}

// Execute pre-rendering
prerenderPages();
