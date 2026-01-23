import { useEffect } from 'react';

const DEFAULT_GTM_ID = 'GTM-KF2NP85D';
const DEFAULT_GA_ID = 'G-LXWRK8ELS6';

const useDeferredAnalytics = ({
  gtmId = import.meta.env.VITE_GTM_ID || DEFAULT_GTM_ID,
  gaId = import.meta.env.VITE_GA_ID || DEFAULT_GA_ID,
  idleTimeout = 3000,
  enabled = true
} = {}) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let started = false;
    let idleId;
    let timeoutId;

    const start = () => {
      if (started) return;
      started = true;

      if (window.gtag || window.dataLayer) {
        return;
      }

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      window.gtag = gtag;

      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src = `/gtm.js?id=${gtmId}`;
      gtmScript.onerror = () => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);
      };
      document.head.appendChild(gtmScript);

      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `/gtag.js?id=${gaId}`;
      gtagScript.onload = () => {
        gtag('js', new Date());
        gtag('config', gaId, {
          send_page_view: true,
          cookie_domain: 'saraivavision.com.br',
          cookie_flags: 'SameSite=None;Secure',
          transport_url: '/collect',
          first_party_collection: true
        });
        gtag('consent', 'default', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'granted',
          url_passthrough: true
        });
      };
      gtagScript.onerror = () => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.onload = () => {
          gtag('js', new Date());
          gtag('config', gaId);
        };
        document.head.appendChild(script);
      };
      document.head.appendChild(gtagScript);
    };

    const scheduleIdle = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(start, { timeout: idleTimeout });
      } else {
        timeoutId = window.setTimeout(start, idleTimeout);
      }
    };

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    const handleInteraction = () => {
      start();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true, once: true });
    });

    scheduleIdle();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
      if (idleId && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, gaId, gtmId, idleTimeout]);
};

export default useDeferredAnalytics;
