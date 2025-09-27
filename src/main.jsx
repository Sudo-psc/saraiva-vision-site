import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import './i18n'; // Initialize i18n
import { redirectToBackup } from './utils/redirectToBackup';

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
        <Router>
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