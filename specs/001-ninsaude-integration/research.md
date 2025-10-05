# Research: Ninsaúde API Integration

**Date**: 2025-10-05
**Feature**: 001-ninsaude-integration
**Purpose**: Technology decisions and best practices research for Ninsaúde appointment booking system

---

## 1. Ninsaúde API OAuth2 Authentication

### Decision
Implement OAuth2 client credentials flow with automatic token refresh using Redis caching

### Rationale
- **Ninsaúde API Structure** (from Postman collection):
  - `POST /v1/oauth2/token` - Acquire access token (15-minute expiry)
  - Access tokens must be refreshed before expiry
  - Backend-only authentication (never expose credentials to frontend)

- **Security Requirements**:
  - Client credentials stored in backend environment variables only
  - Tokens cached in Redis with TTL matching expiry (14 minutes)
  - Middleware auto-refreshes tokens 1 minute before expiry
  - Frontend never receives raw tokens, only authenticated API responses

### Implementation Pattern
```javascript
// api/ninsaude/auth.js
class NinsaudeAuth {
  async getAccessToken() {
    const cached = await redis.get('ninsaude:token');
    if (cached && !this.isExpiringSoon(cached)) {
      return cached.access_token;
    }
    return await this.refreshToken();
  }

  async refreshToken() {
    const response = await axios.post('https://api.ninsaude.com/v1/oauth2/token', {
      grant_type: 'client_credentials',
      client_id: process.env.NINSAUDE_CLIENT_ID,
      client_secret: process.env.NINSAUDE_CLIENT_SECRET
    });
    await redis.setex('ninsaude:token', 840, JSON.stringify(response.data)); // 14 minutes
    return response.data.access_token;
  }
}
```

### Alternatives Considered
- **Session-based auth**: Rejected - OAuth2 is Ninsaúde standard
- **Frontend token storage**: Rejected - security risk, violates LGPD
- **No caching**: Rejected - unnecessary API calls, rate limit risk

---

## 2. WhatsApp Notification API Options

### Decision
Use **Evolution API** (self-hosted WhatsApp webhook solution)

### Rationale
**Evolution API** (Recommended for Brazil):
- ✅ Open-source, self-hostable on existing VPS
- ✅ Official WhatsApp Business API integration
- ✅ Webhook-based automation (no manual intervention)
- ✅ Brazilian market focus, Portuguese documentation
- ✅ Cost: Free (self-hosted) vs Twilio R$0.25/msg
- ✅ LGPD compliance (data stays in Brazil VPS)

**Twilio WhatsApp API**:
- ❌ Higher cost (R$0.25 per message + monthly fees)
- ❌ US-based data processing (LGPD concerns)
- ✅ Enterprise reliability
- ✅ Official WhatsApp Business Solution Provider

**MessageBird**:
- ❌ Similar pricing to Twilio
- ❌ Limited Brazil-specific features
- ✅ European GDPR compliance

### Implementation
```javascript
// api/ninsaude/notifications.js
async function sendWhatsAppNotification(phone, message) {
  const response = await axios.post(`${EVOLUTION_API_URL}/message/sendText`, {
    number: phone,
    text: message
  }, {
    headers: { 'apikey': process.env.EVOLUTION_API_KEY }
  });
  return response.data;
}
```

### Alternatives Considered
- **Twilio**: Rejected due to cost and data sovereignty
- **Manual WhatsApp**: Rejected - doesn't scale, violates requirement FR-020a

---

## 3. Exponential Backoff Retry Strategy

### Decision
Implement exponential backoff with jitter: 1s → 2s → 4s (max 3 attempts)

### Rationale
- **Industry Best Practices**:
  - AWS recommends exponential backoff with jitter for API retry
  - Google Cloud suggests 1s base delay for transient failures
  - Maximum 3 attempts prevents infinite loops

- **Ninsaúde-Specific**:
  - Rate limit: 30 requests/minute (spec NFR-006)
  - Transient errors common in healthcare APIs
  - 429 (Too Many Requests) should trigger longer backoff

