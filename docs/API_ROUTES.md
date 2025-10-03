# Next.js API Routes Documentation
**Saraiva Vision** - Backend Services | CFM/LGPD Compliant

**Version**: 2.0.0 | **Last Updated**: October 2025

---

## Overview

This document details all API routes for the Saraiva Vision platform, migrated from Express.js to Next.js App Router API Routes.

### Base URL
- **Production**: `https://saraivavision.com.br/api`
- **Development**: `http://localhost:3000/api`

### Architecture
- **Framework**: Next.js 15 App Router
- **Runtime**: Edge (lightweight) + Node.js (email/heavy operations)
- **Validation**: Zod schemas
- **Type Safety**: Full TypeScript with strict mode
- **Caching**: Response caching + stale-while-revalidate
- **Rate Limiting**: IP-based with configurable limits

---

## 1. Contact API

### POST /api/contact
Send contact form submission via email.

#### Request
```typescript
POST /api/contact
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(33) 99999-9999",
  "message": "Gostaria de agendar uma consulta...",
  "honeypot": ""  // Leave empty - spam protection
}
```

#### Response - Success (200)
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  "messageId": "re_abc123xyz"
}
```

#### Response - Rate Limited (429)
```json
{
  "success": false,
  "error": "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

#### Response - Validation Error (400)
```json
{
  "success": false,
  "error": "Dados inválidos. Verifique os campos e tente novamente.",
  "details": {
    "email": ["Email inválido"],
    "phone": ["Telefone inválido. Use formato: (33) 99999-9999"]
  }
}
```

#### Configuration
- **Rate Limit**: 10 requests per 10 minutes per IP
- **Email Provider**: Resend API
- **Validation**: Zod schema (contactFormSchema)
- **LGPD Compliance**: PII anonymization in logs
- **Spam Protection**: Honeypot field

---

## 2. Google Reviews API

### GET /api/reviews
Fetch Google Place reviews with statistics.

#### Request
```
GET /api/reviews?limit=5&language=pt-BR
```

#### Query Parameters
| Parameter  | Type   | Default | Description                   |
|------------|--------|---------|-------------------------------|
| `placeId`  | string | env var | Google Place ID (optional)    |
| `limit`    | number | 5       | Max reviews (1-50)            |
| `language` | string | pt-BR   | Language code (ISO format)    |

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "places-1234567890",
        "reviewer": {
          "displayName": "Maria Santos",
          "profilePhotoUrl": "https://...",
          "isAnonymous": false
        },
        "starRating": 5,
        "comment": "Excelente atendimento!",
        "createTime": "2025-09-15T10:30:00.000Z",
        "isRecent": true,
        "wordCount": 15,
        "language": "pt-BR"
      }
    ],
    "stats": {
      "overview": {
        "totalReviews": 136,
        "averageRating": 4.9,
        "recentReviews": 12,
        "responseRate": 85.5
      },
      "distribution": { "1": 2, "2": 3, "3": 8, "4": 23, "5": 100 },
      "sentiment": {
        "positive": 123,
        "neutral": 8,
        "negative": 5,
        "positivePercentage": 90,
        "negativePercentage": 4
      }
    },
    "metadata": {
      "fetchedAt": "2025-10-03T10:00:00.000Z",
      "source": "google-places-api",
      "placeId": "ChIJVUKww7WRugARF7u2lAe7BeE",
      "placeName": "Clínica Saraiva Vision",
      "totalReviews": 136,
      "averageRating": 4.9
    }
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

#### Configuration
- **Cache TTL**: 60 minutes
- **Rate Limit**: 30 requests per minute
- **API**: Google Places API
- **Runtime**: Edge (global CDN)

---

## 3. Blog API

### GET /api/blog
List blog posts with pagination and filtering.

#### Request
```
GET /api/blog?page=1&pageSize=10&category=Tratamento&featured=true
```

#### Query Parameters
| Parameter  | Type    | Default | Description                           |
|------------|---------|---------|---------------------------------------|
| `page`     | number  | 1       | Page number (1-indexed)               |
| `pageSize` | number  | 10      | Items per page (1-100)                |
| `category` | string  | -       | Filter by category                    |
| `featured` | boolean | -       | Filter featured posts only            |
| `search`   | string  | -       | Search in title, excerpt, tags        |

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "slug": "catarata-ep2",
        "title": "Catarata: Sintomas e Cirurgia",
        "excerpt": "Catarata: sintomas e cirurgia...",
        "author": "Dr. Philipe Saraiva Cruz",
        "date": "2025-09-29",
        "category": "Tratamento",
        "tags": ["lentes premium", "cirurgia de catarata"],
        "image": "/Blog/capa-lentes-premium-catarata.png",
        "featured": true,
        "seo": {
          "metaTitle": "Lentes Premium para Cirurgia de Catarata...",
          "metaDescription": "...",
          "keywords": ["lentes premium", "catarata"]
        }
      }
    ],
    "total": 24,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3,
    "categories": ["Todas", "Prevenção", "Tratamento", "Tecnologia"]
  }
}
```

### GET /api/blog/[slug]
Get single blog post by slug.

#### Request
```
GET /api/blog/catarata-ep2
```

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "slug": "catarata-ep2",
    "title": "Catarata: Sintomas e Cirurgia",
    "content": "<h2>O Que é Catarata...</h2>...",
    "author": "Dr. Philipe Saraiva Cruz",
    "date": "2025-09-29",
    "category": "Tratamento",
    "tags": ["lentes premium", "cirurgia de catarata"],
    "relatedPodcasts": [
      {
        "id": "catarata-ep2",
        "title": "Catarata: Sintomas e Cirurgia",
        "spotifyUrl": "https://open.spotify.com/show/...",
        "spotifyShowId": "6sHIG7HbhF1w5O63CTtxwV"
      }
    ]
  }
}
```

