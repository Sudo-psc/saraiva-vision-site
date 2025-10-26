#!/usr/bin/env node
/**
 * Google Tag Manager Debug Script
 * Automated GTM validation for production
 * 
 * Usage: node scripts/debug-gtm.js
 */

import https from 'https';

const SITE_URL = 'https://www.saraivavision.com.br';
const GTM_ID = 'GTM-KF2NP85D';
const GA4_ID = 'G-LXWRK8ELS6';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, type = 'info') {
  const prefix = {
    success: `${colors.green}✅`,
    error: `${colors.red}❌`,
    warning: `${colors.yellow}⚠️`,
    info: `${colors.blue}ℹ️`,
    test: `${colors.cyan}🧪`
  }[type] || '';
  
  console.log(`${prefix} ${message}${colors.reset}`);
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function test1_HTMLContainsGTM() {
  log('Test 1: GTM code present in HTML', 'test');
  
  try {
    const { body } = await fetchUrl(SITE_URL);
    
    const hasDataLayerInit = body.includes('window.dataLayer = window.dataLayer || []');
    const hasGTMScript = body.includes(`'gtm.start'`);
    const hasGTMId = body.includes(GTM_ID);
    const hasNoscript = body.includes('googletagmanager.com/ns.html');
    
    if (hasDataLayerInit) {
      log('dataLayer initialization found', 'success');
    } else {
      log('dataLayer initialization MISSING', 'error');
    }
    
    if (hasGTMScript) {
      log('GTM script found', 'success');
    } else {
      log('GTM script MISSING', 'error');
    }
    
    if (hasGTMId) {
      log(`GTM ID ${GTM_ID} found`, 'success');
    } else {
      log(`GTM ID ${GTM_ID} MISSING`, 'error');
    }
    
    if (hasNoscript) {
      log('GTM noscript fallback found', 'success');
    } else {
      log('GTM noscript fallback MISSING', 'error');
    }
    
    // Check for duplicates
    const gtmMatches = (body.match(new RegExp(GTM_ID, 'g')) || []).length;
    if (gtmMatches === 2) {
      log(`GTM appears ${gtmMatches} times (expected: 2 - head + noscript)`, 'success');
    } else if (gtmMatches > 2) {
      log(`GTM appears ${gtmMatches} times - DUPLICATE found!`, 'warning');
    } else {
      log(`GTM appears ${gtmMatches} times - INCOMPLETE`, 'error');
    }
    
    return hasDataLayerInit && hasGTMScript && hasGTMId && hasNoscript;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function test2_GTMScriptLoads() {
  log('\nTest 2: GTM script loads from Google', 'test');
  
  try {
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    const { statusCode, headers, body } = await fetchUrl(gtmUrl);
    
    if (statusCode === 200) {
      log(`GTM script loads: HTTP ${statusCode}`, 'success');
    } else {
      log(`GTM script failed: HTTP ${statusCode}`, 'error');
      return false;
    }
    
    if (headers['content-type'].includes('javascript')) {
      log('Content-Type is JavaScript', 'success');
    } else {
      log(`Wrong Content-Type: ${headers['content-type']}`, 'error');
    }
    
    const sizeKB = (body.length / 1024).toFixed(2);
    log(`Script size: ${sizeKB} KB`, 'info');
    
    if (body.includes('Copyright 2012 Google Inc')) {
      log('Valid GTM script (copyright found)', 'success');
    } else {
      log('Invalid GTM script content', 'error');
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function test3_GTMConfiguration() {
  log('\nTest 3: GTM container configuration', 'test');
  
  try {
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    const { body } = await fetchUrl(gtmUrl);
    
    // Check for tags
    if (body.includes('"tags":[')) {
      const tagsMatch = body.match(/"tags":\[([^\]]+)\]/);
      if (tagsMatch) {
        const tagsCount = (tagsMatch[1].match(/\{"function"/g) || []).length;
        log(`Found ${tagsCount} tags configured`, 'info');
      }
    }
    
    // Check for Google Ads conversion tag
    if (body.includes('AW-11120453144')) {
      log('Google Ads conversion tag found (AW-11120453144)', 'success');
    } else {
      log('Google Ads conversion tag not found', 'warning');
    }
    
    // Check for triggers
    if (body.includes('"triggers"')) {
      log('Triggers configured', 'success');
    }
    
    // Check for variables
    if (body.includes('"macros":[')) {
      const macrosMatch = body.match(/"macros":\[([^\]]+)\]/);
      if (macrosMatch) {
        const macrosCount = (macrosMatch[1].match(/\{"function"/g) || []).length;
        log(`Found ${macrosCount} variables configured`, 'info');
      }
    }
    
    return true;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function test4_ProxyEndpoint() {
  log('\nTest 4: Proxy endpoint /gtm.js', 'test');
  
  try {
    const proxyUrl = `${SITE_URL}/gtm.js?id=${GTM_ID}`;
    const { statusCode } = await fetchUrl(proxyUrl);
    
    if (statusCode === 200) {
      log(`Proxy works: HTTP ${statusCode}`, 'success');
      log('Benefit: Bypasses ad blockers', 'info');
      return true;
    }
  } catch (error) {
    log(`Proxy not working: ${error.message}`, 'warning');
    log('Not critical: Direct GTM load still works', 'info');
    return false;
  }
}

async function test5_GAConfiguration() {
  log('\nTest 5: Google Analytics 4 configuration', 'test');
  
  try {
    const { body } = await fetchUrl(SITE_URL);
    
    if (body.includes(GA4_ID)) {
      log(`GA4 ID ${GA4_ID} found in HTML`, 'success');
    } else {
      log(`GA4 ID ${GA4_ID} not in HTML (may be in GTM)`, 'info');
    }
    
    // Check GTM container for GA4
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    const gtmResponse = await fetchUrl(gtmUrl);
    
    if (gtmResponse.body.includes('googtag')) {
      log('Google Tag (gtag.js) configured in GTM', 'success');
    }
    
    return true;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function test6_EventTracking() {
  log('\nTest 6: Event tracking configuration', 'test');
  
  try {
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    const { body } = await fetchUrl(gtmUrl);
    
    const events = {
      'Link Click': body.includes('gtm.linkClick'),
      'Form Submit': body.includes('gtm.formSubmit'),
      'Click': body.includes('gtm.click'),
      'WhatsApp Click': body.includes('wa.me')
    };
    
    for (const [eventName, found] of Object.entries(events)) {
      if (found) {
        log(`${eventName} tracking configured`, 'success');
      } else {
        log(`${eventName} tracking not found`, 'info');
      }
    }
    
    return true;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function test7_PerformanceCheck() {
  log('\nTest 7: GTM load performance', 'test');
  
  try {
    const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    
    const start = Date.now();
    await fetchUrl(gtmUrl);
    const loadTime = Date.now() - start;
    
    if (loadTime < 500) {
      log(`Load time: ${loadTime}ms (excellent)`, 'success');
    } else if (loadTime < 1000) {
      log(`Load time: ${loadTime}ms (good)`, 'success');
    } else if (loadTime < 2000) {
      log(`Load time: ${loadTime}ms (acceptable)`, 'warning');
    } else {
      log(`Load time: ${loadTime}ms (slow)`, 'error');
    }
    
    return loadTime < 2000;
  } catch (error) {
    log(`Failed: ${error.message}`, 'error');
    return false;
  }
}

async function runAllTests() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}🔍 Google Tag Manager Debug - ${SITE_URL}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  log(`GTM Container: ${GTM_ID}`, 'info');
  log(`GA4 Property: ${GA4_ID}`, 'info');
  
  const results = [];
  
  results.push(await test1_HTMLContainsGTM());
  results.push(await test2_GTMScriptLoads());
  results.push(await test3_GTMConfiguration());
  results.push(await test4_ProxyEndpoint());
  results.push(await test5_GAConfiguration());
  results.push(await test6_EventTracking());
  results.push(await test7_PerformanceCheck());
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(0);
  
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}📊 Summary${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  if (passed === total) {
    log(`All tests passed: ${passed}/${total} (${percentage}%)`, 'success');
    log('GTM is properly configured and working! ✨', 'success');
  } else {
    log(`Tests passed: ${passed}/${total} (${percentage}%)`, 'warning');
    log(`Failed tests: ${total - passed}`, 'error');
  }
  
  console.log(`\n${colors.cyan}📚 Next Steps:${colors.reset}`);
  console.log('1. Open browser DevTools on', SITE_URL);
  console.log('2. Run: console.log(window.dataLayer)');
  console.log('3. Check for GTM events in Network tab');
  console.log('4. Use Tag Assistant extension for detailed analysis');
  console.log('\n');
  
  process.exit(passed === total ? 0 : 1);
}

runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
