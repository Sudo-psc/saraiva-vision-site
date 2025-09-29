const ALLOWED_ORIGINS = new Set([
  'https://saraivavision.com.br',
  'https://www.saraivavision.com.br',
  'http://localhost:3000',
  'http://localhost:3002'
]);

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

function resolveApiKey() {
  return (
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    ''
  );
}

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
