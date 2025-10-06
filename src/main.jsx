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

// Enhanced error handler setup with detailed logging
const setupGlobalErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    const errorDetails = {
      message: event.message || 'Unknown error',
      filename: event.filename || 'Unknown file',
      lineno: event.lineno || 0,
      colno: event.colno || 0,
      error: event.error ? {
        name: event.error.name,
        message: event.error.message,
        stack: event.error.stack
      } : null,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Global error:', errorDetails);

    // Send to error tracking service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `${errorDetails.message} at ${errorDetails.filename}:${errorDetails.lineno}`,
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
if (import.meta.env.PROD && import.meta.env.VITE_GA_ID) {
  try {
    initializeAnalytics();
    console.log('Analytics initialized');
  } catch (error) {
    console.warn('Failed to initialize analytics:', error);
  }
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

// Render without auth providers (removed)
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <GoogleTagManager gtmId={import.meta.env.VITE_GTM_ID} />
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