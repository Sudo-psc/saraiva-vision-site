/**
 * WordPress Proxy for Vercel
 * Handles WordPress API requests and serves as a proxy to external WordPress instance
 */

/**
 * Acts as a proxy for requests to a headless WordPress instance.
 * It forwards GET requests from `/api/wp-json/...` to the configured WordPress URL,
 * allowing the front-end to query the WordPress API without CORS issues or exposing the
 * WordPress URL directly to the client.
 *
 * @param {import('http').IncomingMessage} req The incoming request object.
 * @param {import('http').ServerResponse} res The server response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req, res) {
  const { pathname, search } = new URL(req.url, `http://${req.headers.host}`);
  const wordpressUrl = process.env.WORDPRESS_URL || 'https://saraivavision.com.br';

  // Only allow GET requests for security
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Construct the target WordPress URL
    const targetUrl = `${wordpressUrl}${pathname.replace('/api/wp-json', '/wp-json')}${search}`;

    console.log(`Proxying WordPress request: ${req.url} -> ${targetUrl}`);

    // Fetch from WordPress
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'SaraivaVision-Proxy/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate'
      }
    });

    // Handle response
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'WordPress API error',
        status: response.status,
        message: response.statusText
      });
    }

    // Get response data
    const data = await response.json();

    // Add cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
    res.setHeader('X-WordPress-Proxy', 'true');

    // Return the WordPress data
    return res.status(200).json(data);

  } catch (error) {
    console.error('WordPress proxy error:', error);
    return res.status(500).json({
      error: 'Proxy error',
      message: error.message
    });
  }
}