#### Response - Not Found (404)
```json
{
  "success": false,
  "error": "Post not found"
}
```

#### Configuration
- **Cache TTL**: 1 hour (list) / 24 hours (single post)
- **Runtime**: Edge (global CDN)
- **Data Source**: Static data (`src/data/blogPosts.js`)

---

## 4. Profile API

### POST /api/profile
Set user profile preference (familiar, jovem, senior).

#### Request
```typescript
POST /api/profile
Content-Type: application/json

{
  "profile": "jovem",
  "source": "manual",
  "confidence": 0.95
}
```

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "profile": "jovem",
    "detectedAt": "2025-10-03T10:00:00.000Z",
    "source": "manual",
    "confidence": 0.95
  },
  "message": "Profile preference saved successfully"
}
```

**Cookie Set**: `profile-preference=jovem; Max-Age=31536000; Path=/; SameSite=Strict; Secure`

### GET /api/profile
Get current profile preference from cookie.

#### Request
```
GET /api/profile
```

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "profile": "jovem",
    "detectedAt": "2025-10-03T10:00:00.000Z",
    "source": "manual"
  }
}
```

#### Response - Not Found (404)
```json
{
  "success": false,
  "error": "No profile preference set"
}
```

#### Configuration
- **Cookie Lifetime**: 1 year
- **Allowed Profiles**: familiar | jovem | senior
- **Runtime**: Edge (global CDN)

---

## 5. Health Check API

### GET /api/health
System health status and service diagnostics.

#### Request
```
GET /api/health
```

#### Response - Healthy (200)
```json
{
  "status": "ok",
  "timestamp": "2025-10-03T10:00:00.000Z",
  "service": "saraiva-vision-api",
  "environment": "production",
  "version": "abc123def456",
  "services": {
    "contactForm": {
      "status": "ok",
      "configured": true
    },
    "googleReviews": {
      "status": "ok",
      "configured": true
    },
    "rateLimiting": {
      "status": "ok",
      "configured": true
    },
    "validation": {
      "status": "ok",
      "configured": true
    }
  },
  "config": {
    "nodeEnv": "production",
    "hasResendKey": true,
    "hasGoogleKey": true
  }
}
```

#### Response - Degraded (503)
```json
{
  "status": "degraded",
  "timestamp": "2025-10-03T10:00:00.000Z",
  "service": "saraiva-vision-api",
  "environment": "production",
  "version": "abc123def456",
  "services": {
    "contactForm": {
      "status": "error",
      "configured": false,
      "errors": ["RESEND_API_KEY not set"]
    }
  }
}
```

#### Configuration
- **Runtime**: Edge (global CDN)
- **Monitoring**: Real-time service status

---

## 6. Subscription API (NEW - Jovem Profile)

### POST /api/subscription/create
Create a new subscription for Jovem profile users.

#### Request
```typescript
POST /api/subscription/create
Content-Type: application/json

{
  "planId": "premium-monthly",
  "customerEmail": "cliente@example.com",
  "customerName": "Maria Silva",
  "paymentMethodId": "pm_123abc"  // Optional - Stripe payment method
}
```

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1A2B3C4D",
    "clientSecret": "pi_1A2B3C4D_secret_xyz",
    "status": "active"
  }
}
```

### GET /api/subscription/[id]
Get subscription details.

#### Request
```
GET /api/subscription/sub_1A2B3C4D
```

#### Response - Success (200)
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1A2B3C4D",
    "status": "active",
    "currentPeriodEnd": "2025-11-03T10:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "plan": {
      "id": "premium-monthly",
      "name": "Plano Premium Mensal",
      "price": 4990,
      "currency": "BRL",
      "interval": "month",
      "features": ["Consultas prioritárias", "Telemedicina 24/7"],
      "stripePriceId": "price_1A2B3C4D"
    }
  }
}
```

#### Configuration
- **Payment Provider**: Stripe
- **LGPD Compliance**: Customer data encryption
- **Runtime**: Node.js (Stripe SDK)

---

## Security & Compliance

### CFM (Conselho Federal de Medicina)
- ✅ Medical content validation (Zod schemas)
- ✅ Author CRM verification
- ✅ Mandatory medical disclaimers
- ✅ Professional disclaimers in email templates

