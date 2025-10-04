const KEY_MIN_LENGTH = 30;
const VALID_KEY_PREFIX = 'AIza';

let cachedKey = null;
let runtimeKeyPromise = null;

function normalizeKey(key) {
  return typeof key === 'string' ? key.trim() : '';
}

export function isValidGoogleMapsKey(key) {
  const normalized = normalizeKey(key);
  return normalized.startsWith(VALID_KEY_PREFIX) && normalized.length >= KEY_MIN_LENGTH;
}

export function getBuildTimeGoogleMapsKey() {
  // Em produção, NUNCA usar build-time keys para evitar exposição
  // Sempre usar runtime loading via /api/config
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
    return ''; // Força runtime loading em produção
  }

  // Development: Try Next.js vars first, then Vite vars for compatibility
  let key = '';

  // Next.js environment variables (development)
  if (typeof process !== 'undefined' && process.env) {
    key = normalizeKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
                      process.env.GOOGLE_MAPS_API_KEY ||
                      process.env.VITE_GOOGLE_MAPS_API_KEY);
  }

  // Fallback to Vite vars if available
  if (!key && typeof import.meta !== 'undefined' && import.meta.env) {
    key = normalizeKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  }

  return isValidGoogleMapsKey(key) ? key : '';
}

function getMapsConfigUrl() {
  // Em produção, usar /api/config endpoint
  const isProduction = typeof process !== 'undefined' &&
                      process.env?.NODE_ENV === 'production' ||
                      (typeof import.meta !== 'undefined' && import.meta.env?.PROD);

  if (isProduction) {
    return '/api/config';
  }

  // Development: try specific maps config first, fallback to general config
  let base = '';

  // Try Next.js env vars first
  if (typeof process !== 'undefined' && process.env) {
    base = normalizeKey(process.env.NEXT_PUBLIC_API_BASE_URL ||
                      process.env.VITE_API_BASE_URL);
  }

  // Fallback to Vite env vars
  if (!base && typeof import.meta !== 'undefined' && import.meta.env) {
    base = normalizeKey(import.meta.env.VITE_API_BASE_URL);
  }

  if (base && base.startsWith('http')) {
    return `${base.replace(/\/$/, '')}/config`;
  }
  return '/api/config';
}

async function fetchRuntimeKey() {
  try {
    const response = await fetch(getMapsConfigUrl(), {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Runtime config request failed with status ${response.status}`);
    }

    const data = await response.json();
    const runtimeKey = normalizeKey(data?.googleMapsApiKey);

    if (isValidGoogleMapsKey(runtimeKey)) {
      return runtimeKey;
    }

    throw new Error('Runtime configuration did not return a valid Google Maps API key');
  } catch (error) {
    console.error('❌ Failed to fetch runtime Google Maps API key:', error);
    throw error;
  }
}

export async function resolveGoogleMapsApiKey() {
  if (cachedKey) {
    return cachedKey;
  }

  const buildKey = getBuildTimeGoogleMapsKey();
  if (buildKey) {
    cachedKey = buildKey;
    return cachedKey;
  }

  if (!runtimeKeyPromise) {
    runtimeKeyPromise = fetchRuntimeKey()
      .then((key) => {
        cachedKey = key;
        return key;
      })
      .catch((error) => {
        runtimeKeyPromise = null;
        throw error;
      });
  }

  return runtimeKeyPromise;
}

export function resetGoogleMapsKeyCache() {
  cachedKey = null;
  runtimeKeyPromise = null;
}
