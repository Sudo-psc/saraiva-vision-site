import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@/App';
import '@/i18n';
import '@/index.css';
import { initPerformanceOptimizations } from '@/utils/performanceOptimizer';
import { initWebVitals } from '@/utils/webVitalsMonitoring';
import { bindConsentUpdates, persistUTMParameters } from '@/utils/analytics';
import { inlineCriticalCSS } from '@/utils/criticalCSS';

// Inicializar CSS crítico antes de tudo (desabilitado temporariamente)
// inlineCriticalCSS();

// Inicializar otimizações de performance
initPerformanceOptimizations();

// Inicializar monitoramento Web Vitals
initWebVitals({
  debug: import.meta.env.DEV,
  endpoint: import.meta.env.PROD ? '/api/web-vitals' : null
});

// Vincular atualizações de consentimento aos vendors (GA/Meta)
bindConsentUpdates();

// Persistir parâmetros UTM para tracking
persistUTMParameters();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Suspense fallback="loading...">
        <App />
      </Suspense>
    </Router>
  </React.StrictMode>
);

// Registrar Service Worker para PWA (somente em produção e quando suportado)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration?.update) {
          // Verifica atualizações periodicamente
          setInterval(() => registration.update(), 60 * 60 * 1000);
        }
      })
      .catch((err) => {
        // Silencia erros em produção para evitar ruído no console
        // console.debug('SW registration failed:', err);
      });
  });
}
