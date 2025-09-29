import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './i18n'; // Initialize i18n
import { redirectToBackup } from './utils/redirectToBackup';

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

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Render without PostHog integration
try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Router future={{ 
          v7_startTransition: true, 
          v7_relativeSplatPath: true 
        }}>
          <AuthProvider>
            <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
              <App />
            </Suspense>
          </AuthProvider>
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