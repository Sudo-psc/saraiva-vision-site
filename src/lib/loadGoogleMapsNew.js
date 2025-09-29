import { Loader } from '@googlemaps/js-api-loader';
import { resolveGoogleMapsApiKey, isValidGoogleMapsKey } from '@/lib/googleMapsKey';

let loaderInstance = null;
let loadPromise = null;

/**
 * Enhanced Google Maps loader using official @googlemaps/js-api-loader
 * with comprehensive error handling and fallback strategies
 */
export function loadGoogleMaps(apiKey) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps loader requires browser environment'));
  }

  // Return existing promise if loading already started
  if (loadPromise) {
    console.log('🔄 [GoogleMaps] Returning existing load promise');
    return loadPromise;
  }

  // Check if already loaded
  if (window.google?.maps?.importLibrary) {
    console.log('✅ [GoogleMaps] Already loaded and ready');
    return Promise.resolve(window.google.maps);
  }

  const keyPromise = isValidGoogleMapsKey(apiKey)
    ? Promise.resolve(apiKey)
    : resolveGoogleMapsApiKey();

  console.log('🚀 [GoogleMaps] Starting official loader...');

  // Initialize loader with configuration
  // Create load promise with timeout and error handling
  loadPromise = new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Google Maps loading timeout after 15 seconds'));
    }, 15000);

    try {
      const resolvedKey = await keyPromise;

      if (!isValidGoogleMapsKey(resolvedKey)) {
        throw new Error('Google Maps API key is required');
      }

      loaderInstance = new Loader({
        apiKey: resolvedKey,
        version: 'weekly',
        libraries: ['places', 'marker'],
        language: 'pt-BR',
        region: 'BR',
        mapIds: [], // Add your map IDs if needed
      });

      // Load the maps library
      console.log('📦 [GoogleMaps] Loading maps library...');
      const google = await loaderInstance.load();
      
      clearTimeout(timeoutId);
      
      // Verify import library is available
      if (!google.maps?.importLibrary) {
        throw new Error('importLibrary not available after load');
      }
      
      console.log('✅ [GoogleMaps] Successfully loaded with official loader');
      resolve(google.maps);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ [GoogleMaps] Load failed:', error);
      
      // Reset promises to allow retry
      loadPromise = null;
      loaderInstance = null;
      
      reject(new Error(`Google Maps load failed: ${error.message}`));
    }
  });

  return loadPromise;
}

/**
 * Check if Google Maps is ready
 */
export function isGoogleMapsReady() {
  return !!(window.google?.maps?.importLibrary);
}

/**
 * Reset loader for testing or retry scenarios
 */
export function resetGoogleMapsLoader() {
  console.log('🔄 [GoogleMaps] Resetting loader');
  loadPromise = null;
  loaderInstance = null;
}

/**
 * Get loader instance for advanced usage
 */
export function getLoaderInstance() {
  return loaderInstance;
}