import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import App from '@/App';
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

// Wait for i18n to be ready before rendering to prevent context issues
const renderApp = () => {
  try {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <I18nextProvider i18n={i18n}>
            <Router>
              <Suspense fallback={<div>Carregando...</div>}>
                <App />
              </Suspense>
            </Router>
          </I18nextProvider>
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
};

// Ensure i18n is ready before rendering
if (i18n.isInitialized) {
  renderApp();
} else {
  i18n.on('initialized', renderApp);
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