import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance = null;
let loadPromise = null;

/**
 * Loads the Google Maps JavaScript API using the official `@googlemaps/js-api-loader`.
 * This function handles singleton instantiation, error handling, and timeouts.
 *
 * @param {string} apiKey The Google Maps API key.
 * @returns {Promise<object>} A promise that resolves with the `google.maps` object.
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

  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is required'));
  }

  console.log('🚀 [GoogleMaps] Starting official loader...');

  // Initialize loader with configuration
  loaderInstance = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places', 'marker'],
    language: 'pt-BR',
    region: 'BR',
    mapIds: [], // Add your map IDs if needed
  });

  // Create load promise with timeout and error handling
  loadPromise = new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Google Maps loading timeout after 15 seconds'));
    }, 15000);

    try {
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
 * Checks if the Google Maps API is ready and available.
 *
 * @returns {boolean} `true` if the Google Maps API is ready, `false` otherwise.
 */
export function isGoogleMapsReady() {
  return !!(window.google?.maps?.importLibrary);
}

/**
 * Resets the Google Maps API loader, allowing it to be called again.
 * This is useful for testing or retry scenarios.
 */
export function resetGoogleMapsLoader() {
  console.log('🔄 [GoogleMaps] Resetting loader');
  loadPromise = null;
  loaderInstance = null;
}

/**
 * Gets the singleton instance of the Google Maps loader for advanced usage.
 *
 * @returns {object|null} The loader instance, or `null` if not initialized.
 */
export function getLoaderInstance() {
  return loaderInstance;
}