import { useEffect } from 'react';

const GoogleTagManager = ({ gtmId }) => {
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return;

    const loadGTM = () => {
      if (window.gtmLoaded) return;
      window.gtmLoaded = true;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);

      const noscript = document.createElement('noscript');
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
      iframe.height = '0';
      iframe.width = '0';
      iframe.style.display = 'none';
      iframe.style.visibility = 'hidden';
      noscript.appendChild(iframe);
      
      document.body.insertBefore(noscript, document.body.firstChild);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        setTimeout(loadGTM, 2000);
      });
    } else {
      setTimeout(loadGTM, 2000);
    }

    const interactionEvents = ['mousedown', 'touchstart', 'scroll'];
    const loadOnInteraction = () => {
      loadGTM();
      interactionEvents.forEach(event => {
        window.removeEventListener(event, loadOnInteraction);
      });
    };

    interactionEvents.forEach(event => {
      window.addEventListener(event, loadOnInteraction, { once: true, passive: true });
    });

    return () => {
      interactionEvents.forEach(event => {
        window.removeEventListener(event, loadOnInteraction);
      });
    };
  }, [gtmId]);

  return null;
};

export default GoogleTagManager;
