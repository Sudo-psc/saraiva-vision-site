import { z } from 'zod';

// Instagram Basic Display API configuration
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.VERCEL_URL || 'http://localhost:3000'}/api/instagram/callback`;

// Validation schemas
const tokenRequestSchema = z.object({
  code: z.string(),
  state: z.string().optional()
});

const refreshTokenSchema = z.object({
  refresh_token: z.string()
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // Generate authorization URL
      return handleAuthorizationURL(req, res);
    } 
    
    if (req.method === 'POST') {
      const { action } = req.body;
      
      if (action === 'exchange_token') {
        return handleTokenExchange(req, res);
      }
      
      if (action === 'refresh_token') {
        return handleTokenRefresh(req, res);
      }
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Generate Instagram authorization URL
async function handleAuthorizationURL(req, res) {
  if (!INSTAGRAM_CLIENT_ID) {
    return res.status(500).json({ 
      error: 'Instagram Client ID not configured' 
    });
  }

  const state = generateRandomState();
  const scope = 'user_profile,user_media';
  
  const authURL = new URL('https://api.instagram.com/oauth/authorize');
  authURL.searchParams.set('client_id', INSTAGRAM_CLIENT_ID);
  authURL.searchParams.set('redirect_uri', REDIRECT_URI);
  authURL.searchParams.set('scope', scope);
  authURL.searchParams.set('response_type', 'code');
  authURL.searchParams.set('state', state);

  res.status(200).json({
    authURL: authURL.toString(),
    state,
    redirectURI: REDIRECT_URI
  });
}

// Exchange authorization code for access token
async function handleTokenExchange(req, res) {
  const validation = tokenRequestSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid request',
      details: validation.error.errors 
    });
  }

  const { code } = validation.data;

  if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Instagram credentials not configured' 
    });
  }

  try {
    // Exchange code for short-lived token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_message || 'Token exchange failed');
    }

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch('https://graph.instagram.com/access_token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      params: new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: INSTAGRAM_CLIENT_SECRET,
        access_token: tokenData.access_token
      })
    });

    const longLivedData = await longLivedResponse.json();

    if (!longLivedResponse.ok) {
      throw new Error(longLivedData.error?.message || 'Long-lived token exchange failed');
    }

    // Store token securely (implement your storage logic here)
    // For production, consider using encrypted storage or secure database
    
    res.status(200).json({
      success: true,
      access_token: longLivedData.access_token,
      token_type: longLivedData.token_type,
      expires_in: longLivedData.expires_in
    });

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      error: 'Token exchange failed',
      message: error.message 
    });
  }
}

// Refresh long-lived access token
async function handleTokenRefresh(req, res) {
  const validation = refreshTokenSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Invalid refresh request',
      details: validation.error.errors 
    });
  }

  const { refresh_token } = validation.data;

  try {
    const refreshResponse = await fetch('https://graph.instagram.com/refresh_access_token', {
      method: 'GET',
      params: new URLSearchParams({
        grant_type: 'ig_refresh_token',
        access_token: refresh_token
      })
    });

    const refreshData = await refreshResponse.json();

    if (!refreshResponse.ok) {
      throw new Error(refreshData.error?.message || 'Token refresh failed');
    }

    res.status(200).json({
      success: true,
      access_token: refreshData.access_token,
      token_type: refreshData.token_type,
      expires_in: refreshData.expires_in
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ 
      error: 'Token refresh failed',
      message: error.message 
    });
  }
}

// Generate random state for OAuth security
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}