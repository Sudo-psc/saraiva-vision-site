import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import '@/i18n';
import '@/index.css';
import { setupGlobalErrorHandlers } from '@/utils/setupGlobalErrorHandlers';
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
        const [analytics] = await Promise.all([
          import('@/utils/analytics')
        ]);
        // Temporarily disable web vitals for Vercel deployment
        // const vitals = await import('@/utils/webVitalsMonitoring');
        // vitals.initWebVitals?.({
        //   debug: import.meta.env.DEV,
        //   endpoint: '/api/web-vitals'
        // });
        // Bind consent updates and persist UTMs
        analytics.bindConsentUpdates?.();
        analytics.persistUTMParameters?.();
        // Initialize global event trackers for automatic analytics
        analytics.initGlobalTrackers?.();
      } catch (e) {
        if (import.meta.env.DEV) console.warn('Deferred init failed:', e);
      }
    });
  });
}

// Reduz ruído no console oriundo de extensões/ad blockers,
// sem mascarar erros reais da aplicação
setupGlobalErrorHandlers();

// Render with better error handling for production
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<div>Carregando...</div>}>
            <App />
          </Suspense>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Fallback render
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Erro ao carregar a aplicação</h1>
      <p>Por favor, recarregue a página.</p>
      <button onClick={() => window.location.reload()}>Recarregar</button>
    </div>
  );
}

// Service Worker Registration - Temporarily disabled for Vercel deployment
// TODO: Re-enable after fixing authentication issues
// if (import.meta.env.PROD && 'serviceWorker' in navigator) {
//   import('./utils/serviceWorkerManager.js').then(({ default: swManager }) => {
//     console.log('[SW] Workbox service worker manager loaded');
//   }).catch(error => {
//     console.error('[SW] Error loading service worker manager:', error);
//   });
// }