/**
 * Google Maps Loader for Next.js
 * Async loader with retry logic, fallback strategies, and TypeScript support
 */

import type { GoogleMapsLoaderConfig, GoogleMapsErrorDetails } from '@/types/maps';

let mapsPromise: Promise<typeof google.maps> | null = null;
let loadAttempts = 0;
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10000; // 10 seconds timeout

/**
 * Resolves Google Maps API key from environment variables
 */
function resolveGoogleMapsApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error('Google Maps API key not found in environment variables');
  }

  return apiKey;
}

/**
 * Validates Google Maps API key format
 */
function isValidGoogleMapsKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false;
  const trimmedKey = apiKey.trim();

  // Basic validation: should not be empty, placeholder, or too short
  const placeholders = ['YOUR_API_KEY', 'PLACEHOLDER', 'your_key_here'];
  if (placeholders.some(p => trimmedKey.includes(p))) return false;
  if (trimmedKey.length < 20) return false;

  return true;
}

/**
 * Loads Google Maps API asynchronously with support for AdvancedMarkerElement
 * @param apiKey - Optional Google Maps API key (will use env var if not provided)
 * @returns Promise that resolves with the google.maps object
 */
export async function loadGoogleMaps(apiKey?: string): Promise<typeof google.maps> {
  // Return existing promise if already loading/loaded
  if (mapsPromise) {
    console.log('🔄 [GoogleMaps] Returning existing promise');
    return mapsPromise;
  }

  mapsPromise = (async () => {
    // Server-side check
    if (typeof window === 'undefined') {
      console.log('⚠️ [GoogleMaps] Server-side detected, rejecting');
      throw new Error('Google Maps cannot be loaded on server-side');
    }

    // Already loaded check
    if (window.google?.maps) {
      console.log('✅ [GoogleMaps] Already loaded');
      return window.google.maps;
    }

    // Resolve API key
    const resolvedKey = apiKey || resolveGoogleMapsApiKey();

    if (!isValidGoogleMapsKey(resolvedKey)) {
      const error: GoogleMapsErrorDetails = {
        code: 'API_KEY_INVALID',
        message: 'Invalid Google Maps API key',
      };
      throw error;
    }

    return attemptGoogleMapsLoad(resolvedKey);
  })();

  // Reset promise on error
  mapsPromise.catch(() => {
    mapsPromise = null;
  });

  return mapsPromise;
}

/**
 * Attempts to load Google Maps with retry logic
 */
