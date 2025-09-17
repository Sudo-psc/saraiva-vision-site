// Lightweight API client with healthcare-safe 401 handling
// - Attaches Authorization when configured
// - On 401, tries token refresh once via healthcareTokenManager and retries
// - Avoids logging patient-identifiable parameters

import healthcareTokenManager from './healthcareTokenManager.js';

function sanitizeUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    u.search = '';
    return u.toString();
  } catch (_) {
    return url;
  }
}

async function withAuthHeaders(init = {}, tokenType) {
  if (!tokenType) return init || {};
  const stored = healthcareTokenManager.getStoredToken(tokenType);
  if (!stored?.access_token) return init || {};
  return {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${stored.access_token}`
    }
  };
}

export async function apiFetch(input, init = {}, { tokenType = null } = {}) {
  const url = typeof input === 'string' ? input : input?.url || '';
  let attempt = 0;
  let reqInit = await withAuthHeaders(init, tokenType);

  while (attempt < 2) {
    const res = await fetch(url, reqInit);

    // Success path
    if (res.status !== 401) return res;

    // On first 401, try refresh + retry
    if (attempt === 0 && tokenType) {
      try {
        await healthcareTokenManager.manualRefresh(tokenType);
        reqInit = await withAuthHeaders(init, tokenType);
      } catch (e) {
        console.warn('Auth refresh failed for', tokenType);
        return res; // Give caller the 401
      }
    } else {
      return res;
    }

    attempt += 1;
  }

  return fetch(url, reqInit);
}

// Example usage (patients endpoint):
// const res = await apiFetch('/api/patients', { method: 'GET' }, { tokenType: 'clinic_api' });
// if (res.status === 401) { showReauthModal(); }