### LGPD (Lei Geral de Proteção de Dados)
- ✅ PII anonymization in logs
- ✅ Data minimization (collect only necessary data)
- ✅ User consent management (cookies)
- ✅ Right to deletion (cookie expiration)
- ✅ Secure data transmission (HTTPS only)

### Security Headers
All API routes include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

### Rate Limiting
| Endpoint       | Limit              | Window  | Storage       |
|----------------|--------------------|---------|---------------|
| `/api/contact` | 10 requests        | 10 min  | In-memory map |
| `/api/reviews` | 30 requests        | 1 min   | Cache         |
| `/api/*`       | 100 requests (default) | 15 min  | Global        |

**Upgrade to Redis**: For production, use Upstash Redis or Vercel KV for distributed rate limiting.

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field1": ["Validation error 1"],
    "field2": ["Validation error 2"]
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

### Error Codes
| Code                 | Description                          | HTTP Status |
|----------------------|--------------------------------------|-------------|
| `RATE_LIMIT_EXCEEDED`| Too many requests                    | 429         |
| `VALIDATION_ERROR`   | Invalid input data                   | 400         |
| `NOT_FOUND`          | Resource not found                   | 404         |
| `CONFIG_ERROR`       | Server misconfiguration              | 500         |
| `INTERNAL_ERROR`     | Unexpected server error              | 500         |
| `UNAUTHORIZED`       | Authentication required              | 401         |

---

## Environment Variables

### Required
```bash
# Email Service (Contact API)
RESEND_API_KEY=re_abc123xyz
CONTACT_TO_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=contato@saraivavision.com.br

# Google Services (Reviews API)
GOOGLE_PLACE_ID=ChIJVUKww7WRugARF7u2lAe7BeE
GOOGLE_PLACES_API_KEY=AIzaSy...
```

### Optional
```bash
# Rate Limiting
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=600000  # 10 minutes in ms

# Stripe (Subscription API)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Node Environment
NODE_ENV=production
VERCEL_GIT_COMMIT_SHA=abc123  # Auto-set by Vercel
```

---

## Testing

### Example cURL Commands

**Contact Form**:
```bash
curl -X POST https://saraivavision.com.br/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "(33) 99999-9999",
    "message": "Gostaria de agendar uma consulta",
    "honeypot": ""
  }'
```

**Google Reviews**:
```bash
curl https://saraivavision.com.br/api/reviews?limit=5
```

**Health Check**:
```bash
curl https://saraivavision.com.br/api/health
```

---

## Migration from Express.js

### Changes Summary
| Feature               | Express.js (Old)      | Next.js (New)              |
|-----------------------|-----------------------|----------------------------|
| **Routing**           | Manual routes         | File-based routing         |
| **Validation**        | Custom functions      | Zod schemas                |
| **Type Safety**       | Partial (JSDoc)       | Full TypeScript            |
| **Runtime**           | Node.js only          | Edge + Node.js             |
| **Caching**           | Manual                | Built-in Cache-Control     |
| **Error Handling**    | try/catch             | NextResponse + Zod         |
| **Rate Limiting**     | express-rate-limit    | Custom implementation      |
| **CORS**              | cors middleware       | Response headers           |
| **Deployment**        | Separate VPS process  | Integrated with frontend   |

### Deprecated Endpoints
The following Express.js endpoints are deprecated and migrated:

- ❌ `api/contact/index.js` → ✅ `app/api/contact/route.ts`
- ❌ `api/google-reviews.js` → ✅ `app/api/reviews/route.ts`
- ❌ `api/health.js` → ✅ `app/api/health/route.ts`

---

## Performance Optimizations

### Edge Runtime Benefits
- ⚡ **Global CDN**: Deploy to 50+ regions worldwide
- ⚡ **Cold Start**: <10ms (vs 100ms+ for Node.js)
- ⚡ **Latency**: <50ms average response time
- ⚡ **Auto-Scaling**: Automatic concurrent request handling

### Caching Strategy
```typescript
// Reviews API (60 min cache, 2 hour stale)
Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200

// Blog API (1 hour cache, 7 day stale)
Cache-Control: public, s-maxage=3600, stale-while-revalidate=604800

// Contact API (no cache - always fresh)
Cache-Control: no-store
```

---

## Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics**: Real-time API monitoring
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **PostHog**: User analytics and feature flags

### Key Metrics to Track
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Rate limit hits
- Cache hit/miss ratio
- Email delivery rate (Resend)

---

## Future Enhancements

### Planned Features
1. **Authentication**: JWT-based auth for protected endpoints
2. **WebSockets**: Real-time notifications (Edge Runtime)
3. **Stripe Webhooks**: Subscription lifecycle management
4. **Redis**: Distributed rate limiting and caching
5. **GraphQL**: Alternative API interface
6. **API Versioning**: `/api/v2/...` for breaking changes

---

**Last Updated**: October 3, 2025
**Maintained By**: Saraiva Vision Development Team
**Contact**: philipe_cruz@outlook.com
