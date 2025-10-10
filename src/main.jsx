import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/glass-effects.css';
import './styles/cta.css';
import './styles/cookies.css';
import './styles/forms.css';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n'; // Initialize i18n
import GoogleTagManager from './components/GoogleTagManager';
import { redirectToBackup } from './utils/redirectToBackup';
import { initializeAnalytics, trackWebVitals } from './utils/analytics';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import './utils/performanceMonitor';
import errorTracker from './lib/errorTracking'; // Advanced error tracking
import ErrorTracker from '../scripts/error-tracker.js'; // Robust error tracker
import analytics from './services/analytics-service.js'; // Robust analytics with retry

// Initialize robust error tracker
const robustErrorTracker = new ErrorTracker({
  endpoint: '/api/errors',
  environment: import.meta.env.MODE || 'production',
  release: import.meta.env.VITE_APP_VERSION || '2.0.1',
  enabled: true
});

// Expose globally for debugging
window.errorTracker = robustErrorTracker;
window.analytics = analytics;

// Enhanced error handler setup with detailed logging
const setupGlobalErrorHandlers = () => {
  // Robust error tracker handles everything automatically
  console.log('[main.jsx] Robust error tracking initialized');

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

// Initialize Analytics in production
if (import.meta.env.PROD) {
  try {
    // Forçar inicialização com valores hardcoded como fallback
    const gaId = import.meta.env.VITE_GA_ID || 'G-LXWRK8ELS6';
    const gtmId = import.meta.env.VITE_GTM_ID || 'GTM-KF2NP85D';

    console.log('🔧 Analytics IDs:', { gaId, gtmId });

    if (gaId) {
      initializeAnalytics();
      console.log('✅ Analytics initialized with GA ID:', gaId);
    }

    // Verificar se as variáveis foram carregadas do build
    if (!import.meta.env.VITE_GA_ID) {
      console.warn('⚠️ VITE_GA_ID not found in build, using fallback');
    }
    if (!import.meta.env.VITE_GTM_ID) {
      console.warn('⚠️ VITE_GTM_ID not found in build, using fallback');
    }
  } catch (error) {
    console.warn('❌ Failed to initialize analytics:', error);
  }
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

// Initialize Web Vitals tracking
function sendToAnalytics(metric) {
  try {
    trackWebVitals(metric);
  } catch (error) {
    console.warn('Failed to track web vital:', error);
  }
}

if (import.meta.env.PROD) {
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onINP(sendToAnalytics);  // Interaction to Next Paint (replaces FID)
  onFCP(sendToAnalytics);  // First Contentful Paint
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Render app without PostHog
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <GoogleTagManager gtmId={import.meta.env.VITE_GTM_ID || 'GTM-KF2NP85D'} />
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}>
          <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
            <App />
          </Suspense>
        </Router>
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  redirectToBackup();
  // Fallback render
  root.render(
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Erro ao carregar a aplicação</h1>
      <p>Por favor, recarregue a página.</p>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Recarregar
      </button>
    </div>
  );
}