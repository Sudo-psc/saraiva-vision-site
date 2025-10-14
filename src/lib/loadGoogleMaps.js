import { resolveGoogleMapsApiKey, isValidGoogleMapsKey } from './googleMapsKey.js';

let mapsPromise = null;
let loadAttempts = 0;
const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 10000; // 10 segundos timeout

/**
 * Carrega a API do Google Maps de forma assíncrona com suporte para AdvancedMarkerElement
 * @param {string} apiKey - Chave da API do Google Maps
 * @returns {Promise<google.maps>} Promise que resolve com o objeto google.maps
 */
export function loadGoogleMaps(apiKey) {
  if (mapsPromise) {
    return mapsPromise;
  }

  mapsPromise = (async () => {
    if (typeof window === 'undefined') {
      throw new Error('Google Maps não pode ser carregado no servidor');
    }

    if (window.google && window.google.maps) {
      return window.google.maps;
    }

    const resolvedKey = isValidGoogleMapsKey(apiKey)
      ? apiKey
      : await resolveGoogleMapsApiKey();

    if (!isValidGoogleMapsKey(resolvedKey)) {
      console.error('❌ [ERROR] Google Maps API key is required');
      throw new Error('Google Maps API key is required');
    }

    return attemptGoogleMapsLoad(resolvedKey);
  })();

  mapsPromise.catch(() => {
    mapsPromise = null;
  });

  return mapsPromise;
}

/**
 * Estratégia alternativa de carregamento sem callback
 * @param {string} apiKey - Chave da API do Google Maps
 * @returns {Promise<google.maps>} Promise que resolve com o objeto google.maps
 */
function loadGoogleMapsAlternative(apiKey) {

  return new Promise(async (resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly`;

    script.onload = async () => {

      try {
        // Poll for Google Maps availability
        let attempts = 0;
        const maxAttempts = 50;

        const pollForGoogle = async () => {
          attempts++;
          if (window.google && window.google.maps && window.google.maps.importLibrary) {

            // Load required libraries
            await window.google.maps.importLibrary('marker');
            await window.google.maps.importLibrary('places');
            loadAttempts = 0;

            resolve(window.google.maps);
          } else if (attempts < maxAttempts) {
            setTimeout(pollForGoogle, 100);
          } else {
            reject(new Error('Google Maps não disponível após estratégia alternativa'));
          }
        };

        pollForGoogle();
      } catch (error) {
        console.error('❌ [ERROR] Erro na estratégia alternativa:', error);
        reject(new Error(`Estratégia alternativa falhou: ${error.message}`));
      }
    };

    script.onerror = (error) => {
      console.error('❌ [ERROR] Estratégia alternativa falhou:', error);
      reject(new Error('Estratégia alternativa de carregamento falhou'));
    };

    document.head.appendChild(script);
  });
}

// Utility function to check if Google Maps is ready
export function isGoogleMapsReady() {
  const ready = !!(window.google && window.google.maps);
  return ready;
}

// Function to reset the loader (useful for testing)
export function resetGoogleMapsLoader() {
  mapsPromise = null;
  loadAttempts = 0;
}

function attemptGoogleMapsLoad(apiKey) {
  loadAttempts++;

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      console.error(`⏰ [ERROR] Timeout após ${TIMEOUT_MS}ms`);
      if (loadAttempts < MAX_ATTEMPTS) {
        mapsPromise = null;
        attemptGoogleMapsLoad(apiKey).then(resolve).catch(reject);
      } else {
        reject(new Error(`Timeout: Google Maps não carregou em ${TIMEOUT_MS}ms após ${MAX_ATTEMPTS} tentativas`));
      }
    }, TIMEOUT_MS);

    const callbackName = `initGoogleMaps_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    window[callbackName] = async () => {
      clearTimeout(timeoutId);

      try {
        if (window.google && window.google.maps) {
          await window.google.maps.importLibrary('marker');
          await window.google.maps.importLibrary('places');
          loadAttempts = 0;
          resolve(window.google.maps);
        } else {
          console.error('❌ [ERROR] Google object não disponível após callback');
          reject(new Error('Google Maps object não disponível após callback'));
        }
      } catch (error) {
        console.error('❌ [ERROR] Erro ao carregar bibliotecas:', error);
        reject(new Error(`Erro ao carregar bibliotecas do Google Maps: ${error.message}`));
      }

      delete window[callbackName];
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.id = `google-maps-script-${Date.now()}`;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&loading=async&callback=${callbackName}&libraries=places,geometry`;

    script.onerror = (error) => {
      clearTimeout(timeoutId);
      console.error('❌ [ERROR] Falha ao carregar script:', error);
      delete window[callbackName];

      if (loadAttempts < MAX_ATTEMPTS) {
        mapsPromise = null;
        setTimeout(() => {
          loadGoogleMapsAlternative(apiKey).then(resolve).catch(reject);
        }, 1000);
      } else {
        reject(new Error(`Falha ao carregar Google Maps API: ${error.message || 'Unknown error'}`));
      }
    };

    document.head.appendChild(script);
  });
}