### Implementation
```javascript
// api/utils/retryWithBackoff.js
async function retryWithBackoff(fn, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) throw error;

      const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      const jitter = Math.random() * 500; // 0-500ms randomization
      const delay = Math.min(baseDelay + jitter, 30000); // cap at 30s

      if (error.response?.status === 429) {
        await sleep(delay * 2); // Double delay for rate limits
      } else {
        await sleep(delay);
      }
    }
  }
}
```

### Alternatives Considered
- **Linear backoff**: Rejected - doesn't reduce server load effectively
- **Immediate retry**: Rejected - can worsen rate limiting
- **Unlimited retries**: Rejected - can create infinite loops

---

## 4. Failed API Call Queue Mechanism

### Decision
Redis-based persistent queue with TTL and manual fallback after exhaustion

### Rationale
- **Redis Queue Advantages**:
  - Persistent across server restarts
  - Built-in TTL for automatic cleanup
  - Atomic operations for concurrent access
  - Already in tech stack (no new dependency)

- **Fallback Strategy** (Spec NFR-005):
  - Auto-retry with exponential backoff (3 attempts)
  - On exhaustion → queue in Redis with 24h TTL
  - Background worker processes queue every 5 minutes
  - After 24h → escalate to manual processing form

### Implementation
```javascript
// api/ninsaude/queueManager.js
class RequestQueue {
  async enqueue(requestData) {
    const id = crypto.randomUUID();
    await redis.setex(`queue:ninsaude:${id}`, 86400, JSON.stringify({
      ...requestData,
      attempts: 0,
      createdAt: Date.now()
    }));
    return id;
  }

  async processQueue() {
    const keys = await redis.keys('queue:ninsaude:*');
    for (const key of keys) {
      const data = JSON.parse(await redis.get(key));
      if (data.attempts < 3) {
        await this.retryRequest(key, data);
      } else {
        await this.escalateToManual(data);
        await redis.del(key);
      }
    }
  }
}
```

### Alternatives Considered
- **In-memory queue**: Rejected - lost on server restart
- **Database queue**: Rejected - no database in architecture
- **Third-party queue (RabbitMQ)**: Rejected - unnecessary complexity

---

## 5. CPF Validation Library

### Decision
Implement custom CPF validator (no external library)

### Rationale
- **Simplicity**: CPF validation is algorithmic (11 digits + checksum)
- **No Dependencies**: Reduces bundle size and security surface
- **Brazilian Standard**: Well-documented Receita Federal algorithm
- **Performance**: Faster than library overhead for simple validation

### Implementation
```javascript
// src/lib/cpfValidator.js
export function validateCPF(cpf) {
  // Remove formatting
  const cleaned = cpf.replace(/[^\d]/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // All same digit

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;

  return cleaned[9] === String(checkDigit1) && cleaned[10] === String(checkDigit2);
}

export function formatCPF(cpf) {
  const cleaned = cpf.replace(/[^\d]/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
```

### Alternatives Considered
- **cpf-cnpj-validator npm**: Rejected - adds 15KB, simple algorithm doesn't justify dependency
- **validator.js**: Rejected - large bundle (30KB), overkill for CPF only

---

## 6. LGPD Audit Logging Requirements

### Decision
Implement audit logging with SHA-256 hashed identifiers and 5-year retention

### Rationale
- **LGPD Requirements** (Lei Geral de Proteção de Dados):
  - Article 37: Log all data access for accountability
  - Article 48: Retain logs for 5 years minimum
  - Hash personal identifiers (CPF, email) for pseudonymization

- **CFM Medical Requirements**:
  - Resolução CFM 1821/2007: Medical record retention
  - Track who accessed patient data and when

### Implementation
```javascript
// api/ninsaude/middleware/lgpdAudit.js
import crypto from 'crypto';

export function lgpdAuditLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', async () => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      // Hash PII for pseudonymization
      patientCPF: req.body?.cpf ? hashPII(req.body.cpf) : null,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      ipAddress: hashPII(req.ip)
    };

    // Log to file with 5-year rotation
    await logAuditEntry(auditEntry);
  });

  next();
}

function hashPII(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
```

