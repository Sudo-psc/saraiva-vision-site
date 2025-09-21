/**
 * Web Vitals Endpoint for Saraiva Vision
 * Coleta métricas de performance para monitoramento da experiência do usuário
 */

/**
 * Handles incoming Web Vitals reports from the client.
 * This endpoint receives performance metrics (like LCP, FID, CLS) sent from the front-end,
 * logs them for monitoring, and performs a basic analysis.
 *
 * @param {import('http').IncomingMessage} req The incoming request object, expecting a JSON body with Web Vitals data.
 * @param {import('http').ServerResponse} res The server response object.
 * @returns {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // GET: Retorna métricas atuais (mock para teste)
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      message: 'Web vital recorded',
      data: vitalsData
    });
  }

  // POST: Recebe e processa métricas do cliente
  if (req.method === 'POST') {
    try {
      const vitals = req.body;
      
      // Validação básica
      if (!vitals || typeof vitals !== 'object') {
        res.status(400).json({ error: 'Invalid data' });
        return;
      }

      // Log das métricas (em produção, salvar em banco de dados)
      console.log('Web Vitals received:', {
        ...vitals,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });

      // Análise das métricas para detectar problemas
      const analysis = analyzeVitals(vitals);
      
      // Retorna confirmação com análise
      res.status(200).json({
        success: true,
        message: 'Metrics received',
        analysis: analysis
      });
    } catch (error) {
      console.error('Error processing web vitals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
    return;
  }

  // Método não permitido
  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Analyzes a set of Web Vitals metrics and provides a score and recommendations.
 *
 * @param {object} vitals An object containing Web Vitals metrics (e.g., { lcp, cls, fid, inp }).
 * @returns {{score: string, issues: string[], recommendations: string[]}} An analysis object with a score ('good', 'needs-improvement', 'poor'), a list of identified issues, and suggested recommendations.
 */
function analyzeVitals(vitals) {
  const thresholds = {
    cls: { good: 0.1, poor: 0.25 },
    fid: { good: 100, poor: 300 },
    lcp: { good: 2500, poor: 4000 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 }
  };

  const analysis = {
    score: 'good',
    issues: [],
    recommendations: []
  };

  // Verifica CLS (Cumulative Layout Shift)
  if (vitals.cls > thresholds.cls.poor) {
    analysis.score = 'poor';
    analysis.issues.push('Alto deslocamento de layout (CLS)');
    analysis.recommendations.push('Definir dimensões para imagens e vídeos');
  } else if (vitals.cls > thresholds.cls.good) {
    analysis.score = analysis.score === 'good' ? 'needs-improvement' : analysis.score;
  }

  // Verifica LCP (Largest Contentful Paint)
  if (vitals.lcp > thresholds.lcp.poor) {
    analysis.score = 'poor';
    analysis.issues.push('Carregamento lento do conteúdo principal (LCP)');
    analysis.recommendations.push('Otimizar imagens e usar lazy loading');
  } else if (vitals.lcp > thresholds.lcp.good) {
    analysis.score = analysis.score === 'good' ? 'needs-improvement' : analysis.score;
  }

  // Verifica FID/INP (Interatividade)
  const interactionMetric = vitals.inp || vitals.fid;
  const interactionThreshold = vitals.inp ? thresholds.inp : thresholds.fid;
  
  if (interactionMetric > interactionThreshold.poor) {
    analysis.score = 'poor';
    analysis.issues.push('Resposta lenta à interação do usuário');
    analysis.recommendations.push('Reduzir JavaScript de bloqueio');
  } else if (interactionMetric > interactionThreshold.good) {
    analysis.score = analysis.score === 'good' ? 'needs-improvement' : analysis.score;
  }

  // Adiciona contexto médico específico
  if (analysis.score !== 'good') {
    analysis.recommendations.push(
      'Para um site médico como a Clínica Saraiva Vision, a performance é crucial para pacientes que buscam informações urgentes'
    );
  }

  return analysis;
}