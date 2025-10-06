import { useCallback, useEffect, useRef, useState } from 'react';

// Loads Google reCAPTCHA v3 script and returns an executor for actions
export const useRecaptcha = () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const [ready, setReady] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!siteKey) {
      // Allow form to work without reCAPTCHA as fallback
      setReady(true);
      return;
    }

    if (window.grecaptcha && window.grecaptcha.execute) {
      setReady(true);
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setReady(true));
      }
    };
    script.onerror = () => {
      // Keep ready=false; callers can handle fallback when not ready
      loadingRef.current = false;
    };
    document.head.appendChild(script);

    return () => {
      // Do not remove the script to avoid reloading on route changes
    };
  }, [siteKey]);

  const execute = useCallback(async (action = 'contact') => {
    if (!siteKey) {
      // Return null when reCAPTCHA is not configured - backend will handle with fallback
      return null;
    }
    if (!window.grecaptcha || !ready) return null;
    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch {
      return null;
    }
  }, [siteKey, ready]);

  return { ready, execute, enabled: !!siteKey };
};

