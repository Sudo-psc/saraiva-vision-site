import { useEffect } from 'react';

/**
 * Google Analytics (GA4) Component
 * Injects Google Analytics gtag.js script into the document head
 * Uses VITE_GA_ID environment variable
 */
const GoogleAnalytics = () => {
  const gaId = import.meta.env.VITE_GA_ID;

  useEffect(() => {
    // Only inject GA script in production
    if (import.meta.env.PROD && gaId) {
      let injected = false;
      let timerId = null;

      const injectScript = () => {
        if (injected || window.gtag) return;
        injected = true;

        // Create and inject the gtag script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;

        script.onload = () => {
          // Initialize gtag
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            window.dataLayer.push(arguments);
          }
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config', gaId, {
            // Enhanced measurement for healthcare platform
            allow_google_signals: true,
            send_page_view: false, // Let React Router handle page views
          });

          console.log(`✅ Google Analytics initialized with ID: ${gaId}`);
        };

        script.onerror = () => {
          console.warn(`⚠️ Failed to load Google Analytics script for ID: ${gaId}`);
        };

        document.head.appendChild(script);

        // Remove listeners
        ['scroll', 'click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
          window.removeEventListener(evt, injectScript);
        });
      };

      // Defer injection until user interaction or 3.5 seconds
      timerId = setTimeout(injectScript, 3500);
      ['scroll', 'click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, injectScript, { once: true, passive: true });
      });

      // Cleanup function
      return () => {
        if (timerId) clearTimeout(timerId);
        ['scroll', 'click', 'mousemove', 'keydown', 'touchstart'].forEach(evt => {
          window.removeEventListener(evt, injectScript);
        });
      };
    }
  }, [gaId]);

  // Render Helmet tags for SSR compatibility
  if (!import.meta.env.PROD || !gaId) {
    return null;
  }

  // GA4 does not use noscript iframe fallback (that's GTM-only).
  // This component only handles gtag.js loading.
  return null;
};

export default GoogleAnalytics;