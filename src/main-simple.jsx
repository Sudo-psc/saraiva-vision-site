import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { PostHogProvider } from 'posthog-js/react';

// Componente simples para teste
const SimpleApp = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>
          🎉 React Funcionando!
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
          Se você está vendo esta mensagem, o React está renderizando corretamente.
        </p>
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#dcfce7', 
          borderRadius: '8px',
          color: '#166534'
        }}>
          <strong>✅ Status: Main.jsx Simplificado Carregado</strong>
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: '2025-05-24',
        capture_exceptions: true,
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <Router>
        <SimpleApp />
      </Router>
    </PostHogProvider>
  </React.StrictMode>
);
