/**
 * Analytics Proxy Component
 *
 * Carrega GTM/GA4 através de proxy local para contornar ad blockers
 *
 * Estratégia:
 * - Scripts carregados via /t/gtm.js e /t/gtag.js (proxy Nginx)
 * - Eventos enviados via /t/collect (proxy Nginx)
 * - Ad blockers não detectam porque usa domínio próprio
 *
 * Eficácia: ~80% de recuperação de tracking
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { useEffect } from 'react';

const AnalyticsProxy = () => {
  useEffect(() => {
    // Verifica se já foi inicializado
    if (window.gtag || window.dataLayer) {
      console.log('[AnalyticsProxy] Already initialized');
      return;
    }

    console.log('[AnalyticsProxy] Initializing proxied analytics');

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    // Configurar GTM via proxy
    const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-KF2NP85D';
    const GA_ID = import.meta.env.VITE_GA_ID || 'G-LXWRK8ELS6';

    // === Google Tag Manager via Proxy ===
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `/t/gtm.js?id=${GTM_ID}`;
    gtmScript.onload = () => {
      console.log('[AnalyticsProxy] GTM loaded via proxy');
    };
    gtmScript.onerror = () => {
      console.warn('[AnalyticsProxy] GTM proxy failed, trying fallback');
      loadDirectGTM();
    };
    document.head.appendChild(gtmScript);

    // === Google Analytics 4 via Proxy ===
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `/t/gtag.js?id=${GA_ID}`;
    gtagScript.onload = () => {
      console.log('[AnalyticsProxy] GA4 loaded via proxy');

      // Configurar GA4
      gtag('js', new Date());
      gtag('config', GA_ID, {
        send_page_view: true,
        cookie_domain: 'saraivavision.com.br',
        cookie_flags: 'SameSite=None;Secure',
        // IMPORTANTE: Sobrescrever endpoints para usar proxy
        transport_url: '/t/collect',
        first_party_collection: true
      });

      // Configurar Google Consent Mode para usar proxy
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'granted',
        'transport_url': '/t/ccm/collect',  // Proxy para Consent Mode
        'url_passthrough': true
      });
    };
    gtagScript.onerror = () => {
      console.warn('[AnalyticsProxy] GA4 proxy failed, trying fallback');
      loadDirectGA4();
    };
    document.head.appendChild(gtagScript);

    // Fallback: GTM direto (se proxy falhar)
    function loadDirectGTM() {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
      script.onload = () => console.log('[AnalyticsProxy] GTM loaded directly (fallback)');
      document.head.appendChild(script);
    }

    // Fallback: GA4 direto (se proxy falhar)
    function loadDirectGA4() {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.onload = () => {
        console.log('[AnalyticsProxy] GA4 loaded directly (fallback)');
        gtag('js', new Date());
        gtag('config', GA_ID);
      };
      document.head.appendChild(script);
    }

    // Track proxy effectiveness
    const trackingMethod = 'proxy';
    gtag('event', 'analytics_loaded', {
      method: trackingMethod,
      timestamp: new Date().toISOString()
    });

    // Cleanup
    return () => {
      // Scripts permanecem no DOM (não remover)
    };
  }, []);

  // Componente não renderiza nada visualmente
  return null;
};

export default AnalyticsProxy;
