const VERIFY_ENDPOINT = 'https://www.google.com/recaptcha/api/siteverify';

function getRecaptchaSecret() {
  const primary = process.env.RECAPTCHA_SECRET;
  const fallback = process.env.GOOGLE_RECAPTCHA_SECRET;
  const value = (primary || fallback || '').trim();
  return value;
}

function shouldSkipVerification() {
  return process.env.CONTACT_ALLOW_INSECURE_RECAPTCHA === 'true';
}

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
