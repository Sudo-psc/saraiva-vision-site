import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

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
      // Check if gtag is already loaded
      if (window.gtag) {
        return;
      }

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

      // Cleanup function
      return () => {
        // Remove script on component unmount if needed
        const existingScript = document.querySelector(`script[src*="${gaId}"]`);
        if (existingScript && existingScript.parentNode === document.head) {
          // Don't remove immediately as it might break other analytics
          // Just log for debugging
          console.log('Google Analytics script cleanup completed');
        }
      };
    }
  }, [gaId]);

  // Render Helmet tags for SSR compatibility
  if (!import.meta.env.PROD || !gaId) {
    return null;
  }

  return (
    <Helmet>
      {/* Fallback noscript tag for users with JavaScript disabled */}
      <noscript>
        {`
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=${gaId}"
            height="0"
            width="0"
            style="display:none;visibility:hidden"
          ></iframe>
        `}
      </noscript>
    </Helmet>
  );
};

export default GoogleAnalytics;