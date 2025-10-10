# Guia Completo das Funções da API - Saraiva Vision

**Servidor**: Node.js/Express na porta 3001
**Base URL**: `http://localhost:3001` (interno) ou via Nginx proxy em produção

---

## 📋 Índice

1. [Arquitetura Geral](#arquitetura-geral)
2. [Segurança e Middleware](#segurança-e-middleware)
3. [Endpoints por Categoria](#endpoints-por-categoria)
4. [Detalhes dos Endpoints](#detalhes-dos-endpoints)

---

## 🏗️ Arquitetura Geral

### Características Principais

**Framework**: Express.js
**Porta**: 3001
**Tipo**: Híbrido (Vercel serverless + Express routes)

**Middleware Stack**:
1. **Helmet** - Headers de segurança (CSP, X-Frame-Options, etc)
2. **CORS** - Cross-Origin Resource Sharing configurado
3. **Rate Limiting** - 100 req/15min por IP (exceto health checks)
4. **Compression** - Compressão gzip/deflate
5. **Body Parser** - JSON e URL-encoded (limite 10MB)

**Padrão de Rotas**:
- Funções Vercel (`../arquivo.js`) → Adaptadas para Express
- Routers Express (`./routes/arquivo.js`) → Montados diretamente

---

## 🔒 Segurança e Middleware

### 1. Content Security Policy (CSP)
```javascript
defaultSrc: ["'self'"]
styleSrc: ["'self'", "'unsafe-inline'"]
scriptSrc: ["'self'"]
imgSrc: ["'self'", "data:", "https:"]
```

### 2. CORS Configuration
**Origens Permitidas**:
- `https://saraivavision.com.br`
- `https://www.saraivavision.com.br`
- `http://localhost:3000`
- `http://localhost:3002`
- `http://localhost:3003`

**Métodos**: GET, POST, PUT, DELETE, OPTIONS
**Headers Permitidos**: Content-Type, Authorization, X-Requested-With, X-CSRF-Token
**Credentials**: Habilitado

### 3. Rate Limiting
**Janela**: 15 minutos
**Limite**: 100 requisições por IP
**Exceções**: `/api/health`, `/api/maps-health`

---

## 📂 Endpoints por Categoria

### 🏥 **Saúde e Monitoramento**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/health` | GET | Health check básico do servidor |
| `/api/health` | GET | Health check completo da API |
| `/api/maps-health` | GET | Health check do Google Maps |
| `/api/ping` | GET | Ping simples para verificar uptime |

### 📧 **Comunicação**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/contact` | POST | Formulário de contato com email |
| `/api/webhook-appointment` | POST | Webhook para agendamentos |

### ⭐ **Google Business**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/google-reviews` | GET | Buscar reviews do Google Business |
| `/api/google-reviews-stats` | GET | Estatísticas dos reviews |

### 📊 **Analytics**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/analytics/ga` | POST | Google Analytics 4 events |
| `/api/analytics/gtm` | POST | Google Tag Manager events |
| `/api/analytics/funnel` | GET/POST | Funil de conversão |
| `/api/analytics` | POST | Analytics genérico |

### 🔐 **Segurança**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/csrf-token` | GET | Gerar token CSRF |
| `/api/csp-reports` | POST | Receber relatórios CSP |
| `/api/bug-report` | POST | Reportar bugs |
| `/api/track-404` | POST | Rastrear 404s |

### ⚙️ **Configuração**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/config` | GET | Configurações da aplicação |
| `/api/servicos` | GET | Listar serviços médicos |

---

## 📝 Detalhes dos Endpoints

### 1. `/health` - Health Check Básico
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: Sem limite

**Resposta**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-09T19:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

**Uso**: Load balancers, monitoramento básico

---

### 2. `/api/health` - Health Check Completo
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: Sem limite

**Resposta**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-09T19:00:00.000Z",
  "service": "saraiva-vision-api",
  "environment": "production",
  "version": "2.0.1",
  "services": {
    "contactForm": {
      "status": "ok",
      "configured": true,
      "errors": []
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
    "hasDoctorEmail": true,
    "rateLimitWindow": "15",
    "rateLimitMax": "5"
  }
}
```

**Uso**: Monitoramento detalhado, dashboards

---

### 3. `/api/contact` - Formulário de Contato
**Método**: POST
**Autenticação**: reCAPTCHA (opcional)
**Rate Limit**: 5 requisições/15min por IP

**Request Body**:
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(33) 99999-9999",
  "subject": "Agendamento de Consulta",
  "message": "Gostaria de agendar...",
  "recaptchaToken": "token_aqui" // Opcional
}
```

**Validações**:
- Nome: 1-100 caracteres
- Email: Formato válido
- Telefone: 10-20 caracteres numéricos/símbolos
- Assunto: 1-200 caracteres
- Mensagem: 1-1000 caracteres

**Respostas**:

**Sucesso (200)**:
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "requestId": "abc123def456"
}
```

**Rate Limit (429)**:
```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Muitas solicitações. Tente novamente em X segundos.",
  "retryAfter": 120
}
```

**Validação (400)**:
```json
{
  "success": false,
  "error": "validation_error",
  "message": "Email inválido"
}
```

**Features**:
- ✅ Sanitização de inputs
- ✅ Rate limiting por IP
- ✅ Validação de email/telefone
- ✅ Envio via Resend
- ✅ Request ID para tracking
- ✅ reCAPTCHA opcional

---

### 4. `/api/csrf-token` - CSRF Token
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Resposta**:
```json
{
  "token": "a1b2c3d4e5f6...64caracteres",
  "expiresIn": 300000
}
```

**Detalhes**:
- Token: 64 caracteres hexadecimais (32 bytes)
- Expiração: 5 minutos (300.000 ms)
- Uso único: Deletado após validação
- Session tracking: Por IP + User-Agent

**Como Usar**:
```javascript
// 1. Obter token
const response = await fetch('/api/csrf-token');
const { token } = await response.json();

// 2. Enviar em requisição protegida
await fetch('/api/protected-route', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  body: JSON.stringify(data)
});
```

**Middleware de Validação**:
```javascript
import { validateCSRF } from './routes/csrf.js';

// Proteger rota
router.post('/protected', validateCSRF, (req, res) => {
  // Código protegido
});
```

---

### 5. `/api/analytics/ga` - Google Analytics
**Método**: POST
**Autenticação**: Não requerida
**Rate Limit**: 60 req/min

**Request Body** (Zod validated):
```json
{
  "event_name": "button_click",
  "event_params": {
    "button_id": "cta_agendar",
    "page": "/servicos"
  },
  "user_id": "user123",
  "session_id": "session456",
  "timestamp": "2025-10-09T19:00:00.000Z",
  "page_location": "https://saraivavision.com.br/servicos",
  "page_title": "Serviços - Saraiva Vision"
}
```

**Validações** (Zod schema):
- `event_name`: String 1-100 caracteres (opcional)
- `event_params`: Objeto (opcional)
- `user_id`: String 1-100 caracteres (opcional)
- `session_id`: String 1-100 caracteres (opcional)
- `timestamp`: ISO 8601 datetime (opcional)
- `page_location`: URL válida (opcional)
- `page_title`: String 1-200 caracteres (opcional)

**Resposta Sucesso**:
- Status: **204 No Content** (padrão analytics)
- Body: Vazio

**Resposta Erro (400)**:
```json
{
  "error": "Invalid request body",
  "details": [
    {
      "field": "page_location",
      "message": "Invalid url"
    }
  ]
}
```

**Logging**:
```
[Analytics] GA event received: button_click from IP: 192.168.1.1
```

---

### 6. `/api/analytics/gtm` - Google Tag Manager
**Método**: POST
**Autenticação**: Não requerida
**Rate Limit**: 60 req/min

**Request Body**:
```json
{
  "event": "purchase",
  "ecommerce": {
    "transaction_id": "T12345",
    "value": 150.00,
    "currency": "BRL",
    "items": [
      {
        "item_id": "consulta_01",
        "item_name": "Consulta Oftalmológica",
        "price": 150.00
      }
    ]
  },
  "page": {
    "location": "https://saraivavision.com.br/checkout",
    "title": "Checkout",
    "path": "/checkout"
  },
  "user_properties": {
    "user_type": "new_patient"
  }
}
```

**Validações** (Zod schema):
- `event`: String 1-100 caracteres (obrigatório)
- `ecommerce`: Any (opcional)
- `page.location`: URL válida (opcional)
- `page.title`: String 1-200 caracteres (opcional)
- `page.path`: String 1-500 caracteres (opcional)
- `items`: Array (opcional)
- `value`: Number (opcional)
- `currency`: String 3 caracteres (opcional, ex: "BRL")

**Resposta**: 204 No Content (sucesso) ou 400/500 (erro)

---

### 7. `/api/google-reviews` - Google Reviews
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Query Parameters**:
```
?limit=10&sort=recent&min_rating=4
```

**Resposta**:
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "author_name": "Maria Silva",
        "rating": 5,
        "text": "Excelente atendimento!",
        "time": "2025-10-01T10:00:00.000Z",
        "profile_photo_url": "https://...",
        "relative_time_description": "há 8 dias"
      }
    ],
    "total": 136,
    "average_rating": 4.9,
    "rating_distribution": {
      "5": 120,
      "4": 10,
      "3": 4,
      "2": 1,
      "1": 1
    }
  },
  "cached": true,
  "cache_age": 1800
}
```

**Features**:
- ✅ Cache Redis (30 minutos)
- ✅ Fallback para Google Places API
- ✅ Sanitização de texto
- ✅ Ordenação por data/rating
- ✅ Filtro por rating mínimo

---

### 8. `/api/google-reviews-stats` - Review Stats
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Resposta**:
```json
{
  "success": true,
  "stats": {
    "total_reviews": 136,
    "average_rating": 4.9,
    "rating_distribution": {
      "5_star": 120,
      "4_star": 10,
      "3_star": 4,
      "2_star": 1,
      "1_star": 1
    },
    "rating_percentage": {
      "5_star": 88.2,
      "4_star": 7.4,
      "3_star": 2.9,
      "2_star": 0.7,
      "1_star": 0.7
    },
    "growth": {
      "last_30_days": 12,
      "last_90_days": 35
    },
    "sentiment": {
      "positive": 95.6,
      "neutral": 3.0,
      "negative": 1.4
    }
  },
  "updated_at": "2025-10-09T19:00:00.000Z"
}
```

---

### 9. `/api/config` - App Configuration
**Método**: GET
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Resposta**:
```json
{
  "clinic": {
    "name": "Saraiva Vision",
    "address": "Rua Exemplo, 123, Caratinga, MG",
    "phone": "(33) 99860-1427",
    "email": "contato@saraivavision.com.br",
    "hours": {
      "monday": "08:00-18:00",
      "tuesday": "08:00-18:00",
      "wednesday": "08:00-18:00",
      "thursday": "08:00-18:00",
      "friday": "08:00-18:00",
      "saturday": "08:00-12:00",
      "sunday": "Fechado"
    }
  },
  "features": {
    "booking": true,
    "telemedicine": false,
    "insurance": ["Unimed", "Bradesco Saúde"]
  },
  "social": {
    "facebook": "https://facebook.com/saraivavision",
    "instagram": "https://instagram.com/saraivavision"
  }
}
```

---

### 10. `/api/webhook-appointment` - Webhook Agendamentos
**Método**: POST
**Autenticação**: Webhook signature (HMAC)
**Rate Limit**: 100 req/15min

**Headers Requeridos**:
```
X-Webhook-Signature: sha256=abc123...
Content-Type: application/json
```

**Request Body**:
```json
{
  "event": "appointment.created",
  "timestamp": "2025-10-09T19:00:00.000Z",
  "data": {
    "appointment_id": "apt_123456",
    "patient": {
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "(33) 99999-9999"
    },
    "datetime": "2025-10-15T14:00:00.000Z",
    "service": "Consulta Oftalmológica",
    "status": "confirmed"
  }
}
```

**Validações**:
- Signature HMAC-SHA256
- Tamanho máximo do payload: 1MB
- Timestamp não pode ser > 5 minutos no passado

**Resposta Sucesso (200)**:
```json
{
  "success": true,
  "received": true,
  "appointment_id": "apt_123456"
}
```

**Features**:
- ✅ HMAC signature validation
- ✅ Replay attack protection
- ✅ Payload size limit (1MB)
- ✅ Structured logging
- ✅ Rate limiting por IP

---

### 11. `/api/csp-reports` - CSP Violation Reports
**Método**: POST
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Request Body** (enviado pelo browser):
```json
{
  "csp-report": {
    "document-uri": "https://saraivavision.com.br/",
    "violated-directive": "script-src 'self'",
    "blocked-uri": "https://evil.com/script.js",
    "source-file": "https://saraivavision.com.br/",
    "line-number": 42,
    "column-number": 15
  }
}
```

**Resposta**: 204 No Content

**Logging**:
```
[CSP] Violation detected:
  Directive: script-src 'self'
  Blocked: https://evil.com/script.js
  Page: https://saraivavision.com.br/
```

---

### 12. `/api/bug-report` - Bug Reporting
**Método**: POST
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Request Body**:
```json
{
  "type": "javascript_error",
  "message": "Cannot read property 'x' of undefined",
  "stack": "Error: ...\n  at Component (app.js:123)",
  "url": "https://saraivavision.com.br/servicos",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-10-09T19:00:00.000Z",
  "metadata": {
    "component": "ServiceCard",
    "action": "click_cta"
  }
}
```

**Resposta**:
```json
{
  "success": true,
  "reportId": "bug_abc123def456",
  "message": "Bug report received"
}
```

---

### 13. `/api/track-404` - 404 Tracking
**Método**: POST
**Autenticação**: Não requerida
**Rate Limit**: 100 req/15min

**Request Body**:
```json
{
  "path": "/pagina-inexistente",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2025-10-09T19:00:00.000Z"
}
```

**Resposta**: 204 No Content

**Uso**: Identificar links quebrados, melhorar SEO

---

## 🔧 Comandos Úteis

### Testar Endpoints

```bash
# Health check
curl http://localhost:3001/health
curl http://localhost:3001/api/health

# CSRF token
curl http://localhost:3001/api/csrf-token

# Analytics (após implementação)
curl -X POST http://localhost:3001/api/analytics/ga \
  -H "Content-Type: application/json" \
  -d '{"event_name":"test","page_location":"https://saraivavision.com.br"}'

# Google Reviews
curl http://localhost:3001/api/google-reviews?limit=5

# Config
curl http://localhost:3001/api/config
```

### Monitoramento

```bash
# Ver logs do servidor
tail -f /var/log/saraiva-api.log

# Processos rodando
ps aux | grep "[n]ode.*server"

# Porta em uso
sudo lsof -i :3001

# Status do servidor
curl -s http://localhost:3001/api/health | jq .
```

---

## 📊 Rate Limits Resumo

| Endpoint | Janela | Limite | Ação |
|----------|--------|--------|------|
| Global `/api/*` | 15 min | 100 req/IP | 429 Too Many Requests |
| `/api/contact` | 15 min | 5 req/IP | 429 com retryAfter |
| `/api/analytics/*` | 1 min | 60 req/IP | 429 com retryAfter |
| `/api/health` | - | Sem limite | - |
| `/api/maps-health` | - | Sem limite | - |

---

## 🔐 Segurança Implementada

### Headers (via Helmet)
- ✅ Content-Security-Policy
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Strict-Transport-Security (HSTS)

### Validações
- ✅ Zod schemas para analytics
- ✅ Email/phone regex validation
- ✅ Input sanitization (trim, max length)
- ✅ HMAC signature para webhooks
- ✅ reCAPTCHA para formulários

### Proteções
- ✅ Rate limiting por IP
- ✅ CORS configurado
- ✅ CSRF tokens (implementado)
- ✅ Request size limits (10MB)
- ✅ Error handling middleware

---

**Última Atualização**: 2025-10-09
**Versão da API**: 2.0.1
**Documentação Completa**: `/home/saraiva-vision-site/docs/`
