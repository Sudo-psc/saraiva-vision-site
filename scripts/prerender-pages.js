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
    title: 'Clínica especializada em olho seco em Caratinga/MG | Saraiva Vision',
    description: 'Clínica especializada em olho seco em Caratinga/MG, única do interior de MG com tratamento de olho seco aprovado pela ANVISA com IRPL E-Eye. Consultas, exames e lentes de contato.',
    keywords: 'olho seco Caratinga, clínica especializada olho seco MG, IRPL E-Eye ANVISA, tratamento olho seco interior MG, oftalmologia Caratinga, clínica oftalmológica MG',
    canonicalUrl: 'https://saraivavision.com.br/',
    ogImage: 'https://saraivavision.com.br/opengraph-logo.png'
  },
  '/waitlist': {
    title: 'SVlentes - Assinatura de lentes de contato com acompanhamento médico em caratinga.',
    description: 'Primeiro plano de assinatura de lentes de contato com acompanhamento médico no brasil. Comodidade e segurança. Frete grátis e entrega garantida.',
    keywords: 'assinatura lentes de contato, lentes de contato caratinga, acompanhamento médico, SVlentes, plano assinatura lentes',
    canonicalUrl: 'https://saraivavision.com.br/waitlist',
    ogImage: 'https://saraivavision.com.br/opengraph-logo.png'
  },
  '/olho-seco': {
    title: 'Centro Especializado em Olho Seco em Caratinga | TFOS DEWS III | Saraiva Vision',
    description: 'Serviço especializado em olho seco em Caratinga, com diagnóstico completo e meibografia, seguindo protocolos TFOS DEWS III e documentação fotográfica seriada.',
    keywords: 'olho seco Caratinga, meibografia Caratinga, serviço especializado olho seco, TFOS DEWS III, DGM, tratamento olho seco MG, oftalmologista olho seco',
    canonicalUrl: 'https://saraivavision.com.br/olho-seco',
    ogImage: 'https://saraivavision.com.br/opengraph-logo.png'
  },
  '/luz-pulsada-irpl': {
    title: 'IRPL E-Eye para Olho Seco e DGM em Caratinga | Saraiva Vision',
    description: 'Tratamento de olho seco com luz pulsada IRPL E-Eye em Caratinga, MG. Tecnologia francesa aprovada pela ANVISA, não invasiva, para Disfunção das Glândulas de Meibômio.',
    keywords: 'IRPL Caratinga, E-Eye Caratinga, luz pulsada olho seco, DGM tratamento, luz intensa pulsada oftalmologia, tratamento olho seco Caratinga, IRPL E-Eye ANVISA',
    canonicalUrl: 'https://saraivavision.com.br/luz-pulsada-irpl',
    ogImage: 'https://saraivavision.com.br/E-eye/e-eye-equipAnvisa.jpeg'
  },
  '/faq': {
    title: 'Perguntas Frequentes | FAQ | Saraiva Vision',
    description: 'Tire suas dúvidas sobre olho seco, tratamentos oftalmológicos, luz pulsada IRPL e mais. Respostas do Dr. Philipe Saraiva Cruz.',
    keywords: 'FAQ oftalmologia, perguntas frequentes olho seco, dúvidas tratamento IRPL, FAQ Saraiva Vision',
    canonicalUrl: 'https://saraivavision.com.br/faq',
    ogImage: 'https://saraivavision.com.br/opengraph-logo.png'
  },
  '/faq/olho-seco': {
    title: 'FAQ Olho Seco: Respostas para suas Dúvidas | Saraiva Vision',
    description: 'Tire suas dúvidas sobre Síndrome do Olho Seco: sintomas, causas (DGM), diagnóstico com meibografia e tratamentos modernos em Caratinga.',
    keywords: 'FAQ olho seco, dúvidas olho seco, sintomas olho seco, tratamento olho seco, DGM, meibografia, oftalmologista Caratinga',
    canonicalUrl: 'https://saraivavision.com.br/faq/olho-seco',
    ogImage: 'https://saraivavision.com.br/opengraph-logo.png'
  },
  '/faq/luz-pulsada': {
    title: 'FAQ Luz Pulsada (IRPL) E-Eye: 10 Perguntas e Respostas | Saraiva Vision',
    description: 'Guia completo sobre tratamento de Olho Seco com E-Eye IRPL: como funciona, diferença para IPL, sessões, resultados e contraindicações. Aprovado pela Anvisa.',
    keywords: 'FAQ IRPL, perguntas luz pulsada, E-Eye como funciona, IRPL vs IPL, tratamento DGM, sessões IRPL, contraindicações luz pulsada',
    canonicalUrl: 'https://saraivavision.com.br/faq/luz-pulsada',
    ogImage: 'https://saraivavision.com.br/E-eye/e-eye-equipAnvisa.jpeg'
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
  const modulePreloads = indexContent.match(/<link[^>]*rel="modulepreload"[^>]*>/g) || [];

  // Extract stylesheet links, excluding those inside <noscript> tags
  const contentWithoutNoscript = indexContent.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');
  const styleMatches = contentWithoutNoscript.match(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g);

  // Deduplicate styles by href (keep first occurrence, which should be the async version)
  const seenHrefs = new Set();
  const uniqueStyles = (styleMatches || []).filter(tag => {
    const hrefMatch = tag.match(/href="([^"]+)"/);
    if (!hrefMatch) return true;
    const href = hrefMatch[1];
    if (seenHrefs.has(href)) return false;
    seenHrefs.add(href);
    return true;
  });

  return {
    mainScript: scriptMatch ? scriptMatch[0] : '',
    styles: uniqueStyles.join('\n    '),
    modulePreloads: modulePreloads.join('\n    ')
  };
}

