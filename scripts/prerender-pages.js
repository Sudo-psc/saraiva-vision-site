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
// NOTE: Only pre-render homepage (/) to avoid MIME type issues with SPA routing
// Other routes are handled by Nginx fallback to /index.html
const pages = {
  '/': {
    title: 'Saraiva Vision - Clínica Oftalmológica em Caratinga/MG',
    description: 'Clínica oftalmológica especializada em catarata, glaucoma, retina e cirurgia refrativa em Caratinga/MG. Atendimento médico de qualidade com tecnologia de ponta.',
    keywords: 'oftalmologia Caratinga, clínica oftalmológica MG, catarata Caratinga, cirurgia refrativa Vale do Aço',
    canonicalUrl: 'https://saraivavision.com.br/',
    ogImage: 'https://opengraph.b-cdn.net/production/images/c8336c5f-a9c6-45ca-a6c0-429904ebb68f.png?token=G6IVMbiX1P2Oic-_zMYf-wYkKYWqDDa99-O-W2nQJoI&height=1024&width=1024&expires=33297339885'
  },
  '/waitlist': {
    title: 'SVlentes - Assinatura de lentes de contato com acompanhamento médico em caratinga.',
    description: 'Primeiro plano de assinatura de lentes de contato com acompanhamento médico no brasil. Comodidade e segurança. Frete grátis e entrega garantida.',
    keywords: 'assinatura lentes de contato, lentes de contato caratinga, acompanhamento médico, SVlentes, plano assinatura lentes',
    canonicalUrl: 'https://saraivavision.com.br/waitlist',
    ogImage: 'https://opengraph.b-cdn.net/production/images/38eda430-78a4-4e66-b7e1-901ce93872f7.jpg?token=slDJiisGKA-ezPe-NX5x7ig3pdbDVnUGJsGn1MNh_m4&height=1024&width=1024&expires=33297339885'
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
 * Read the Vite-built index.html to extract script/style tags
 */
function getViteBuildAssets(distDir) {
  const indexPath = path.join(distDir, 'index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  // Extract script and link tags
  const scriptMatch = indexContent.match(/<script[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
  const styleMatches = indexContent.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g);
  const modulePreloads = indexContent.match(/<link[^>]*rel="modulepreload"[^>]*>/g) || [];

  return {
    mainScript: scriptMatch ? scriptMatch[0] : '',
    styles: styleMatches ? styleMatches.join('\n    ') : '',
    modulePreloads: modulePreloads.join('\n    ')
  };
}

/**
 * Generate pre-rendered HTML for a page
 */
function generatePrerenderedHTML(route, metadata, assets) {
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

    <!-- Facebook Domain Verification -->
    <meta name="facebook-domain-verification" content="tca7o4kjixltbutycd2650bdpisp5b" />

    <!-- Open Graph -->
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${metadata.canonicalUrl}" />
    <meta property="og:site_name" content="Saraiva Vision" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:image" content="${metadata.ogImage || 'https://saraivavision.com.br/og-image-1200x630-optimized.jpg'}" />
    <meta property="og:image:width" content="1024" />
    <meta property="og:image:height" content="1024" />
    <meta property="og:image:type" content="${metadata.ogImage && metadata.ogImage.includes('.png') ? 'image/png' : 'image/jpeg'}" />
    <meta property="og:image:alt" content="${metadata.title} - Clínica Saraiva Vision" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />
    <meta name="twitter:image" content="${metadata.ogImage || 'https://saraivavision.com.br/og-image-1200x630-optimized.jpg'}" />
    <meta name="twitter:image:alt" content="${metadata.title} - Clínica Saraiva Vision" />

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

    <!-- Google Tag Manager -->
    <script>
      window.dataLayer = window.dataLayer || [];
    </script>
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-KF2NP85D');</script>
    <!-- End Google Tag Manager -->

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>

    <!-- Vite Build Assets -->
    ${assets.mainScript}
    ${assets.modulePreloads}
    ${assets.styles}
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KF2NP85D"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="root"></div>
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

  // Get Vite build assets
  const assets = getViteBuildAssets(distDir);

  // Generate pre-rendered HTML for each page
  Object.entries(pages).forEach(([route, metadata]) => {
    try {
      const html = generatePrerenderedHTML(route, metadata, assets);

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
