# Saraiva Vision - API Design Specification

Documentação completa das APIs do projeto, com exemplos práticos e padrões de integração.

## 🔌 API Architecture Overview

**Pattern**: RESTful APIs with serverless functions  
**Authentication**: API keys and rate limiting  
**Data Format**: JSON with standardized response structure  
**Error Handling**: HTTP status codes with detailed error messages  
**Caching**: Response caching with TTL for performance  
**Security**: CORS, input validation, and rate limiting  

## 📋 Available APIs

### 1. Google Reviews API (`/api/reviews`)

**Purpose**: Fetch and display Google reviews for the clinic  
**Method**: `GET`  
**Rate Limit**: 10 requests per minute per IP  
**Cache**: 5 minutes TTL  

#### Request Parameters
```typescript
interface ReviewsRequest {
  placeId?: string;     // Optional: Override default place ID
  lang?: 'pt' | 'en';   // Language preference (default: 'pt')
  limit?: number;       // Number of reviews (default: 5, max: 20)
}
```

#### Response Format
```typescript
interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    rating: number;           // Overall rating (1-5)
    totalReviews: number;     // Total review count
    lastUpdated: string;      // ISO timestamp
  };
  meta: {
    placeId: string;
    cached: boolean;
    cacheExpiry: string;
    requestId: string;
  };
  error?: string;
}

interface Review {
  id: string;
  author: string;
  rating: number;           // 1-5 stars
  text: string;
  date: string;             // ISO timestamp
  profileImage?: string;
  verified: boolean;
}
```

#### Usage Examples

**Frontend Integration**
```javascript
// React Hook for Reviews
import { useState, useEffect } from 'react';

export const useGoogleReviews = (limit = 5) => {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?limit=${limit}`);
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [limit]);

  return { reviews, loading, error };
};

// Component Usage
const GoogleReviews = () => {
  const { reviews, loading, error } = useGoogleReviews(5);

  if (loading) return <div>Carregando avaliações...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h3>Avaliações Google ({reviews.totalReviews})</h3>
      <div>Nota: {reviews.rating}/5 ⭐</div>
      {reviews.reviews.map(review => (
        <div key={review.id}>
          <strong>{review.author}</strong> - {review.rating}/5
          <p>{review.text}</p>
          <time>{new Date(review.date).toLocaleDateString('pt-BR')}</time>
        </div>
      ))}
    </div>
  );
};
```

**Direct API Calls**
```bash
# Basic request
curl "https://saraivavision.com.br/api/reviews"

# With parameters
curl "https://saraivavision.com.br/api/reviews?limit=10&lang=pt"

# Response example
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "ChZDSUhNMG9nS0VJQ0FnSUR...",
        "author": "Maria Silva",
        "rating": 5,
        "text": "Excelente atendimento! Dr. Philipe é muito atencioso...",
        "date": "2024-12-15T10:30:00Z",
        "verified": true
      }
    ],
    "rating": 4.8,
    "totalReviews": 127,
    "lastUpdated": "2025-01-05T14:30:00Z"
  },
  "meta": {
    "placeId": "ChIJXX...",
    "cached": false,
    "cacheExpiry": "2025-01-05T14:35:00Z",
    "requestId": "req_123456"
  }
}
```

### 2. Contact Form API (`/api/contact`)

**Purpose**: Handle contact form submissions with validation  
**Method**: `POST`  
**Rate Limit**: 5 submissions per hour per IP  
**Validation**: reCAPTCHA v3, honeypot, sanitization  

#### Request Format
```typescript
interface ContactRequest {
  name: string;           // Required, 2-100 chars
  email: string;          // Required, valid email
  phone: string;          // Required, Brazilian format
  message: string;        // Required, 10-1000 chars
  service?: string;       // Optional, service of interest
  recaptchaToken: string; // Required, reCAPTCHA v3 token
  website?: string;       // Honeypot field (should be empty)
}
```

#### Response Format
```typescript
interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;           // Submission ID
    timestamp: string;
  };
  error?: {
    field?: string;       // Field with validation error
    code: string;         // Error code
    message: string;      // Human readable message
  };
}
```

#### Usage Examples

**Frontend Form**
```javascript
import { useState } from 'react';