async function attemptGoogleMapsLoad(apiKey: string): Promise<typeof google.maps> {
  loadAttempts++;
  console.log(`🚀 [GoogleMaps] Loading attempt ${loadAttempts}/${MAX_ATTEMPTS}`);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`⏰ [GoogleMaps] Timeout after ${TIMEOUT_MS}ms`);

      if (loadAttempts < MAX_ATTEMPTS) {
        console.log('🔄 [GoogleMaps] Retrying...');
        mapsPromise = null;
        attemptGoogleMapsLoad(apiKey).then(resolve).catch(reject);
      } else {
        const error: GoogleMapsErrorDetails = {
          code: 'LOAD_TIMEOUT',
          message: `Timeout: Google Maps did not load in ${TIMEOUT_MS}ms after ${MAX_ATTEMPTS} attempts`,
        };
        reject(error);
      }
    }, TIMEOUT_MS);

    // Generate unique callback name
    const callbackName = `initGoogleMaps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Define global callback
    (window as any)[callbackName] = async () => {
      clearTimeout(timeoutId);
      console.log('✅ [GoogleMaps] Callback executed successfully');

      try {
        if (window.google?.maps) {
          console.log('📚 [GoogleMaps] Loading required libraries...');

          // Load marker library (includes AdvancedMarkerElement)
          await window.google.maps.importLibrary('marker');
          console.log('✅ [GoogleMaps] Marker library loaded');

          // Load places library
          await window.google.maps.importLibrary('places');
          console.log('✅ [GoogleMaps] Places library loaded');

          loadAttempts = 0;
          resolve(window.google.maps);
        } else {
          console.error('❌ [GoogleMaps] Google object not available after callback');
          const error: GoogleMapsErrorDetails = {
            code: 'LIBRARY_LOAD_FAILED',
            message: 'Google Maps object not available after callback',
          };
          reject(error);
        }
      } catch (error) {
        console.error('❌ [GoogleMaps] Error loading libraries:', error);
        const errorDetails: GoogleMapsErrorDetails = {
          code: 'LIBRARY_LOAD_FAILED',
          message: `Error loading Google Maps libraries: ${error instanceof Error ? error.message : 'Unknown error'}`,
          originalError: error instanceof Error ? error : undefined,
        };
        reject(errorDetails);
      }

      // Cleanup callback
      delete (window as any)[callbackName];
    };

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = `google-maps-script-${Date.now()}`;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&callback=${callbackName}&libraries=places,geometry`;

    // Handle script load error
    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('❌ [GoogleMaps] Script load failed:', error);
      delete (window as any)[callbackName];

      if (loadAttempts < MAX_ATTEMPTS) {
        console.log('🔄 [GoogleMaps] Trying alternative loading strategy...');
        mapsPromise = null;
        setTimeout(() => {
          loadGoogleMapsAlternative(apiKey).then(resolve).catch(reject);
        }, 1000);
      } else {
        const errorDetails: GoogleMapsErrorDetails = {
          code: 'SCRIPT_LOAD_FAILED',
          message: 'Failed to load Google Maps API script',
          originalError: error instanceof Error ? error : undefined,
        };
        reject(errorDetails);
      }
    };

    console.log('📋 [GoogleMaps] Adding script to DOM:', script.src);
    document.head.appendChild(script);
  });
}

/**
 * Alternative loading strategy without callback (fallback)
 */
async function loadGoogleMapsAlternative(apiKey: string): Promise<typeof google.maps> {
  console.log('🔧 [GoogleMaps] Using alternative loading strategy');

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;

    script.onload = async () => {
      console.log('✅ [GoogleMaps] Alternative strategy: script loaded');

      try {
        // Poll for Google Maps availability
        let attempts = 0;
        const maxAttempts = 50;

        const pollForGoogle = async (): Promise<void> => {
          attempts++;

          if (window.google?.maps?.importLibrary) {
            console.log('✅ [GoogleMaps] Alternative strategy: Google Maps available');

            // Load required libraries
            await window.google.maps.importLibrary('marker');
            await window.google.maps.importLibrary('places');
            loadAttempts = 0;

            resolve(window.google.maps);
          } else if (attempts < maxAttempts) {
            setTimeout(pollForGoogle, 100);
          } else {
            const error: GoogleMapsErrorDetails = {
              code: 'LIBRARY_LOAD_FAILED',
              message: 'Google Maps not available after alternative strategy',
            };
            reject(error);
          }
        };

        await pollForGoogle();
      } catch (error) {
        console.error('❌ [GoogleMaps] Alternative strategy error:', error);
        const errorDetails: GoogleMapsErrorDetails = {
          code: 'LIBRARY_LOAD_FAILED',
          message: `Alternative strategy failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          originalError: error instanceof Error ? error : undefined,
        };
        reject(errorDetails);
      }
    };

    script.onerror = (error) => {
      console.error('❌ [GoogleMaps] Alternative strategy script failed:', error);
      const errorDetails: GoogleMapsErrorDetails = {
        code: 'SCRIPT_LOAD_FAILED',
        message: 'Alternative loading strategy failed',
        originalError: error instanceof Error ? error : undefined,
      };
      reject(errorDetails);
    };

    document.head.appendChild(script);
  });
}

/**
 * Checks if Google Maps is ready
 */
export function isGoogleMapsReady(): boolean {
  const ready = !!(typeof window !== 'undefined' && window.google?.maps);
  console.log('🔍 [GoogleMaps] Ready check:', ready);
  return ready;
}

/**
 * Resets the loader (useful for testing)
 */
export function resetGoogleMapsLoader(): void {
  console.log('🔄 [GoogleMaps] Resetting loader');
  mapsPromise = null;
  loadAttempts = 0;
}
