#!/usr/bin/env node

// Script de validação das correções CSP

import https from 'https';
import { URL } from 'url';

const validateCSP = (domain) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: domain,
      port: 443,
      path: '/',
      method: 'HEAD'
    };

    const req = https.request(options, (res) => {
      const csp = res.headers['content-security-policy'];
      
      if (!csp) {
        reject('CSP header not found');
        return;
      }

      // Parse CSP into directives
      const directives = {};
      csp.split(';').forEach(directive => {
        const [key, ...values] = directive.trim().split(' ');
        if (key) {
          directives[key] = values;
        }
      });

      resolve({ headers: res.headers, csp: directives });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};

const checkRequirements = async () => {
  console.log("=== VALIDAÇÃO CSP - CORREÇÕES APLICADAS ===\n");

  try {
    const { csp } = await validateCSP('saraivavision.com.br');

    console.log("✅ CSP Header encontrado e ativo\n");

    // Verificar correções do Google reCAPTCHA
    console.log("🔍 VERIFICANDO GOOGLE reCAPTCHA:");
    const scriptSrc = csp['script-src'] || [];
    const connectSrc = csp['connect-src'] || [];
    const frameSrc = csp['frame-src'] || [];

    // Verificação script-src para reCAPTCHA
    const hasGoogleDomain = scriptSrc.includes('https://www.google.com');
    const hasRecaptchaDomain = scriptSrc.includes('https://www.google.com/recaptcha/');
    const hasGstaticRecaptcha = scriptSrc.includes('https://www.gstatic.com/recaptcha/');

    console.log(`   script-src 'https://www.google.com': ${hasGoogleDomain ? '✅' : '❌'}`);
    console.log(`   script-src 'https://www.google.com/recaptcha/': ${hasRecaptchaDomain ? '✅' : '❌'}`);
    console.log(`   script-src 'https://www.gstatic.com/recaptcha/': ${hasGstaticRecaptcha ? '✅' : '❌'}`);

    // Verificação connect-src para reCAPTCHA
    const hasGoogleConnect = connectSrc.includes('https://www.google.com');
    const hasRecaptchaConnect = connectSrc.includes('https://www.google.com/recaptcha/');

    console.log(`   connect-src 'https://www.google.com': ${hasGoogleConnect ? '✅' : '❌'}`);
    console.log(`   connect-src 'https://www.google.com/recaptcha/': ${hasRecaptchaConnect ? '✅' : '❌'}`);

    // Verificação frame-src para reCAPTCHA
    const hasRecaptchaFrame = frameSrc.includes('https://www.google.com/recaptcha/');
    const hasRecaptchaFrame2 = frameSrc.includes('https://recaptcha.google.com/recaptcha/');

    console.log(`   frame-src 'https://www.google.com/recaptcha/': ${hasRecaptchaFrame ? '✅' : '❌'}`);
    console.log(`   frame-src 'https://recaptcha.google.com/recaptcha/': ${hasRecaptchaFrame2 ? '✅' : '❌'}`);

    console.log("\n🔍 VERIFICANDO GOOGLE PLACES API:");

    // Verificação connect-src para Places API
    const hasPlacesOld = connectSrc.includes('https://places.googleapis.com');
    const hasPlacesNew = connectSrc.includes('https://places.googleapis.com/v1/');

    console.log(`   connect-src 'https://places.googleapis.com': ${hasPlacesOld ? '✅' : '❌'} (API antiga)`);
    console.log(`   connect-src 'https://places.googleapis.com/v1/': ${hasPlacesNew ? '✅' : '❌'} (API nova - CORRIGIDO)`);

    console.log("\n=== RESUMO DA VALIDAÇÃO ===");

    const recaptchaOk = hasGoogleDomain && hasRecaptchaDomain && hasGstaticRecaptcha && hasGoogleConnect && hasRecaptchaConnect && hasRecaptchaFrame && hasRecaptchaFrame2;
    const placesOk = hasPlacesOld && hasPlacesNew;

    console.log(`🎯 Google reCAPTCHA: ${recaptchaOk ? '✅ TOTALMENTE FUNCIONAL' : '❌ PRECISA CORREÇÃO'}`);
    console.log(`🎯 Google Places API: ${placesOk ? '✅ TOTALMENTE FUNCIONAL' : '❌ PRECISA CORREÇÃO'}`);

    if (recaptchaOk && placesOk) {
      console.log("\n🎉 SUCESSO! Todas as correções CSP foram aplicadas corretamente!");
      console.log("   - reCAPTCHA v2/v3 deve funcionar sem erros CSP");
      console.log("   - Google Places API (nova e antiga) deve funcionar");
      console.log("   - Console do navegador não deve mostrar erros CSP para estes serviços");
    } else {
      console.log("\n⚠️  Algumas correções ainda precisam ser aplicadas.");
    }

  } catch (error) {
    console.error("❌ Erro ao validar CSP:", error);
  }
};

// Executar validação
checkRequirements();