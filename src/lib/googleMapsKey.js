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
  if (import.meta.env.PROD) {
    return ''; // Força runtime loading em produção
  }

  // Development: OK usar VITE_ vars
  const key = normalizeKey(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  return isValidGoogleMapsKey(key) ? key : '';
}

function getMapsConfigUrl() {
  // Em produção, usar /api/config endpoint
  if (import.meta.env.PROD) {
    return '/api/config';
  }

  // Development: try specific maps config first, fallback to general config
  const base = normalizeKey(import.meta.env.VITE_API_BASE_URL);
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
