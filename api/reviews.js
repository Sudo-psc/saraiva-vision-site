// Serverless function (Vercel style) to fetch & sanitize Google Reviews
// LGPD & CFM compliance considerations:
// - Apenas dados tornados públicos voluntariamente no perfil Google são acessados.
// - Removemos sobrenomes completos, e-mails, telefones e possíveis identificadores sensíveis.
// - Não armazenamos em banco; cache opcional via cabeçalho HTTP (edge/CDN) até 15 min.
// - Não exibimos conteúdo que contenha termos clínicos sensíveis (lista simples pode ser expandida).
// - Evitamos associar condições de saúde a indivíduos.
//
// Deployment: Vercel => /api/reviews. For Netlify you can copy to netlify/functions/reviews.js with handler wrapper.

const SENSITIVE_TERMS = [
  /retinopatia/gi,
  /glaucoma/gi,
  /catarata/gi,
  /diab(et|)/gi,
  /hipertens/gi
];

const PII_PATTERNS = [
  /\b\+?\d{2,3}\s?\d{2}\s?9?\d{4}[- ]?\d{4}\b/g, // telefones BR
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,            // e-mails
];

function anonymizeAuthor(name = '') {
  if (!name) return 'Paciente';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}

function stripPII(text = '') {
  let cleaned = text;
  PII_PATTERNS.forEach(r => { cleaned = cleaned.replace(r, '[removido]'); });
  return cleaned;
}

function removeSensitiveClinicalDetail(text = '') {
  let redacted = text;
  SENSITIVE_TERMS.forEach(r => { redacted = redacted.replace(r, '[termo clínico]'); });
  return redacted;
}

function sanitizeReview(r, idx) {
  const safeText = removeSensitiveClinicalDetail(stripPII(r.text || '')).slice(0, 400);
  return {
    id: idx,
    author: anonymizeAuthor(r.author_name),
    rating: r.rating,
    text: safeText,
    relativeTime: r.relative_time_description || ''
  };
}

import { createHash } from 'node:crypto';

// Interval configuration (shorter in non-production for demos)
const IS_PROD = process.env.NODE_ENV === 'production';
const FETCH_INTERVAL_MS = Number(process.env.REVIEWS_POLL_INTERVAL_MS || (IS_PROD ? 60000 : 10000));
const HEARTBEAT_INTERVAL_MS = Number(process.env.REVIEWS_HEARTBEAT_MS || (IS_PROD ? 25000 : 10000));

async function fetchAndSanitize({ apiKey, placeId }) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.status !== 'OK') {
    const err = new Error(json.error_message || json.status || 'Google Places API error');
    err.status = json.status || 502;
    throw err;
  }
  const rawReviews = (json.result?.reviews || []).slice(0, 6);
  const reviews = rawReviews.map(sanitizeReview);
  const payload = {
    source: 'google-places',
    total: json.result?.user_ratings_total || reviews.length,
    rating: json.result?.rating || null,
    reviews,
    disclaimer: 'Avaliações públicas do Google, nomes parcialmente anonimizados e conteúdos filtrados para privacidade.',
    timestamp: new Date().toISOString()
  };
  return payload;
}

function hashPayload(payload) {
  const body = JSON.stringify(payload);
  return 'W/"' + createHash('sha1').update(body).digest('hex') + '"';
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || process.env.VITE_GOOGLE_PLACE_ID; // fallback
  
  // More detailed logging for debugging
  console.log('Google Reviews API - Environment check:');
  console.log('- API Key exists:', !!apiKey);
  console.log('- Place ID exists:', !!placeId);
  console.log('- Place ID value:', placeId);
  
  if (!apiKey || !placeId) {
    console.error('Missing Google Places API configuration');
    return res.status(500).json({ 
      error: 'Missing server credentials',
      details: {
        hasApiKey: !!apiKey,
        hasPlaceId: !!placeId
      }
    });
  }
  try {
    // SSE support when requested
    const wantsStream = (req.headers.accept || '').includes('text/event-stream') || (req.url || '').includes('stream=1');
    if (wantsStream) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      let lastEtag = null;
      let heartbeatInterval = null;
      let fetchInterval = null;

      const sendEvent = (event, data) => {
        if (event) res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      const sendHeartbeat = () => res.write(': ping\n\n');

      const tick = async () => {
        try {
          const payload = await fetchAndSanitize({ apiKey, placeId });
          const etag = hashPayload(payload);
          if (etag !== lastEtag) {
            lastEtag = etag;
            sendEvent('update', payload);
          }
        } catch (e) {
          sendEvent('error', { message: e.message || 'fetch failed' });
        }
      };

      // Initial push and intervals
      await tick();
      heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
      fetchInterval = setInterval(tick, FETCH_INTERVAL_MS);

      // Clean up on client disconnect
      req.on('close', () => {
        clearInterval(heartbeatInterval);
        clearInterval(fetchInterval);
        res.end();
      });
      return; // keep connection open
    }

    // Regular JSON snapshot with ETag/304 support
    console.log('Fetching Google Places data (snapshot)...');
    const payload = await fetchAndSanitize({ apiKey, placeId });
    const etag = hashPayload(payload);

    res.setHeader('ETag', etag);
    res.setHeader('X-Data-Policy', 'anonymized');
    res.setHeader('Cache-Control', 'public, max-age=300');

    if ((req.headers['if-none-match'] || '') === etag) {
      return res.status(304).end();
    }

    res.status(200).json(payload);
  } catch (e) {
    console.error('Google Reviews API error:', e.message);
    res.status(500).json({ 
      error: 'Internal server error',
      message: e.message,
      timestamp: new Date().toISOString()
    });
  }
}