// Critical CSS for above-the-fold rendering (prevents render-blocking)
const CRITICAL_CSS = `
    @font-face{font-family:'Inter Fallback';src:local('Arial');ascent-override:90.49%;descent-override:22.56%;line-gap-override:0%;size-adjust:107.64%}
    *,::before,::after{box-sizing:border-box;border:0 solid #e5e7eb}
    html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:Inter,'Inter Fallback',ui-sans-serif,system-ui,sans-serif}
    body{margin:0;line-height:inherit;background-color:#fff}
    #root{min-height:100vh;display:flex;flex-direction:column}
    .loading-skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.5s infinite}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .hero-section{min-height:80vh;display:flex;align-items:center;position:relative;overflow:hidden}
    .hero-content{max-width:1280px;margin:0 auto;padding:0 1rem;width:100%}
    nav,.navbar{position:sticky;top:0;z-index:50;background:#fff;height:64px}
    @media(min-width:1024px){nav,.navbar{height:80px}}
    h1{font-size:2.25rem;font-weight:700;line-height:1.2;color:#0f172a}
    @media(min-width:768px){h1{font-size:3rem}}
    @media(min-width:1024px){h1{font-size:3.75rem}}
    .btn-primary{display:inline-flex;align-items:center;justify-content:center;padding:.75rem 1.5rem;font-weight:600;color:#fff;background:#0891b2;border-radius:.5rem;transition:background .2s}
    .btn-primary:hover{background:#0e7490}
    img{max-width:100%;height:auto;display:block}
    .below-fold{opacity:0;transition:opacity .3s}.css-loaded .below-fold{opacity:1}
`;

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

    <!-- Critical CSS - Inline for instant above-the-fold rendering -->
    <style id="critical-css">${CRITICAL_CSS}</style>

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
    <meta property="og:image" content="${metadata.ogImage || 'https://saraivavision.com.br/opengraph-logo.png'}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="${metadata.title} - Clínica Saraiva Vision" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />
    <meta name="twitter:image" content="${metadata.ogImage || 'https://saraivavision.com.br/opengraph-logo.png'}" />
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

    <!-- Google Tag Manager - Loaded by React Component (GoogleTagManager.jsx) -->
    <!-- GTM initialization moved to React for better control and error isolation -->
    <script>
      // Initialize dataLayer for GTM (will be loaded by React component)
      window.dataLayer = window.dataLayer || [];
    </script>

    <!-- Schema.org Structured Data -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
    </script>

    <!-- Async Google Fonts - prevents render blocking -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=optional" media="print" onload="this.media='all';this.onload=null;" />
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=optional" /></noscript>

    <!-- Preload LCP hero image - responsive srcset matching Hero.jsx -->
    <link rel="preload" as="image" type="image/avif" fetchpriority="high"
      href="/img/responsive/hero_dry_eye-640.avif"
      imagesrcset="/img/responsive/hero_dry_eye-400.avif 400w, /img/responsive/hero_dry_eye-640.avif 640w, /img/responsive/hero_dry_eye-1024.avif 1024w"
      imagesizes="(min-width: 1024px) calc(44vw - 2rem), calc(100vw - 3rem)" />

    <!-- Vite Build Assets -->
    ${assets.mainScript}
    ${assets.modulePreloads}
    ${assets.styles}

    <!-- CSS Loaded Detection Script -->
    <script>
      (function(){var l=document.querySelectorAll('link[rel="stylesheet"][media="print"]'),c=0,t=l.length;if(!t){document.documentElement.classList.add('css-loaded');return}function d(){c++;if(c>=t)document.documentElement.classList.add('css-loaded')}l.forEach(function(e){e.sheet?d():e.addEventListener('load',d)});setTimeout(function(){document.documentElement.classList.add('css-loaded')},3000)})();
    </script>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) - Loaded by React Component -->
    <!-- GTM noscript fallback will be injected by React component -->

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
