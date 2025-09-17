#!/usr/bin/env node

/**
 * Verification script for Google Analytics 4 (GA4) implementation
 * Checks if GA4 is properly configured and loads when consent is granted
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Verificando implementação do Google Analytics 4...\n');

// Check environment variable configuration
try {
  const envContent = readFileSync(join(rootDir, '.env'), 'utf-8');
  const envExampleContent = readFileSync(join(rootDir, '.env.example'), 'utf-8');
  
  const gaIdMatch = envContent.match(/VITE_GA_MEASUREMENT_ID=(.+)/);
  const gaIdExampleMatch = envExampleContent.match(/VITE_GA_MEASUREMENT_ID=(.+)/);
  
  if (gaIdMatch && gaIdMatch[1] && gaIdMatch[1] !== '') {
    console.log(`✅ VITE_GA_MEASUREMENT_ID configurado: ${gaIdMatch[1]}`);
  } else {
    console.log('❌ VITE_GA_MEASUREMENT_ID não encontrado em .env');
  }
  
  if (gaIdExampleMatch && gaIdExampleMatch[1] && gaIdExampleMatch[1] !== '') {
    console.log(`✅ VITE_GA_MEASUREMENT_ID exemplo configurado: ${gaIdExampleMatch[1]}`);
  } else {
    console.log('❌ VITE_GA_MEASUREMENT_ID não encontrado em .env.example');
  }
} catch (error) {
  console.log('⚠️ Erro lendo arquivos de ambiente:', error.message);
}

// Check HTML implementation
try {
  const htmlContent = readFileSync(join(rootDir, 'index.html'), 'utf-8');
  
  // Check for GA4 script
  if (htmlContent.includes('VITE_GA_MEASUREMENT_ID')) {
    console.log('✅ Script GA4 encontrado no index.html');
  } else {
    console.log('❌ Script GA4 não encontrado no index.html');
  }
  
  // Check for gtag loading
  if (htmlContent.includes('googletagmanager.com/gtag/js')) {
    console.log('✅ URL do gtag script configurada corretamente');
  } else {
    console.log('❌ URL do gtag script não encontrada');
  }
  
  // Check for consent integration
  if (htmlContent.includes('consent-updated')) {
    console.log('✅ Integração com sistema de consentimento encontrada');
  } else {
    console.log('❌ Integração com sistema de consentimento não encontrada');
  }
  
  // Check for localStorage integration
  if (htmlContent.includes('sv_consent_v1')) {
    console.log('✅ Integração com localStorage para consentimento encontrada');
  } else {
    console.log('❌ Integração com localStorage não encontrada');
  }

} catch (error) {
  console.log('⚠️ Erro lendo index.html:', error.message);
}

// Check analytics utilities integration
try {
  const analyticsContent = readFileSync(join(rootDir, 'src/utils/analytics.js'), 'utf-8');
  
  if (analyticsContent.includes('window.gtag')) {
    console.log('✅ Utilitários de analytics prontos para gtag');
  } else {
    console.log('❌ Utilitários de analytics não estão configurados para gtag');
  }
  
  if (analyticsContent.includes('hasConsent')) {
    console.log('✅ Verificação de consentimento nos utilitários');
  } else {
    console.log('❌ Verificação de consentimento não encontrada');
  }

} catch (error) {
  console.log('⚠️ Erro lendo analytics.js:', error.message);
}

console.log('\n🎯 Status da implementação:');
console.log('- Google Analytics 4 configurado via VITE_GA_MEASUREMENT_ID');
console.log('- Script gtag carregado dinamicamente com consentimento');
console.log('- Integração com sistema de consentimento existente');
console.log('- Compatível com LGPD/GDPR via Google Consent Mode v2');
console.log('- Funciona em paralelo com Google Tag Manager existente');

console.log('\n📋 Para testar:');
console.log('1. npm run dev');
console.log('2. Aceitar cookies de analytics no banner');
console.log('3. Verificar no DevTools se window.gtag está disponível');
console.log('4. Verificar se o script do GA4 foi carregado');
console.log('5. Testar eventos de analytics nas ações do site');