export const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    service: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await grecaptcha.execute(
        process.env.REACT_APP_RECAPTCHA_SITE_KEY, 
        { action: 'contact_form' }
      );

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        setFormData({ name: '', email: '', phone: '', message: '', service: '' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: { message: 'Erro de conexão' } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome completo"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      <input
        type="email"
        placeholder="E-mail"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        required
      />
      <input
        type="tel"
        placeholder="Telefone"
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        required
      />
      <textarea
        placeholder="Mensagem"
        value={formData.message}
        onChange={(e) => setFormData({...formData, message: e.target.value})}
        required
      />
      
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar Mensagem'}
      </button>
      
      {result && (
        <div className={result.success ? 'success' : 'error'}>
          {result.message || result.error?.message}
        </div>
      )}
    </form>
  );
};
```

### 3. Environment Debug API (`/api/env-debug`)

**Purpose**: Debug environment variables in development  
**Method**: `GET`  
**Environment**: Development only  
**Security**: Sanitized output, no sensitive data  

#### Response Format
```typescript
interface EnvDebugResponse {
  success: boolean;
  environment: 'development' | 'production';
  data: {
    nodeEnv: string;
    hasGoogleApiKey: boolean;
    hasRecaptchaKey: boolean;
    hasSupabaseUrl: boolean;
    buildTime: string;
  };
}
```

## 🔒 Security Implementation

### Rate Limiting
```javascript
// Rate limiting implementation
const rateLimiter = new Map();

const checkRateLimit = (req, maxRequests = 10, windowMs = 60000) => {
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimiter.has(clientId)) {
    rateLimiter.set(clientId, []);
  }
  
  const requests = rateLimiter.get(clientId)
    .filter(timestamp => timestamp > windowStart);
  
  if (requests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
    };
  }
  
  requests.push(now);
  rateLimiter.set(clientId, requests);
  
  return { allowed: true };
};
```

### Input Validation
```javascript
// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, 1000)  // Max length
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/[<>]/g, ''); // Remove HTML brackets
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone validation (Brazilian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};
```

### reCAPTCHA Integration
```javascript
// Server-side reCAPTCHA verification
const verifyRecaptcha = async (token, expectedAction = 'contact_form') => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
  
  const response = await fetch(verifyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${token}`
  });
  
  const data = await response.json();
  
  return {
    success: data.success,
    score: data.score,
    action: data.action,
    valid: data.success && 
           data.score >= 0.5 && 
           data.action === expectedAction
  };
};
```

## 📊 Caching Strategy

### Response Caching
```javascript
// Simple in-memory cache
const cache = new Map();

const setCache = (key, data, ttlMs = 300000) => { // 5 minutes default
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs
  });
};

const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached || cached.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return cached.data;
};

// Usage in API endpoints
const cacheKey = `reviews_${placeId}_${lang}`;
const cached = getCache(cacheKey);
if (cached) {
  return res.json({ ...cached, meta: { ...cached.meta, cached: true } });
}
```

## 🛠️ Development Tools

### API Testing
```bash
# Test reviews API
curl -X GET "http://localhost:3000/api/reviews?limit=3" \
  -H "Accept: application/json"

# Test contact API
curl -X POST "http://localhost:3000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Silva",
    "email": "teste@example.com",
    "phone": "(33) 99999-9999",
    "message": "Teste de contato",
    "recaptchaToken": "test_token"
  }'

# Test rate limiting
for i in {1..15}; do
  curl "http://localhost:3000/api/reviews" && echo
done
```

### Local Development Server
```bash
# Start API server only
npm run start:api

# Start full stack (frontend + API)
npm run dev:full

# Monitor API logs
tail -f server.log
```

## 📈 Monitoring and Analytics

### API Metrics
```javascript
// Basic metrics collection
const metrics = {
  requests: 0,
  errors: 0,
  responseTime: [],
  rateLimit: 0
};

const recordMetrics = (endpoint, statusCode, responseTime) => {
  metrics.requests++;
  metrics.responseTime.push(responseTime);
  
  if (statusCode >= 400) {
    metrics.errors++;
  }
  
  if (statusCode === 429) {
    metrics.rateLimit++;
  }
};

// Export metrics endpoint
export const getMetrics = () => ({
  ...metrics,
  avgResponseTime: metrics.responseTime.length > 0 
    ? metrics.responseTime.reduce((a, b) => a + b) / metrics.responseTime.length 
    : 0,
  errorRate: metrics.requests > 0 ? metrics.errors / metrics.requests : 0
});
```

### Error Tracking
```javascript
// Error logging
const logError = (error, context) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context,
    userAgent: context.req?.headers?.['user-agent'],
    ip: context.req?.headers?.['x-forwarded-for']
  };
  
  console.error('API Error:', JSON.stringify(logEntry, null, 2));
  
  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // sendToMonitoring(logEntry);
  }
};
```

## 🚀 Deployment Configuration

### Environment Variables
```bash
# Required for production
GOOGLE_PLACES_API_KEY=your_google_api_key
GOOGLE_PLACE_ID=your_place_id
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# Optional
API_RATE_LIMIT_MAX=10
API_RATE_LIMIT_WINDOW=60000
CACHE_TTL=300000
```

### CORS Configuration
```javascript
// Production CORS settings
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://saraivavision.com.br', 'https://www.saraivavision.com.br']
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
```

---

*Esta documentação cobre todas as APIs implementadas no projeto. Para exemplos de integração específicos, consulte os componentes em `src/components/`.*
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