/**
 * Analytics Server-Side Proxy
 *
 * Este script atua como um proxy server-side para contornar bloqueadores de anúncios
 * e garantir que os dados de analytics sejam coletados mesmo quando os scripts
 * do Google são bloqueados.
 */

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3005;

// Middlewares
app.use(cors({
  origin: ['https://saraivavision.com.br', 'https://www.saraivavision.com.br'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache simples para evitar requisições duplicadas
const cache = new Map();
const CACHE_TTL = 60000; // 1 minuto

// Proxy para Google Analytics Measurement Protocol
app.post('/analytics/ga', async (req, res) => {
  try {
    const { v = 1, tid, cid, t, dl, ua, ...otherParams } = req.body;

    if (!tid || !cid) {
      return res.status(400).json({ error: 'Missing required parameters: tid (tracking ID) and cid (client ID)' });
    }

    // Google Analytics Measurement Protocol endpoint
    const gaEndpoint = 'https://www.google-analytics.com/collect';

    // Montar payload para GA
    const payload = new URLSearchParams({
      v, // Version
      tid, // Tracking ID (G-LXWRK8ELS6)
      cid, // Client ID
      t, // Hit type
      dl, // Document location
      ua, // User agent
      ...otherParams
    });

    // Enviar para Google Analytics
    const response = await fetch(gaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString()
    });

    if (response.ok) {
      res.json({ success: true, message: 'Data sent to Google Analytics' });
    } else {
      throw new Error(`GA responded with status: ${response.status}`);
    }

  } catch (error) {
    console.error('GA Proxy Error:', error);
    res.status(500).json({ error: 'Failed to send data to Google Analytics' });
  }
});

// Proxy para Google Tag Manager Data Layer
app.post('/analytics/gtm', async (req, res) => {
  try {
    const { gtmId, eventData } = req.body;

    if (!gtmId || !eventData) {
      return res.status(400).json({ error: 'Missing required parameters: gtmId and eventData' });
    }

    // Cache key
    const cacheKey = `${gtmId}-${JSON.stringify(eventData)}-${Date.now()}`;

    // Verificar cache
    if (cache.has(cacheKey)) {
      return res.json({ success: true, cached: true });
    }

    // Armazenar no cache
    cache.set(cacheKey, true);

    // Limpar cache antigo
    setTimeout(() => {
      cache.delete(cacheKey);
    }, CACHE_TTL);

    // Simular envio para GTM (em produção, isso integraria com GTM Server-Side)
    console.log('GTM Event (Server-Side):', { gtmId, eventData });

    res.json({
      success: true,
      message: 'Event processed server-side',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('GTM Proxy Error:', error);
    res.status(500).json({ error: 'Failed to process GTM event' });
  }
});

// Endpoint para verificar status do serviço
app.get('/analytics/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    services: {
      google_analytics: 'active',
      google_tag_manager: 'active',
      cache_size: cache.size
    }
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.status(200).send('Analytics Proxy Service: OK');
});

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔥 Analytics Proxy Server running on port ${PORT}`);
    console.log(`📊 GA Proxy: http://localhost:${PORT}/analytics/ga`);
    console.log(`🏷️ GTM Proxy: http://localhost:${PORT}/analytics/gtm`);
    console.log(`❤️ Health Check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;