import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import '@/i18n';
import '@/index.css';
// Non-critical modules will be loaded lazily to avoid unused preloads
import { setupGlobalErrorHandlers } from '@/utils/setupGlobalErrorHandlers';
// import healthcareMonitoring from '@/utils/healthcareMonitoringSystem'; // DESABILITADO
import ErrorBoundary from '@/components/ErrorBoundary';

// Defer costly, non-critical modules to idle (post-load)
if (typeof window !== 'undefined') {
  const idle = (cb) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout: 2000 });
    } else {
      setTimeout(cb, 1200);
    }
  };

  window.addEventListener('load', () => {
    idle(async () => {
      try {
        const [perf, vitals, analytics, criticalCSS] = await Promise.all([
          import('@/utils/performanceOptimizer'),
          import('@/utils/webVitalsMonitoring'),
          import('@/utils/analytics'),
          import('@/utils/criticalCSS')
        ]);
        perf.initPerformanceOptimizations?.();
        vitals.initWebVitals?.({
          debug: import.meta.env.DEV,
          endpoint: import.meta.env.PROD ? '/api/web-vitals' : null
        });
        analytics.bindConsentUpdates?.();
        analytics.persistUTMParameters?.();
        // optional: inline critical CSS if re-enabled
        // criticalCSS.inlineCriticalCSS?.();
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Deferred init failed:', e);
      }
    });
  });
}

// Reduz ruído no console oriundo de extensões/ad blockers,
// sem mascarar erros reais da aplicação
setupGlobalErrorHandlers();

// Inicializar sistema de monitoramento específico para ambiente médico
// Inclui gestão de sessões, tokens, compatibilidade com ad blockers e alertas críticos
// TEMPORARIAMENTE DESABILITADO PARA DEBUG
/*
healthcareMonitoring.init().catch((error) => {
  console.warn('⚠️ Healthcare monitoring initialization failed:', error);
});
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Suspense fallback="loading...">
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Suspense>
    </Router>
  </React.StrictMode>
);

// Service Worker Registration com Workbox - DESABILITADO EM DEV
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  // Import the new service worker manager
  import('./utils/serviceWorkerManager.js').then(({ default: swManager }) => {
    // Manager automatically registers SW and handles updates
    console.log('[SW] Workbox service worker manager carregado');
  }).catch(error => {
    console.error('[SW] Erro ao carregar service worker manager:', error);
  });
}

// Limpar service workers existentes em desenvolvimento
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('[DEV] Removendo service worker:', registration.scope);
      registration.unregister();
    });
  });
}
