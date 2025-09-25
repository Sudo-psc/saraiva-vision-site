import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.simple';
import './index.css';

// Get root element
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

try {
    root.render(
        <React.StrictMode>
            <Router>
                <App />
            </Router>
        </React.StrictMode>
    );
} catch (error) {
    console.error('Failed to render app:', error);
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