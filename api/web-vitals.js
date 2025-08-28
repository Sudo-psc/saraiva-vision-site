/**
 * Web Vitals API Endpoint
 * Serverless function to collect and store Core Web Vitals data
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const {
      metric,
      value,
      rating,
      delta,
      id,
      url,
      timestamp,
      userAgent,
      connection
    } = req.body;

    // Validate required fields
    if (!metric || value === undefined || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric}: ${Math.round(value)}ms (${rating})`);
    }

    // Here you would typically store in a database
    // For now, we'll just acknowledge receipt
    const vitalsData = {
      metric,
      value: Math.round(value),
      rating,
      delta: Math.round(delta || 0),
      id,
      url,
      timestamp,
      userAgent: userAgent?.substring(0, 200), // Truncate for storage
      connection,
      received: new Date().toISOString()
    };

    // TODO: Store in database (Supabase, MongoDB, etc.)
    // await storeWebVital(vitalsData);

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Web vital recorded',
      data: vitalsData
    });

  } catch (error) {
    console.error('Web Vitals API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}