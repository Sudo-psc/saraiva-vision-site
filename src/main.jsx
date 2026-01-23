import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
// Lazy i18n: Load critical translations sync, full translations async
import { initCriticalI18n, loadFullTranslations } from './i18n-lazy';
import DeferredGTM from './components/DeferredGTM';
import { redirectToBackup } from './utils/redirectToBackup';
import { ConfigProvider, createConfig } from '@/config';

// requestIdleCallback polyfill for Safari and older browsers
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  window.requestIdleCallback = function (cb, options) {
    const start = Date.now();
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start));
        }
      });
    }, options && options.timeout ? Math.min(options.timeout, 1) : 1);
  };
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}

// Initialize critical i18n immediately (minimal translations)
initCriticalI18n();

const appConfig = createConfig();

// Enhanced error handler setup with detailed logging
const setupGlobalErrorHandlers = () => {
  console.log('[main.jsx] Error tracking initialized');

  // Legacy compatibility - still send to GA if available
  window.addEventListener('error', (event) => {
    if (window.gtag && event.error) {
      window.gtag('event', 'exception', {
        description: `${event.error.message} at ${event.filename}:${event.lineno}`,
        fatal: false
      });
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const rejectionDetails = {
      reason: event.reason ? {
        name: event.reason.name,
        message: event.reason.message,
        stack: event.reason.stack
      } : String(event.reason),
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    console.error('Unhandled promise rejection:', rejectionDetails);

    // Send to error tracking service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Unhandled rejection: ${rejectionDetails.reason}`,
        fatal: false
      });
    }
  });
};

setupGlobalErrorHandlers();

const scheduleIdleWork = (fn, timeout = 2500) => {
  if (typeof window === 'undefined') return null;
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(fn, { timeout });
  }
  return window.setTimeout(fn, timeout);
};

const cancelIdleWork = (id) => {
  if (!id || typeof window === 'undefined') return;
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};

// Load full translations after initial render
const loadDeferredTranslations = async () => {
  try {
    await loadFullTranslations();
    console.log('✅ Full translations loaded');
  } catch (error) {
    console.warn('❌ Failed to load full translations:', error);
  }
};

// Load translations immediately after initial render (not deferred)
// This ensures translations are available quickly for better UX
if (typeof window !== 'undefined') {
  // Load immediately on next tick to not block initial render
  Promise.resolve().then(() => {
    loadDeferredTranslations();
  });
}

const loadDeferredAnalytics = async () => {
  try {
    const [
      analyticsUtils,
      webVitals,
      analyticsService,
      ,
      webVitalsUtil
    ] = await Promise.all([
      import('./utils/analytics'),
      import('web-vitals'),
      import('./services/analytics-service.js'),
      import('./utils/performanceMonitor'),
      import('./utils/webVitals')
    ]);

    const { configureAnalytics, initializeAnalytics, trackWebVitals } = analyticsUtils;
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;

    // Initialize custom Web Vitals monitoring with enhanced logging
    if (webVitalsUtil?.initWebVitals) {
      webVitalsUtil.initWebVitals();
    }

    configureAnalytics({
      gaId: appConfig.analytics.gaId,
      metaPixelId: appConfig.analytics.metaPixelId
    });

    window.analytics = analyticsService.default;

    if (appConfig.analytics.enabled) {
      initializeAnalytics({
        gaId: appConfig.analytics.gaId,
        metaPixelId: appConfig.analytics.metaPixelId
      });
      console.log('✅ Analytics initialized with GA ID:', appConfig.analytics.gaId);
    }

    const sendToAnalytics = (metric) => {
      try {
        trackWebVitals(metric);
      } catch (error) {
        console.warn('Failed to track web vital:', error);
      }
    };

    if (import.meta.env.PROD) {
      onCLS(sendToAnalytics);
      onINP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
    }
  } catch (error) {
    console.warn('❌ Failed to load deferred analytics:', error);
  }
};

if (import.meta.env.PROD) {
  let started = false;
  let idleId = null;

  const start = () => {
    if (started) return;
    started = true;
    cancelIdleWork(idleId);
    loadDeferredAnalytics();
  };

  idleId = scheduleIdleWork(start, 3000);

  ['mousedown', 'touchstart', 'keydown', 'scroll'].forEach((event) => {
    window.addEventListener(event, start, { passive: true, once: true });
  });
}

const loadDeferredErrorTracker = async () => {
  try {
    const module = await import('./lib/errorTracking');
    window.errorTracker = module.default;
  } catch (error) {
    console.warn('❌ Failed to load deferred error tracker:', error);
  }
};

if (import.meta.env.PROD) {
  let started = false;
  let idleId = null;

  const start = () => {
    if (started) return;
    started = true;
    cancelIdleWork(idleId);
    loadDeferredErrorTracker();
  };

  idleId = scheduleIdleWork(start, 3000);

  ['mousedown', 'touchstart', 'keydown', 'scroll'].forEach((event) => {
    window.addEventListener(event, start, { passive: true, once: true });
  });
}

// Register Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration.scope);

        // Notificar quando há nova versão
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Service Worker update found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✨ Nova versão disponível! Recarregue a página.');
            }
          });
        });
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);

        if (window.errorTracker) {
          window.errorTracker.captureException(error, {
            type: 'service_worker_registration'
          });
        }
      });
  });
}

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Render app with new ConfigProvider
try {
  root.render(
    <React.StrictMode>
      <ConfigProvider>
        <ErrorBoundary>
          <DeferredGTM gtmId={appConfig.analytics.gtmId} />
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
              <App />
            </Suspense>
          </Router>
        </ErrorBoundary>
      </ConfigProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  // Show error message instead of redirecting to backup
  // redirectToBackup() was causing redirect loops - disabled for stability
  // Use plain DOM manipulation instead of JSX to avoid jsxDEV issues in production
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 20px; text-align: center; font-family: Arial, sans-serif;';
  errorDiv.innerHTML = `
    <h1>Erro ao carregar a aplicação</h1>
    <p>Por favor, recarregue a página.</p>
    <p style="color: #666; font-size: 12px;">${error?.message || 'Erro desconhecido'}</p>
    <button id="reload-btn" style="padding: 10px 20px; font-size: 16px; margin-top: 10px; cursor: pointer;">
      Recarregar
    </button>
  `;
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDiv);
    document.getElementById('reload-btn')?.addEventListener('click', () => window.location.reload());
  }
}
