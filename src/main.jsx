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
        const [vitals, analytics] = await Promise.all([
          import('@/utils/webVitalsMonitoring'),
          import('@/utils/analytics')
        ]);
        vitals.initWebVitals?.({
          debug: import.meta.env.DEV,
          endpoint: '/api/web-vitals'
        });
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

// Service Worker Registration - PROD only
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  import('./utils/serviceWorkerManager.js').then(({ default: swManager }) => {
    console.log('[SW] Workbox service worker manager loaded');
  }).catch(error => {
    console.error('[SW] Error loading service worker manager:', error);
  });
}