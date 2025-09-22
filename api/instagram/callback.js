// Instagram OAuth callback handler
export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', error, error_description);
    return res.redirect(`${process.env.VERCEL_URL || 'http://localhost:3000'}/admin?error=instagram_auth_failed&message=${encodeURIComponent(error_description || error)}`);
  }

  // Handle missing authorization code
  if (!code) {
    return res.redirect(`${process.env.VERCEL_URL || 'http://localhost:3000'}/admin?error=missing_code`);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/instagram/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'exchange_token',
        code,
        state
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.message || 'Token exchange failed');
    }

    // Redirect to admin page with success message
    res.redirect(`${process.env.VERCEL_URL || 'http://localhost:3000'}/admin?instagram_connected=true&expires_in=${tokenData.expires_in}`);

  } catch (error) {
    console.error('Instagram callback error:', error);
    res.redirect(`${process.env.VERCEL_URL || 'http://localhost:3000'}/admin?error=token_exchange_failed&message=${encodeURIComponent(error.message)}`);
  }
}