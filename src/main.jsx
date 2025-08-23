import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import '@/i18n';
import '@/index.css';
import { initPerformanceOptimizations } from '@/utils/performanceOptimizer';

// Inicializar otimizações de performance
initPerformanceOptimizations();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Suspense fallback="loading...">
        <App />
      </Suspense>
    </Router>
  </React.StrictMode>
);