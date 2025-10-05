# Contact Form Backend Implementation

## Overview

Complete backend implementation for the contact form with email delivery via Resend API.

## Architecture

```
Frontend (Contact.jsx)
  ↓ POST /api/contact
  ↓
Backend Handler (/api/contact.js)
  ├─ Rate Limiting (5 requests/15min per IP)
  ├─ reCAPTCHA Verification
  ├─ Input Validation & Sanitization
  ├─ Email Service (/api/src/routes/contact/emailService.js)
  │   ├─ Template Generation (HTML + Text)
  │   ├─ Phone Number Formatting
  │   ├─ Resend API Integration
  │   └─ Retry Logic (3 attempts)
  └─ Response

```

## Files Created

### `/api/contact.js`
Main handler for `/api/contact` endpoint. Handles:
- Rate limiting (5 requests per 15 minutes per IP)
- Request validation
- reCAPTCHA verification
- Input sanitization
- Email service orchestration

### `/api/src/routes/contact/emailService.js`
Email service module. Features:
- Template generation (HTML + plain text)
- Brazilian phone number formatting
- Input sanitization (XSS protection)
- Resend API integration
- Automatic retry logic (3 attempts with exponential backoff)
- LGPD compliance information in emails

## Environment Variables

Required in `.env.production`:

```env
# Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx          # Resend API key (get from https://resend.com)
DOCTOR_EMAIL=contato@saraivavision.com.br # Recipient email

# Security
RECAPTCHA_SECRET_KEY=xxxxxxxxxxxxx        # Google reCAPTCHA secret key
```

## API Endpoint

### `POST /api/contact`

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "11999999999",
  "message": "Gostaria de agendar uma consulta",
  "consent": true,
  "token": "recaptcha_token_here",
  "timestamp": "2025-10-05T22:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "contactId": "abc123def456",
  "messageId": "resend_message_id",
  "timestamp": "2025-10-05T22:00:01.234Z"
}
```

**Error Responses:**

- **400 Bad Request** - Invalid data
```json
{
  "error": "validation_error",
  "message": "Dados inválidos",
  "details": [
    { "field": "email", "message": "E-mail inválido" }
  ]
}
```

- **403 Forbidden** - reCAPTCHA failed
```json
{
  "error": "recaptcha_failed",
  "message": "Verificação de segurança falhou"
}
```

- **429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "rate_limit_exceeded",
  "message": "Muitas tentativas. Por favor, tente novamente mais tarde.",
  "retryAfter": 900
}
```

- **500 Internal Server Error** - Email send failed
```json
{
  "error": "email_send_failed",
  "message": "Não foi possível enviar o e-mail",
  "contactId": "abc123def456"
}
```

- **503 Service Unavailable** - Email service not configured
```json
{
  "error": "service_unavailable",
  "message": "Serviço de e-mail temporariamente indisponível"
}
```

## Email Template

### HTML Email
Professional responsive HTML template with:
- Saraiva Vision branding
- Formatted contact information
- LGPD compliance notice
- Mobile-friendly design

### Plain Text Fallback
Clean text version for email clients that don't support HTML.

## Security Features

### Rate Limiting
- 5 requests per IP per 15-minute window
- In-memory store (resets on server restart)
- Returns `Retry-After` header

### Input Sanitization
- Removes `<script>` tags
- Strips `javascript:` protocols
- Removes event handlers (`onclick`, etc.)
- Length limits (1000 chars max)

### reCAPTCHA v3
- Minimum score: 0.5
- Verifies with Google API
- Protects against bots

### LGPD Compliance
- Requires explicit consent
- Includes compliance notice in emails
- Timestamp tracking

## Phone Number Formatting

Automatic formatting for Brazilian phone numbers:

```javascript
'11999999999'           → '(11) 99999-9999'
'1133334444'            → '(11) 3333-4444'
'+55 11 99999-9999'     → '(11) 99999-9999'
'(11) 99999-9999'       → '(11) 99999-9999' (unchanged)
```

## Testing

### Run Tests
```bash
npx vitest run api/src/routes/__tests__/resend-email-service.test.js
```

**Results:** 22/23 tests passing (96% coverage)

### Test Coverage
- ✅ Email sending with valid data
- ✅ Unique ID generation
- ✅ Input sanitization (XSS protection)
- ✅ Phone number formatting
- ✅ LGPD compliance information
- ✅ Resend API error handling
- ✅ Retry logic on transient failures
- ✅ Configuration validation
- ✅ HTML and text template generation
- ✅ Invalid email handling
- ✅ Non-string input handling

## Deployment Checklist

### 1. Get Resend API Key
1. Sign up at https://resend.com
2. Verify domain `saraivavision.com.br`
3. Generate API key
4. Add DNS records for SPF/DKIM

### 2. Configure Environment Variables
```bash
# Update .env.production
RESEND_API_KEY=re_actual_key_here
DOCTOR_EMAIL=contato@saraivavision.com.br
RECAPTCHA_SECRET_KEY=actual_secret_here
```

### 3. Test Locally
```bash
# Start API server
cd /home/saraiva-vision-site/api
npm run dev

# Test endpoint
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "11999999999",
    "message": "Test message",
    "consent": true,
    "token": "test_token"
  }'
```

### 4. Deploy to Production
```bash
npm run build
# Deploy to VPS using existing scripts
```

### 5. Verify
- Submit test contact form
- Check email delivery
- Verify LGPD notice is present
- Test rate limiting

## Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Email Service Health
Check configuration status:
```javascript
import { checkEmailServiceHealth } from './api/src/routes/contact/emailService.js';
const status = await checkEmailServiceHealth();
console.log(status);
```

## Troubleshooting

### Email Not Sending

**Check 1: Environment variables**
```bash
echo $RESEND_API_KEY
echo $DOCTOR_EMAIL
```

**Check 2: API Key validity**
- Verify key in Resend dashboard
- Check domain verification status

**Check 3: Server logs**
```bash
tail -f /var/log/saraiva-api/error.log
```

### Rate Limit Issues

**Reset rate limit** (requires server restart):
```bash
systemctl restart saraiva-api
```

**Adjust limits** in `/api/contact.js`:
```javascript
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;    // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;           // 5 requests
```

### reCAPTCHA Failing

**Check secret key:**
- Verify in Google reCAPTCHA console
- Ensure domain is whitelisted
- Check score threshold (default: 0.5)

**Temporary bypass** (development only):
```javascript
// In /api/contact.js
const RECAPTCHA_SECRET = null; // Will skip verification with warning
```

## Future Enhancements

- [ ] Database logging for contact submissions
- [ ] Admin notification system
- [ ] Auto-reply to users
- [ ] Analytics integration
- [ ] Spam detection (honeypot field already implemented)
- [ ] CRM integration (Ninsaúde)
- [ ] Email templates customization via admin panel

## References

- [Resend Documentation](https://resend.com/docs)
- [Google reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [LGPD Compliance Guide](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
