import { useCallback, useEffect, useRef, useState } from 'react';

// Loads Google reCAPTCHA v3 script and returns an executor for actions
export const useRecaptcha = () => {
  // Handle both Vite (import.meta.env) and Next.js (process.env) environments
  const getSiteKey = () => {
    if (typeof window !== 'undefined') {
      // Client-side: check both Vite and Next.js env variables
      return import.meta.env?.VITE_RECAPTCHA_SITE_KEY ||
             process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
             process.env?.VITE_RECAPTCHA_SITE_KEY;
    }
    // Server-side: use Next.js env variable or return undefined
    return process.env?.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
           process.env?.VITE_RECAPTCHA_SITE_KEY;
  };

  const siteKey = getSiteKey();
  const [ready, setReady] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!siteKey) return; // no-op if not configured

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
    if (!siteKey || !window.grecaptcha || !ready) return null;
    try {
      const token = await window.grecaptcha.execute(siteKey, { action });
      return token;
    } catch {
      return null;
    }
  }, [siteKey, ready]);

  return { ready, execute, enabled: !!siteKey };
};

