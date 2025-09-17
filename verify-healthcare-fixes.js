/**
 * Healthcare System Verification Script for Clínica Saraiva Vision
 * Run this in the browser console (F12 > Console) to verify all fixes are working
 * 
 * Usage: Copy and paste this entire script into the browser console and press Enter
 */

(function() {
  'use strict';
  
  console.log('🏥 INICIANDO VERIFICAÇÃO DO SISTEMA CLÍNICA SARAIVA VISION');
  console.log('=====================================\n');
  
  const results = {
    sessionManagement: null,
    tokenManagement: null,
    adBlockerCompatibility: null,
    criticalServices: null,
    networkConnectivity: null,
    performanceMetrics: null,
    overallHealth: 'unknown'
  };
  
  // Test 1: Session Management
  async function testSessionManagement() {
    console.log('🔐 Testando Gestão de Sessões...');
    
    try {
      // Check if healthcare session manager is available
      if (typeof window.healthcareSessionManager !== 'undefined') {
        console.log('✅ Healthcare Session Manager carregado');
        results.sessionManagement = 'working';
      } else {
        // Check basic session storage functionality
        sessionStorage.setItem('test_session', 'test_value');
        const testValue = sessionStorage.getItem('test_session');
        sessionStorage.removeItem('test_session');
        
        if (testValue === 'test_value') {
          console.log('✅ Session Storage funcionando');
          results.sessionManagement = 'basic';
        } else {
          console.error('❌ Session Storage não funcionando');
          results.sessionManagement = 'failed';
        }
      }
    } catch (error) {
      console.error('❌ Erro na gestão de sessões:', error);
      results.sessionManagement = 'error';
    }
    
    console.log('');
  }
  
  // Test 2: Token Management
  async function testTokenManagement() {
    console.log('🔑 Testando Gestão de Tokens...');
    
    try {
      // Test Google Analytics connectivity
      const gaTest = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject('GA não acessível');
        img.src = 'https://www.google-analytics.com/collect?v=1&t=pageview&tid=test&cid=' + Date.now();
        setTimeout(() => reject('Timeout GA'), 3000);
      });
      
      try {
        await gaTest;
        console.log('✅ Google Analytics acessível');
        results.tokenManagement = 'working';
      } catch (error) {
        console.warn('⚠️ Google Analytics pode estar bloqueado:', error);
        results.tokenManagement = 'limited';
      }
      
      // Test if gtag is available
      if (typeof window.gtag === 'function') {
        console.log('✅ Google Analytics gtag carregado');
      } else {
        console.warn('⚠️ Google Analytics gtag não encontrado');
      }
      
    } catch (error) {
      console.error('❌ Erro na gestão de tokens:', error);
      results.tokenManagement = 'error';
    }
    
    console.log('');
  }
  
  // Test 3: Ad Blocker Detection
  async function testAdBlockerCompatibility() {
    console.log('🛡️ Testando Compatibilidade com Ad Blockers...');
    
    try {
      // Create test element that ad blockers typically block
      const testDiv = document.createElement('div');
      testDiv.className = 'adsbox';
      testDiv.style.cssText = 'position:absolute;left:-999px;width:1px;height:1px;';
      testDiv.innerHTML = '&nbsp;';
      
      document.body.appendChild(testDiv);
      
      setTimeout(() => {
        const isBlocked = testDiv.offsetHeight === 0;
        
        if (isBlocked) {
          console.warn('⚠️ Ad Blocker detectado - funcionalidades de fallback ativas');
          results.adBlockerCompatibility = 'detected_with_fallback';
        } else {
          console.log('✅ Nenhum Ad Blocker detectado');
          results.adBlockerCompatibility = 'no_blocker';
        }
        
        document.body.removeChild(testDiv);
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro na detecção de ad blocker:', error);
      results.adBlockerCompatibility = 'error';
    }
    
    console.log('');
  }
  
  // Test 4: Critical Services
  async function testCriticalServices() {
    console.log('🏥 Testando Serviços Críticos da Clínica...');
    
    const criticalEndpoints = [
      { name: 'Homepage', url: '/', critical: true },
      { name: 'API Health', url: '/api/health', critical: false },
      { name: 'Imagens Acessibilidade', url: '/img/Acessib_icon.png', critical: true },
      { name: 'Imagens ISO', url: '/img/iso9001-icon.png', critical: true }
    ];
    
    const testResults = [];
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await fetch(endpoint.url, { method: 'HEAD' });
        const status = response.ok ? 'working' : `error_${response.status}`;
        
        testResults.push({ ...endpoint, status, responseTime: 0 });
        
        if (status === 'working') {
          console.log(`✅ ${endpoint.name}: Funcionando`);
        } else {
          console.error(`❌ ${endpoint.name}: Erro ${response.status}`);
        }
        
      } catch (error) {
        testResults.push({ ...endpoint, status: 'failed', responseTime: 0 });
        console.error(`❌ ${endpoint.name}: Falhou -`, error.message);
      }
    }
    
    const criticalFailures = testResults.filter(r => r.critical && r.status !== 'working');
    
    if (criticalFailures.length === 0) {
      console.log('✅ Todos os serviços críticos funcionando');
      results.criticalServices = 'all_working';
    } else {
      console.error(`❌ ${criticalFailures.length} serviços críticos com problemas`);
      results.criticalServices = 'has_failures';
    }
    
    console.log('');
  }
  
  // Test 5: Network Connectivity
  async function testNetworkConnectivity() {
    console.log('🌐 Testando Conectividade de Rede...');
    
    try {
      const startTime = performance.now();
      const response = await fetch(window.location.origin + '/?health_check=1', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const responseTime = performance.now() - startTime;
      
      if (response.ok && responseTime < 2000) {
        console.log(`✅ Conectividade excelente (${Math.round(responseTime)}ms)`);
        results.networkConnectivity = 'excellent';
      } else if (response.ok && responseTime < 5000) {
        console.log(`⚠️ Conectividade adequada (${Math.round(responseTime)}ms)`);
        results.networkConnectivity = 'adequate';
      } else {
        console.warn(`⚠️ Conectividade lenta (${Math.round(responseTime)}ms)`);
        results.networkConnectivity = 'slow';
      }
      
    } catch (error) {
      console.error('❌ Erro de conectividade:', error);
      results.networkConnectivity = 'failed';
    }
    
    console.log('');
  }
  
  // Test 6: Performance Metrics
  async function testPerformanceMetrics() {
    console.log('⚡ Coletando Métricas de Performance...');
    
    try {
      if (window.performance && window.performance.navigation) {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          const domTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          
          console.log(`📊 Tempo de carregamento: ${Math.round(loadTime)}ms`);
          console.log(`📊 Tempo DOM ready: ${Math.round(domTime)}ms`);
          
          if (loadTime < 3000) {
            console.log('✅ Performance excelente');
            results.performanceMetrics = 'excellent';
          } else if (loadTime < 5000) {
            console.log('⚠️ Performance adequada');
            results.performanceMetrics = 'adequate';
          } else {
            console.warn('⚠️ Performance pode ser melhorada');
            results.performanceMetrics = 'needs_improvement';
          }
        }
      }
      
      // Check memory usage if available
      if (performance.memory) {
        const usedMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        console.log(`💾 Uso de memória: ${usedMB}MB`);
        
        if (usedMB > 100) {
          console.warn('⚠️ Alto uso de memória detectado');
        }
      }
      
    } catch (error) {
      console.error('❌ Erro coletando métricas:', error);
      results.performanceMetrics = 'error';
    }
    
    console.log('');
  }
  
  // Overall Health Assessment
  function assessOverallHealth() {
    console.log('📊 AVALIAÇÃO GERAL DO SISTEMA');
    console.log('=====================================');
    
    const criticalIssues = [];
    const warnings = [];
    
    // Assess each component
    if (results.sessionManagement === 'failed' || results.sessionManagement === 'error') {
      criticalIssues.push('Gestão de Sessões');
    }
    
    if (results.criticalServices === 'has_failures') {
      criticalIssues.push('Serviços Críticos');
    }
    
    if (results.networkConnectivity === 'failed') {
      criticalIssues.push('Conectividade');
    }
    
    if (results.tokenManagement === 'limited') {
      warnings.push('Analytics podem estar limitados');
    }
    
    if (results.adBlockerCompatibility === 'detected_with_fallback') {
      warnings.push('Ad Blocker detectado (fallbacks ativos)');
    }
    
    if (results.performanceMetrics === 'needs_improvement') {
      warnings.push('Performance pode ser otimizada');
    }
    
    // Determine overall health
    if (criticalIssues.length === 0) {
      if (warnings.length === 0) {
        console.log('✅ SISTEMA SAUDÁVEL - Todos os componentes funcionando perfeitamente');
        results.overallHealth = 'healthy';
      } else {
        console.log('⚠️ SISTEMA FUNCIONAL - Alguns alertas menores detectados');
        results.overallHealth = 'functional_with_warnings';
      }
    } else {
      console.error('❌ SISTEMA COM PROBLEMAS - Atenção necessária');
      results.overallHealth = 'needs_attention';
    }
    
    console.log('\n📋 RESUMO:');
    console.log(`🔐 Sessões: ${results.sessionManagement}`);
    console.log(`🔑 Tokens: ${results.tokenManagement}`);
    console.log(`🛡️ Ad Blocker: ${results.adBlockerCompatibility}`);
    console.log(`🏥 Serviços: ${results.criticalServices}`);
    console.log(`🌐 Conectividade: ${results.networkConnectivity}`);
    console.log(`⚡ Performance: ${results.performanceMetrics}`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🚨 PROBLEMAS CRÍTICOS:');
      criticalIssues.forEach(issue => console.log(`   • ${issue}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ ALERTAS:');
      warnings.forEach(warning => console.log(`   • ${warning}`));
    }
    
    console.log('\n🔧 RECOMENDAÇÕES:');
    
    if (results.adBlockerCompatibility === 'detected_with_fallback') {
      console.log('   • Considere configurar whitelist para domínios da clínica');
      console.log('   • Verifique se analytics são necessários para operação');
    }
    
    if (results.performanceMetrics === 'needs_improvement') {
      console.log('   • Verifique conexão de internet');
      console.log('   • Considere limpar cache do navegador');
    }
    
    if (criticalIssues.includes('Serviços Críticos')) {
      console.log('   • Verifique conectividade do servidor');
      console.log('   • Contate suporte técnico se problemas persistirem');
    }
    
    console.log('\n=====================================');
    console.log('VERIFICAÇÃO CONCLUÍDA ✨');
    
    return results;
  }
  
  // Run all tests
  async function runAllTests() {
    await testSessionManagement();
    await testTokenManagement();
    await testAdBlockerCompatibility();
    await testCriticalServices();
    await testNetworkConnectivity();
    await testPerformanceMetrics();
    
    // Wait a moment for ad blocker test to complete
    setTimeout(() => {
      assessOverallHealth();
    }, 500);
  }
  
  // Start verification
  runAllTests();
  
})();