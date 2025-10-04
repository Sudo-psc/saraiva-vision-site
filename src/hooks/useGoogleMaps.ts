import { useEffect, useState } from 'react';
import { getEnvConfig } from '@/config/runtime-env';

type GoogleMapsState = 'idle' | 'loading' | 'ready' | 'error';

interface UseGoogleMapsResult {
  ready: boolean;
  error: Error | null;
  loading: boolean;
}

/**
 * Hook for loading Google Maps API with proper error handling and state management
 * Uses runtime configuration to prevent API key exposure in build
 * Prevents InvalidStateError by ensuring Maps is fully loaded before use
 * Handles CSP test requests gracefully to avoid console errors
 */
export function useGoogleMaps(): UseGoogleMapsResult {
  const [state, setState] = useState<GoogleMapsState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const MAX_ATTEMPTS = 2;

  useEffect(() => {
    let isMounted = true;
    let scriptElement: HTMLScriptElement | null = null;

    const initializeGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          if (isMounted) setState('ready');
          return;
        }

        // Check if script is already loading or max attempts reached
        if (state === 'loading' || loadAttempts >= MAX_ATTEMPTS) {
          return;
        }

        if (isMounted) {
          setState('loading');
          setLoadAttempts(prev => prev + 1);
        }

        // Get API key from runtime config
        const config = await getEnvConfig();
        const apiKey = config.googleMapsApiKey;

        if (!apiKey) {
          console.warn('Google Maps API key not configured - using fallback mode');
          if (isMounted) {
            setError(new Error('Google Maps API key not configured - using fallback mode'));
            setState('error');
          }
          return;
        }

        // Create a unique callback name to avoid conflicts
        const callbackName = `initGoogleMaps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Set up the callback function
        window[callbackName] = () => {
          // Clean up the callback
          delete window[callbackName];

          // Verify Google Maps is actually available
          if (window.google?.maps) {
            if (isMounted) {
              setState('ready');
              setError(null);
            }
          } else {
            if (isMounted) {
              setError(new Error('Google Maps loaded but window.google.maps is not available'));
              setState('error');
            }
          }
        };

        const script = document.createElement('script');
        scriptElement = script;

        // Build URL with parameters that minimize CSP test issues
        const params = new URLSearchParams({
          key: apiKey,
          libraries: 'places,geometry',
          v: 'weekly',
          loading: 'async',
          callback: callbackName,
        });

        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';

        // Handle successful load
        script.onload = () => {
          // The callback will handle the success case
          // This onload is mainly for error handling
        };

        // Handle loading errors (including CSP blocking)
        script.onerror = (event) => {
          // Clean up the callback
          delete window[callbackName];

          if (isMounted) {
            let errorMessage;
            if (loadAttempts < MAX_ATTEMPTS - 1) {
              errorMessage = 'Google Maps API blocked or unavailable. Retrying...';
            } else {
              errorMessage = 'Failed to load Google Maps API after multiple attempts. The map will show in fallback mode with location information.';
            }

            setError(new Error(errorMessage));
            setState('error');
          }
        };

        // Suppress CSP-related console errors by catching them
        const originalConsoleError = console.error;
        console.error = (...args) => {
          // Filter out CSP test errors
          const errorString = args.join(' ');
          if (!errorString.includes('maps.googleapis.com/maps/api/mapsjs/gen_204') &&
              !errorString.includes('csp_test=true')) {
            originalConsoleError.apply(console, args);
          }
        };

        document.head.appendChild(script);

        // Restore console error after a short delay
        setTimeout(() => {
          console.error = originalConsoleError;
        }, 5000);

      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Google Maps'));
          setState('error');
        }
      }
    };

    initializeGoogleMaps();

    return () => {
      isMounted = false;
      // Clean up script element if component unmounts
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [state, loadAttempts]);

  return {
    ready: state === 'ready',
    error,
    loading: state === 'loading',
  };
}