### Alternatives Considered
- **Plain text logging**: Rejected - violates LGPD pseudonymization requirement
- **No logging**: Rejected - violates LGPD Article 37 compliance
- **Third-party service**: Rejected - data sovereignty concerns

---

## 7. React Form State Management

### Decision
Use **React Hook Form** with Zod validation for multi-step booking flow

### Rationale
- **Performance**:
  - Uncontrolled components (reduces re-renders)
  - ~5KB gzipped vs Formik 15KB
  - Built-in validation with Zod integration

- **Multi-Step Form Support**:
  - Native wizard/stepper support
  - Preserves form state across steps
  - Async validation for API calls (CPF lookup)

- **Validation**:
  - Zod schemas for type safety (matches backend)
  - Async validators for CPF existence check
  - Brazilian phone/CEP format validation

### Implementation
```javascript
// src/components/ninsaude/AppointmentBookingForm.jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(3, 'Nome completo obrigatório'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),
  email: z.string().email('Email inválido')
});

export function PatientRegistrationForm({ onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(patientSchema)
  });

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <input {...register('cpf')} placeholder="000.000.000-00" />
      {errors.cpf && <span>{errors.cpf.message}</span>}
    </form>
  );
}
```

### Alternatives Considered
- **Formik**: Rejected - larger bundle, slower performance
- **Native useState**: Rejected - too much boilerplate for complex form
- **Redux Form**: Rejected - overkill, requires Redux setup

---

## 8. Technology Decision Summary

| Technology | Decision | Rationale |
|------------|----------|-----------|
| **OAuth2** | Redis-cached tokens with auto-refresh | Security, performance, Ninsaúde API standard |
| **WhatsApp** | Evolution API (self-hosted) | Cost-effective, LGPD compliant, Brazil-focused |
| **Retry** | Exponential backoff (1s→2s→4s, max 3) | Industry best practice, rate limit friendly |
| **Queue** | Redis persistent queue + manual fallback | Persistence, existing stack, 24h TTL |
| **CPF Validation** | Custom implementation | No dependencies, simple algorithm |
| **Audit Logging** | SHA-256 hashed logs, 5-year retention | LGPD compliance, CFM requirements |
| **Form State** | React Hook Form + Zod | Performance, validation, multi-step support |

---

## 9. Environment Variables Required

### Backend (api/.env)
```bash
# Ninsaúde API Credentials
NINSAUDE_CLIENT_ID=your_client_id_here
NINSAUDE_CLIENT_SECRET=your_client_secret_here
NINSAUDE_API_URL=https://api.ninsaude.com/v1

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_key

# Resend API (Email) - Already exists
RESEND_API_KEY=re_existing_key
```

### Frontend (VITE_ prefix required)
```bash
# Frontend doesn't need Ninsaúde credentials (backend proxy)
# All API calls go through /api/ninsaude/* endpoints
```

---

## 10. External Dependencies

### New NPM Packages Required

**Backend (api/package.json)**:
```json
{
  "dependencies": {
    "axios": "^1.6.0",        // HTTP client for Ninsaúde API
    "redis": "^4.6.0",         // Token caching and queue
    "zod": "^3.22.0"          // Schema validation (shared with frontend)
  }
}
```

**Frontend (package.json)**:
```json
{
  "dependencies": {
    "react-hook-form": "^7.49.0",        // Form state management
    "@hookform/resolvers": "^3.3.0",     // Zod integration
    "zod": "^3.22.0",                    // Schema validation
    "date-fns": "^3.0.0"                 // Date formatting (Brazilian locale)
  }
}
```

### No Breaking Changes
- All packages compatible with Node.js 22+ and React 18
- Total bundle increase: ~45KB gzipped (acceptable per spec)
- No conflicts with existing dependencies

---

**Research Complete**: All technology decisions documented with rationale and alternatives
