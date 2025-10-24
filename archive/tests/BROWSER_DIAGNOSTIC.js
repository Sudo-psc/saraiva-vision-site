/**
 * Browser Diagnostic Script for Image 404 Errors
 * 
 * Run this in browser console (F12) on https://saraivavision.com.br
 * 
 * Copy/paste all code below and press Enter
 */

(function() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         SARAIVA VISION - Image Loading Diagnostic             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. Check all AVIF sources
  console.log('1️⃣ Checking AVIF Sources:');
  console.log('─'.repeat(60));
  const avifSources = document.querySelectorAll('source[type="image/avif"]');
  console.log(`Found ${avifSources.length} AVIF sources\n`);
  
  avifSources.forEach((source, index) => {
    const srcset = source.srcset || source.getAttribute('srcset');
    if (srcset) {
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      console.log(`Source #${index + 1}:`);
      urls.forEach(url => {
        const hasPrefix = url.startsWith('/Blog/') || url.startsWith('/img/');
        const status = hasPrefix ? '✅' : '❌ MISSING PREFIX';
        console.log(`  ${status} ${url}`);
      });
      console.log('');
    }
  });

  // 2. Check all images
  console.log('\n2️⃣ Checking Image Elements:');
  console.log('─'.repeat(60));
  const images = document.querySelectorAll('img[src*="capa-"], img[src*="hero"], img[src*="avatar"]');
  console.log(`Found ${images.length} relevant images\n`);
  
  images.forEach((img, index) => {
    const src = img.src || img.getAttribute('src');
    const hasPrefix = src.includes('/Blog/') || src.includes('/img/') || src.startsWith('http');
    const status = hasPrefix ? '✅' : '❌ MISSING PREFIX';
    console.log(`Image #${index + 1}:`);
    console.log(`  ${status} ${src}`);
    console.log(`  Natural size: ${img.naturalWidth}x${img.naturalHeight}`);
    console.log(`  Complete: ${img.complete}, Error: ${img.hasAttribute('error')}\n`);
  });

  // 3. Check network requests
  console.log('\n3️⃣ Failed Network Requests (404s):');
  console.log('─'.repeat(60));
  const resources = performance.getEntriesByType('resource');
  const failed = resources.filter(r => 
    (r.name.includes('.avif') || r.name.includes('.webp')) && 
    r.transferSize === 0 && 
    r.duration > 0
  );
  
  if (failed.length > 0) {
    console.log(`Found ${failed.length} potentially failed resources:\n`);
    failed.forEach(r => {
      const url = new URL(r.name);
      const hasPrefix = url.pathname.startsWith('/Blog/') || url.pathname.startsWith('/img/');
      const status = hasPrefix ? '⚠️' : '❌ NO PREFIX';
      console.log(`${status} ${url.pathname}`);
    });
  } else {
    console.log('✅ No failed AVIF/WebP requests detected');
  }

  // 4. Check service workers
  console.log('\n4️⃣ Service Worker Status:');
  console.log('─'.repeat(60));
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        console.log(`⚠️ ${registrations.length} service worker(s) registered`);
        registrations.forEach((reg, i) => {
          console.log(`  SW #${i + 1}: ${reg.scope}`);
          console.log(`    Active: ${reg.active ? 'Yes' : 'No'}`);
          console.log(`    Waiting: ${reg.waiting ? 'Yes' : 'No'}`);
        });
        console.log('\n💡 Tip: Service workers can cache old URLs');
        console.log('   To clear: Application tab → Service Workers → Unregister');
      } else {
        console.log('✅ No service workers registered');
      }
    });
  } else {
    console.log('ℹ️  Service workers not supported');
  }

  // 5. Check OptimizedImage component
  console.log('\n5️⃣ OptimizedImage Component Check:');
  console.log('─'.repeat(60));
  const pictures = document.querySelectorAll('picture');
  console.log(`Found ${pictures.length} <picture> elements (from OptimizedImage)\n`);
  
  if (pictures.length > 0) {
    console.log('✅ OptimizedImage component is being used');
    console.log('ℹ️  If URLs are still wrong, check browser cache');
  } else {
    console.log('❌ No <picture> elements found');
    console.log('⚠️  OptimizedImage might not be imported correctly');
  }

  // 6. Recommendations
  console.log('\n6️⃣ Recommendations:');
  console.log('─'.repeat(60));
  
  const hasWrongUrls = Array.from(avifSources).some(s => {
    const srcset = s.srcset || s.getAttribute('srcset');
    return srcset && !srcset.includes('/Blog/') && srcset.includes('capa-');
  });

  if (hasWrongUrls) {
    console.log('❌ Found URLs without /Blog/ prefix');
    console.log('\n📋 Actions needed:');
    console.log('   1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)');
    console.log('   2. Clear cache: DevTools → Network → Disable cache');
    console.log('   3. Try incognito mode');
    console.log('   4. Unregister service workers');
  } else {
    console.log('✅ All URLs appear correct');
    console.log('\n📋 If still seeing 404s:');
    console.log('   1. Check Network tab for actual failed requests');
    console.log('   2. Look for cached responses (status 304)');
    console.log('   3. Clear Cloudflare cache if using CDN');
  }

  console.log('\n╚════════════════════════════════════════════════════════════════╝');
  console.log('Diagnostic complete. Check output above for issues.');
})();
