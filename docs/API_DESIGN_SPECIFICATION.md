# Saraiva Vision - API Design Specification

## 🔌 API Architecture Overview

**Pattern**: RESTful APIs with serverless functions
**Authentication**: API keys and rate limiting
**Data Format**: JSON with standardized response structure
**Error Handling**: HTTP status codes with detailed error messages

## 📋 API Endpoint Specification

### 1. Google Reviews API (`/api/reviews`)

#### Endpoint Configuration
```typescript
// GET /api/reviews
interface ReviewsRequest {
  placeId?: string;
  lang?: 'pt' | 'en';
  limit?: number; // Default: 5, Max: 20
}

interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    rating: number;
    totalReviews: number;
    lastUpdated: string;
  };
  meta: {
    placeId: string;
    cached: boolean;
    cacheExpiry: string;
  };
  error?: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  profileImage?: string;
  verified: boolean;
}
```

#### Implementation
```javascript
// /api/reviews.js
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { placeId, lang = 'pt', limit = 5 } = req.query;
    const targetPlaceId = placeId || process.env.GOOGLE_PLACE_ID;
    
    // Rate limiting check
    const rateLimitResult = await checkRateLimit(req);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      });
    }

    // Cache check
    const cacheKey = `reviews_${targetPlaceId}_${lang}_${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({
        ...cached,
        meta: { ...cached.meta, cached: true }
      });
    }

    // Google Places API call
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = new URLSearchParams({
      place_id: targetPlaceId,
      fields: 'reviews,rating,user_ratings_total',
      key: apiKey,
      language: lang
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google API error: ${data.status}`);
    }

    const reviews = (data.result.reviews || [])
      .slice(0, limit)
      .map(review => ({
        id: `${review.author_name}_${review.time}`,
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        date: new Date(review.time * 1000).toISOString(),
        profileImage: review.profile_photo_url,
        verified: true
      }));

    const result = {
      success: true,
      data: {
        reviews,
        rating: data.result.rating,
        totalReviews: data.result.user_ratings_total,
        lastUpdated: new Date().toISOString()
      },
      meta: {
        placeId: targetPlaceId,
        cached: false,
        cacheExpiry: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
      }
    };

    // Cache the result
    await setCache(cacheKey, result, 300); // 5 minutes TTL
    
    // Set response headers
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Reviews API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reviews',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
```

### 2. Contact Form API (`/api/contact`)

#### Endpoint Configuration
```typescript
// POST /api/contact
interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  serviceType?: string;
  preferredDate?: string;
  gdprConsent: boolean;
  honeypot?: string; // Spam protection
}

interface ContactResponse {
  success: boolean;
  data?: {
    id: string;
    timestamp: string;
    whatsappUrl?: string;
  };
  error?: string;
  validation?: Record<string, string>;
}
```

#### Implementation
```javascript
// /api/contact.js
import { validateInput, sanitizeInput } from '../lib/validation';
import { sendToWhatsApp } from '../lib/whatsapp';

export default async function handler(req, res) {
  // CORS and method validation
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email, 
      phone,
      message,
      serviceType,
      preferredDate,
      gdprConsent,
      honeypot
    } = req.body;

    // Honeypot spam protection
    if (honeypot) {
      return res.status(400).json({ success: false, error: 'Spam detected' });
    }

    // GDPR consent validation
    if (!gdprConsent) {
      return res.status(400).json({
        success: false,
        error: 'GDPR consent required',
        validation: { gdprConsent: 'Consent required' }
      });
    }

    // Input validation
    const validation = validateContactForm({
      name, email, phone, message
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validation: validation.errors
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      message: sanitizeInput(message),
      serviceType: serviceType ? sanitizeInput(serviceType) : null,
      preferredDate: preferredDate ? sanitizeInput(preferredDate) : null
    };

    // Generate submission ID
    const submissionId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create WhatsApp message
    const whatsappMessage = formatWhatsAppMessage(sanitizedData);
    const whatsappUrl = `https://wa.me/5533998601427?text=${encodeURIComponent(whatsappMessage)}`;

    // Log submission (optional - could save to database)
    console.log('Contact submission:', {
      id: submissionId,
      timestamp: new Date().toISOString(),
      data: sanitizedData
    });

    // Response
    res.status(200).json({
      success: true,
      data: {
        id: submissionId,
        timestamp: new Date().toISOString(),
        whatsappUrl
      }
    });

  } catch (error) {
    console.error('Contact API Error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Validation helper
function validateContactForm(data) {
  const errors = {};
  
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Email deve ter formato válido';
  }
  
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.phone = 'Telefone deve ter formato válido';
  }
  
  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Mensagem deve ter pelo menos 10 caracteres';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

// WhatsApp message formatter
function formatWhatsAppMessage(data) {
  let message = `🏥 *Nova Mensagem do Site*\n\n`;
  message += `👤 *Nome:* ${data.name}\n`;
  message += `📧 *Email:* ${data.email}\n`;
  message += `📱 *Telefone:* ${data.phone}\n`;
  
  if (data.serviceType) {
    message += `🔍 *Serviço:* ${data.serviceType}\n`;
  }
  
  if (data.preferredDate) {
    message += `📅 *Data Preferida:* ${data.preferredDate}\n`;
  }
  
  message += `\n💬 *Mensagem:*\n${data.message}`;
  message += `\n\n⏰ Enviado em: ${new Date().toLocaleString('pt-BR')}`;
  
  return message;
}
```

### 3. Sitemap Generation API (`/api/sitemap`)

#### Endpoint Configuration
```typescript
// GET /api/sitemap.xml
interface SitemapResponse {
  xml: string;
  lastModified: string;
  urls: SitemapUrl[];
}

interface SitemapUrl {
  url: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}
```

#### Implementation
```javascript
// /api/sitemap.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const baseUrl = 'https://saraivavision.com.br';
    const now = new Date().toISOString().split('T')[0];

    const urls = [
      {
        url: `${baseUrl}/`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        url: `${baseUrl}/lentes`,
        lastmod: now,
        changefreq: 'monthly', 
        priority: 0.8
      },
      {
        url: `${baseUrl}/depoimentos`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        url: `${baseUrl}/privacy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: 0.3
      }
    ];

    // Add dynamic service pages
    const services = [
      'exame-de-vista',
      'cirurgia-catarata', 
      'tratamento-glaucoma',
      'refracao-ocular',
      'consulta-oftalmologica'
    ];

    services.forEach(serviceId => {
      urls.push({
        url: `${baseUrl}/servico/${serviceId}`,
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.6
      });
    });

    // Generate XML
    const xml = generateSitemapXML(urls);

    // Set headers
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400'); // 24 hours
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).end();
  }
}

function generateSitemapXML(urls) {
  const urlElements = urls.map(url => `
  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlElements}
</urlset>`;
}
```

## 🛡️ Security & Rate Limiting

### Rate Limiting Implementation
```javascript
// /lib/rateLimiter.js
const rateLimits = new Map();

export function checkRateLimit(req, options = {}) {
  const {
    windowMs = 60000,  // 1 minute
    maxRequests = 10,
    keyGenerator = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress
  } = options;

  const key = keyGenerator(req);
  const now = Date.now();
  const window = Math.floor(now / windowMs);

  const requestInfo = rateLimits.get(key) || { count: 0, window };

  if (requestInfo.window !== window) {
    // Reset counter for new window
    requestInfo.count = 1;
    requestInfo.window = window;
  } else {
    requestInfo.count++;
  }

  rateLimits.set(key, requestInfo);

  const allowed = requestInfo.count <= maxRequests;
  const retryAfter = allowed ? null : windowMs - (now % windowMs);

  return { allowed, retryAfter, requestsRemaining: maxRequests - requestInfo.count };
}
```

### Input Validation & Sanitization
```javascript
// /lib/validation.js
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, 1000) // Max length limit
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

export function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}
```

## 📊 Error Handling Standards

### Standardized Error Responses
```javascript
// Error response structure
const ErrorResponse = {
  success: false,
  error: 'Error message for user',
  code: 'ERROR_CODE', // Machine-readable error code
  details: 'Detailed error information', // Only in development
  timestamp: '2024-01-01T00:00:00.000Z',
  requestId: 'req_123456789'
};

// Error types
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED', 
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND'
};
```

### Error Handling Middleware
```javascript
// /lib/errorHandler.js
export function handleApiError(error, req, res) {
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  console.error('API Error:', {
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.url,
    method: req.method,
    userAgent: req.headers['user-agent']
  });

  // Determine error type and response
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    errorCode = 'RATE_LIMIT_EXCEEDED';
    message = 'Rate limit exceeded';
  } else if (error.name === 'ExternalApiError') {
    statusCode = 502;
    errorCode = 'EXTERNAL_API_ERROR'; 
    message = 'External service error';
  }

  const response = {
    success: false,
    error: message,
    code: errorCode,
    timestamp: new Date().toISOString(),
    requestId
  };

  // Add details in development
  if (process.env.NODE_ENV === 'development') {
    response.details = error.message;
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}
```

## 📈 Analytics & Monitoring

### API Analytics Integration
```javascript
// Track API usage
function trackApiCall(endpoint, method, statusCode, responseTime) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'api_call', {
      event_category: 'api',
      event_label: `${method} ${endpoint}`,
      custom_map: {
        status_code: statusCode,
        response_time: responseTime
      }
    });
  }
}

// Performance monitoring
function measureApiPerformance(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    
    try {
      await handler(req, res);
      const responseTime = Date.now() - startTime;
      trackApiCall(req.url, req.method, res.statusCode, responseTime);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      trackApiCall(req.url, req.method, 500, responseTime);
      throw error;
    }
  };
}
```

This API specification ensures secure, performant, and maintainable backend services for the Saraiva Vision application.