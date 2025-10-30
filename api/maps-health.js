// api/maps-health.js
// Health check endpoint para Google Maps API

/**
 * Handles the health check request for the Google Maps API.
 *
 * @param {object} req The HTTP request object.
 * @param {object} res The HTTP response object.
 * @returns {Promise<void>} A promise that resolves when the request is handled.
 */
export default async function handler(req, res) {
  // Definir headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Apenas GET requests são permitidos'
    });
  }

  try {
    // Verificar se as variáveis de ambiente necessárias estão definidas
    const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({
        ok: false,
        service: 'maps',
        error: 'Google Maps API key não configurada',
        timestamp: new Date().toISOString()
      });
    }

    // Fazer uma requisição simples para testar se a API está acessível
    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${googleMapsApiKey}`;

    const response = await fetch(testUrl, {
      method: 'GET',
      timeout: 10000, // 10 segundos timeout
    });

    const isHealthy = response.status === 200;
    const responseData = await response.json().catch(() => null);

    return res.status(isHealthy ? 200 : 503).json({
      ok: isHealthy,
      service: 'maps',
      status: isHealthy ? 'healthy' : 'unhealthy',
      apiStatus: response.status,
      hasValidKey: !!googleMapsApiKey,
      timestamp: new Date().toISOString(),
      ...(responseData?.error_message && {
        apiError: responseData.error_message
      })
    });

  } catch (error) {
    console.error('Maps health check error:', error);

    return res.status(503).json({
      ok: false,
      service: 'maps',
      status: 'unhealthy',
      error: 'Erro ao verificar status do Google Maps API',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Performs a health check on the Google Maps API.
 * This function is intended for standalone use (e.g., in a script) and not as a request handler.
 *
 * @returns {Promise<object>} An object containing the health check result.
 */
export const mapHealthCheck = async () => {
  try {
    const googleMapsApiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      return {
        ok: false,
        service: 'maps',
        error: 'Google Maps API key não configurada'
      };
    }

    const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${googleMapsApiKey}`;
    const response = await fetch(testUrl);

    return {
      ok: response.status === 200,
      service: 'maps',
      status: response.status === 200 ? 'healthy' : 'unhealthy',
      apiStatus: response.status,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    return {
      ok: false,
      service: 'maps',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};