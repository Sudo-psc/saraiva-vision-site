import { useEffect } from 'react';

const GoogleTagManager = ({ gtmId }) => {
  useEffect(() => {
    if (!gtmId || typeof window === 'undefined') return;

    console.log('🏷️ Loading Google Tag Manager with anti-blocker techniques, ID:', gtmId);

    // Anti-blocker techniques
    const loadGTM = () => {
      if (window.gtmLoaded) {
        console.log('🏷️ GTM already loaded, skipping');
        return;
      }

      window.gtmLoaded = true;

      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });

      console.log('🏷️ Loading GTM script with anti-blocker techniques...');

      // Technique 1: Try to load via multiple methods
      const loadScript = (src, callback) => {
        try {
          // Method 1: Dynamic script injection
          const script = document.createElement('script');
          script.async = true;
          script.src = src;
          script.crossOrigin = 'anonymous';

          // Anti-detection techniques
          script.setAttribute('data-cfasync', 'false');
          script.type = 'text/javascript';

          const timestamp = new Date().getTime();
          script.src = `${src}&t=${timestamp}`;

          script.onload = () => {
            console.log('✅ GTM script loaded successfully');
            callback(true);
          };

          script.onerror = () => {
            console.warn('⚠️ GTM script failed to load - likely blocked');

            // Method 2: Try using fetch + eval (some blockers miss this)
            try {
              fetch(src, {
                method: 'GET',
                mode: 'cors',
                cache: 'no-cache'
              })
              .then(response => response.text())
              .then(scriptContent => {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = scriptContent;
                scriptElement.onload = () => {
                  console.log('✅ GTM loaded via fetch+eval technique');
                  callback(true);
                };
                scriptElement.onerror = () => {
                  console.log('❌ All GTM loading methods failed');
                  callback(false);
                };
                document.head.appendChild(scriptElement);
              })
              .catch(() => {
                console.log('❌ All GTM loading methods failed');
                callback(false);
              });
            } catch (error) {
              console.log('❌ Fetch+eval technique failed:', error);
              callback(false);
            }
          };

          const firstScript = document.getElementsByTagName('script')[0];
          firstScript.parentNode.insertBefore(script, firstScript);

        } catch (error) {
          console.error('❌ Error loading GTM:', error);
          callback(false);
        }
      };

      // Try local proxy first, then Google domains
      const domains = [
        `/gtm.js?id=${gtmId}`, // Local proxy - bypasses ad blockers
        `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
        `https://googletagmanager.com/gtm.js?id=${gtmId}`,
        `https://www.google-analytics.com/analytics.js` // Alternative GA script
      ];

      let attemptIndex = 0;
      const tryNextDomain = (success) => {
        if (success) {
          // Add noscript fallback for users with JS disabled
          const noscript = document.createElement('noscript');
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
          iframe.height = '0';
          iframe.width = '0';
          iframe.style.display = 'none';
          iframe.style.visibility = 'hidden';
          noscript.appendChild(iframe);
          document.body.insertBefore(noscript, document.body.firstChild);

          // GTM loaded successfully
          return;
        }

        attemptIndex++;
        if (attemptIndex < domains.length) {
          console.log(`🔄 Trying alternative domain (${attemptIndex}/${domains.length})`);
          setTimeout(() => loadScript(domains[attemptIndex], tryNextDomain), 100);
        } else {
          console.log('❌ All GTM loading methods failed - likely blocked by ad blocker');
        }
      };

      loadScript(domains[0], tryNextDomain);
    };

    // Load GTM immediately with additional fallback strategies
    const loadStrategies = [
      () => loadGTM(), // Immediate load
      () => setTimeout(loadGTM, 1000), // Delayed load 1s
      () => setTimeout(loadGTM, 3000), // Delayed load 3s
      () => setTimeout(loadGTM, 5000), // Delayed load 5s
    ];

    // Execute all load strategies
    loadStrategies.forEach((strategy, index) => {
      if (index === 0) {
        strategy(); // Execute immediately
      } else {
        // Only execute if GTM not loaded yet
        setTimeout(() => {
          if (!window.gtmLoaded) {
            strategy();
          }
        }, index * 1000);
      }
    });

    // Keep interaction loading as backup
    const interactionEvents = ['mousedown', 'touchstart', 'scroll', 'keydown'];
    const loadOnInteraction = () => {
      if (!window.gtmLoaded) {
        console.log('🏷️ Loading GTM on user interaction (final fallback)');
        loadGTM();
      }
      interactionEvents.forEach(event => {
        window.removeEventListener(event, loadOnInteraction);
      });
    };

    // Add multiple event listeners for better coverage
    interactionEvents.forEach(event => {
      window.addEventListener(event, loadOnInteraction, { once: false, passive: true });
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
