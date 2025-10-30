const ALLOWED_ORIGINS = new Set([
  'https://saraivavision.com.br',
  'https://www.saraivavision.com.br',
  'http://localhost:3000',
  'http://localhost:3002'
]);

/**
 * Applies CORS headers to the response based on the request's origin.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 */
function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Resolves the Google Maps API key from environment variables.
 *
 * @returns {string} The Google Maps API key, or an empty string if not found.
 */
function resolveApiKey() {
  return (
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    ''
  );
}

/**
 * Handles the request for the Google Maps API key.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the request is handled.
 */
export default async function handler(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`
    });
  }

  const apiKey = resolveApiKey();

  res.setHeader('Cache-Control', 'no-store');

  if (!apiKey) {
    return res.status(424).json({
      success: false,
      googleMapsApiKey: null,
      error: 'Google Maps API key is not configured'
    });
  }

  return res.status(200).json({
    success: true,
    googleMapsApiKey: apiKey
  });
}
