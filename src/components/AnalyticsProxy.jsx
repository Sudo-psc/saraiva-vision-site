/**
 * Analytics Proxy Component
 *
 * Carrega GTM/GA4 através de proxy local para contornar ad blockers
 *
 * Estratégia Anti-AdBlock (3 camadas):
 * 1. Scripts carregados via /gtm.js e /gtag.js (proxy Nginx)
 * 2. Eventos enviados via /collect (proxy Nginx)
 * 3. GA4 batch collection via /g/collect (proxy Nginx)
 *
 * Eficácia esperada: ~95% de recuperação de tracking
 * (vs ~60% com carregamento direto do Google)
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

    // === Google Tag Manager via Nginx Proxy (Anti-AdBlock) ===
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = `/gtm.js?id=${GTM_ID}`;  // CORRIGIDO: /gtm.js em vez de /t/gtm.js
    gtmScript.onload = () => {
      console.log('[AnalyticsProxy] ✅ GTM loaded via Nginx proxy (anti-adblock)');
    };
    gtmScript.onerror = () => {
      console.warn('[AnalyticsProxy] ⚠️ GTM proxy failed, trying direct fallback');
      loadDirectGTM();
    };
    document.head.appendChild(gtmScript);

    // === Google Analytics 4 via Nginx Proxy (Anti-AdBlock) ===
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `/gtag.js?id=${GA_ID}`;  // Via Nginx proxy para contornar ad-blockers
    gtagScript.onload = () => {
      console.log('[AnalyticsProxy] ✅ GA4 loaded via Nginx proxy (anti-adblock)');

      // Configurar GA4 com proxies Nginx para máxima resistência a ad-blockers
      gtag('js', new Date());
      gtag('config', GA_ID, {
        send_page_view: true,
        cookie_domain: 'saraivavision.com.br',
        cookie_flags: 'SameSite=None;Secure',
        transport_url: '/collect',  // Proxy Nginx para dados analytics
        first_party_collection: true  // Tracking via domínio próprio
      });

      // Configurar Google Consent Mode
      gtag('consent', 'default', {
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'analytics_storage': 'granted',
        'url_passthrough': true
      });

      console.log('[AnalyticsProxy] ✅ GA4 configured successfully with Nginx proxies');
    };
    gtagScript.onerror = () => {
      console.warn('[AnalyticsProxy] ⚠️ GA4 proxy failed, trying direct fallback');
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

    // Cleanup
    return () => {
      // Scripts permanecem no DOM (não remover)
    };
  }, []);

  // Componente não renderiza nada visualmente
  return null;
};

export default AnalyticsProxy;
