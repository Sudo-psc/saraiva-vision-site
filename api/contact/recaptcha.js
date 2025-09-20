const VERIFY_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Return the configured reCAPTCHA secret from environment variables.
 *
 * Reads RECAPTCHA_SECRET first and falls back to GOOGLE_RECAPTCHA_SECRET; the returned value is trimmed.
 * If neither environment variable is set, returns an empty string.
 *
 * @returns {string} The reCAPTCHA secret (trimmed) or an empty string if not configured.
 */
function getRecaptchaSecret() {
  const primary = process.env.RECAPTCHA_SECRET;
  const fallback = process.env.GOOGLE_RECAPTCHA_SECRET;
  const value = (primary || fallback || '').trim();
  return value;
}

/**
 * Whether reCAPTCHA verification should be skipped in insecure/testing mode.
 *
 * Reads the CONTACT_ALLOW_INSECURE_RECAPTCHA environment variable and returns true only if it equals the string 'true'.
 *
 * @returns {boolean} True when verification is explicitly disabled via env var; otherwise false.
 */
function shouldSkipVerification() {
  return process.env.CONTACT_ALLOW_INSECURE_RECAPTCHA === 'true';
}

/**
 * Verify a reCAPTCHA token server-side against Google's siteverify endpoint.
 *
 * Sends the provided token (and optional remote IP) along with the configured
 * reCAPTCHA secret to Google's verify endpoint, validates the optional expected
 * action (defaults to "contact"), and interprets the response into a normalized
 * result object. If the secret is not configured and insecure skip is allowed,
 * verification is short-circuited as successful with score 1 and `skipped: true`.
 *
 * @param {Object} args
 * @param {string} args.token - The reCAPTCHA token received from the client.
 * @param {string} [args.expectedAction] - Expected action string to validate against the response action (defaults to `'contact'`).
 * @param {string} [args.remoteip] - Optional end-user IP address to include in the verification request.
 * @return {Promise<Object>} Result object. Common shapes:
 *   - { ok: false, code: 'missing_token'|'missing_secret'|'verification_failed'|'action_mismatch'|'low_score'|'network_error', message: string, score?: number }
 *   - { ok: true, score: number, action: string|null, challenge_ts?: string, hostname?: string, skipped?: true }
 */
export async function verifyRecaptcha({ token, expectedAction, remoteip }) {
  const secret = getRecaptchaSecret();
  const actionToCompare = expectedAction || 'contact';

  if (!token) {
    return { ok: false, code: 'missing_token', message: 'missing_token' };
  }

  if (!secret) {
    if (shouldSkipVerification()) {
      return { ok: true, score: 1, action: actionToCompare, skipped: true };
    }

    return { ok: false, code: 'missing_secret', message: 'reCAPTCHA secret not configured' };
  }

  try {
    const params = new URLSearchParams();
    params.set('secret', secret);
    params.set('response', token || '');
    if (remoteip) {
      params.set('remoteip', remoteip);
    }

    const response = await fetch(VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await response.json();

    if (!data.success) {
      const details = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'verification failed';
      return { ok: false, code: 'verification_failed', message: details };
    }

    if (actionToCompare && data.action && data.action !== actionToCompare) {
      return { ok: false, code: 'action_mismatch', message: `unexpected action: ${data.action}` };
    }

    const score = typeof data.score === 'number' ? data.score : 1;

    if (typeof data.score === 'number' && score < 0.5) {
      return { ok: false, code: 'low_score', message: `low score: ${score}`, score };
    }

    return {
      ok: true,
      score,
      action: data.action || null,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname
    };
  } catch (error) {
    return { ok: false, code: 'network_error', message: error.message };
  }
}
