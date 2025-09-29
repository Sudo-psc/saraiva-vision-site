import { useEffect, useState } from 'react';
import { env } from '@/config/env';

type GoogleMapsState = 'idle' | 'loading' | 'ready' | 'error';

interface UseGoogleMapsResult {
  ready: boolean;
  error: Error | null;
  loading: boolean;
}

/**
 * Hook for loading Google Maps API with proper error handling and state management
 * Prevents InvalidStateError by ensuring Maps is fully loaded before use
 */
export function useGoogleMaps(): UseGoogleMapsResult {
  const [state, setState] = useState<GoogleMapsState>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if API key is available
    if (!env.VITE_GOOGLE_MAPS_API_KEY) {
      setError(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured'));
      setState('error');
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setState('ready');
      return;
    }

    // Check if script is already loading
    if (state === 'loading') {
      return;
    }

    setState('loading');

    const loadGoogleMaps = () => {
      const script = document.createElement('script');
      const params = new URLSearchParams({
        key: env.VITE_GOOGLE_MAPS_API_KEY,
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
          setState('ready');
          setError(null);
        } else {
          setError(new Error('Google Maps loaded but window.google.maps is not available'));
          setState('error');
        }
      };

      script.onerror = () => {
        setError(new Error('Failed to load Google Maps API'));
        setState('error');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, [state]);

  return {
    ready: state === 'ready',
    error,
    loading: state === 'loading',
  };
}