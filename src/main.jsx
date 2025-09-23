import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PostHogProvider } from 'posthog-js/react';
import App from '@/App';
import '@/index.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import './i18n'; // Initialize i18n

// Simple error handler setup
const setupGlobalErrorHandlers = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
};

setupGlobalErrorHandlers();

// PostHog configuration
import POSTHOG_CONFIG from '@/utils/posthogConfig';

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

// Render with PostHog integration
try {
  root.render(
    <React.StrictMode>
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={POSTHOG_CONFIG}
      >
        <ErrorBoundary>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
              <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando...</div>}>
                <App />
              </Suspense>
            </AuthProvider>
          </Router>
        </ErrorBoundary>
      </PostHogProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
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
