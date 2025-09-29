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
 */
export function useGoogleMaps(): UseGoogleMapsResult {
  const [state, setState] = useState<GoogleMapsState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google?.maps) {
          if (isMounted) setState('ready');
          return;
        }

        // Check if script is already loading
        if (state === 'loading') {
          return;
        }

        if (isMounted) setState('loading');

        // Get API key from runtime config
        const config = await getEnvConfig();
        const apiKey = config.googleMapsApiKey;

        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        const script = document.createElement('script');
        const params = new URLSearchParams({
          key: apiKey,
          libraries: 'places',
          v: 'weekly',
          loading: 'async',
        });

        script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
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

        script.onerror = () => {
          if (isMounted) {
            setError(new Error('Failed to load Google Maps API'));
            setState('error');
          }
        };

        document.head.appendChild(script);
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
    };
  }, [state]);

  return {
    ready: state === 'ready',
    error,
    loading: state === 'loading',
  };
}