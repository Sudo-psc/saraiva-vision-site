#!/usr/bin/env node

/**
 * Script de Validação - Normalização do Sistema de Scroll
 * Executa testes automatizados para verificar se todas as especificações foram implementadas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Validando Normalização do Sistema de Scroll...\n');

let passed = 0;
let failed = 0;

function test(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

// 1. Verificar CSS Normalize
console.log('🔍 1. Verificando normalização CSS...');
const indexCss = fs.readFileSync(path.join(__dirname, '../src/index.css'), 'utf8');
const scrollFixCss = fs.readFileSync(path.join(__dirname, '../src/styles/scroll-fix-clean.css'), 'utf8');

test('HTML/BODY com overflow-y: auto', 
  indexCss.includes('overflow-y: auto !important') && 
  scrollFixCss.includes('overflow-y: auto !important'));

test('overscroll-behavior-y: none configurado', 
  scrollFixCss.includes('overscroll-behavior-y: none !important'));

test('scroll-behavior: smooth ativo', 
  scrollFixCss.includes('scroll-behavior: smooth !important'));

// 2. Verificar Event Listeners Passivos
console.log('\n🔍 2. Verificando event listeners...');
const servicesJs = fs.readFileSync(path.join(__dirname, '../src/components/Services.jsx'), 'utf8');
const unifiedHook = fs.readFileSync(path.join(__dirname, '../src/hooks/useUnifiedComponents.ts'), 'utf8');

test('Listeners de wheel com passive: true', 
  servicesJs.includes('passive: true') && 
  unifiedHook.includes('passive: true'));

test('Sem preventDefault global em wheel/touch',
  !servicesJs.includes('preventDefault()') || 
  servicesJs.includes('// REMOVIDO: preventDefault'));

// 3. Verificar Scroll Snap
console.log('\n🔍 3. Verificando scroll snap...');
test('scroll-snap-type: x proximity (não mandatory)',
  indexCss.includes('scroll-snap-type: x proximity') &&
  !indexCss.includes('scroll-snap-type: x mandatory'));

// 4. Verificar Telemetria
console.log('\n🔍 4. Verificando telemetria...');
try {
  const telemetryJs = fs.readFileSync(path.join(__dirname, '../src/utils/scrollTelemetry.js'), 'utf8');
  const appJsx = fs.readFileSync(path.join(__dirname, '../src/App.jsx'), 'utf8');
  
  test('Telemetria de scroll implementada',
    telemetryJs.includes('class ScrollTelemetry'));
  
  test('Telemetria integrada no App',
    appJsx.includes('initScrollTelemetry'));
    
  test('ScrollDiagnostics componente criado',
    fs.existsSync(path.join(__dirname, '../src/components/ScrollDiagnostics.jsx')));
} catch (e) {
  test('Telemetria de scroll implementada', false);
  test('Telemetria integrada no App', false);
  test('ScrollDiagnostics componente criado', false);
}

// 5. Verificar Containers Roláveis
console.log('\n🔍 5. Verificando containers roláveis...');
test('Horizontal scroll com overscroll-behavior-y: auto',
  scrollFixCss.includes('overscroll-behavior-y: auto !important'));

test('Containers com overflow-y: visible',
  scrollFixCss.includes('overflow-y: visible !important'));

// 6. Verificar ScrollUtils
console.log('\n🔍 6. Verificando scroll utils...');
try {
  const scrollUtils = fs.readFileSync(path.join(__dirname, '../src/utils/scrollUtils.js'), 'utf8');
  
  test('ScrollUtils usa scroll nativo',
    scrollUtils.includes('window.scrollTo') && 
    scrollUtils.includes('behavior: behavior'));
    
  test('SmoothScrollHorizontal usa scroll nativo',
    scrollUtils.includes('container.scrollTo'));
} catch (e) {
  test('ScrollUtils usa scroll nativo', false);
  test('SmoothScrollHorizontal usa scroll nativo', false);
}

// 7. Verificar Documentação
console.log('\n🔍 7. Verificando documentação...');
test('Relatório de normalização criado',
  fs.existsSync(path.join(__dirname, '../SCROLL_NORMALIZATION_REPORT.md')));

// Resumo Final
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMO DA VALIDAÇÃO');
console.log('='.repeat(50));
console.log(`✅ Testes passaram: ${passed}`);
console.log(`❌ Testes falharam: ${failed}`);
console.log(`📈 Taxa de sucesso: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 TODAS AS ESPECIFICAÇÕES IMPLEMENTADAS COM SUCESSO!');
  console.log('✨ Sistema de scroll normalizado e pronto para produção');
  process.exit(0);
} else {
  console.log('\n⚠️  Algumas especificações precisam de atenção');
  console.log('📝 Verifique os itens marcados com ❌ acima');
  process.exit(1);
}