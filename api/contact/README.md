# Contact Form API with Outbox Pattern

This implementation provides a robust contact form API with reliable email delivery using the transactional outbox pattern.

## Features Implemented

### ✅ Zod Validation Schemas
- **Contact Form Schema**: Validates name, email, phone, message, and consent
- **Message Outbox Schema**: Validates outbox message data for reliable delivery
- **Brazilian Phone Validation**: Supports Brazilian phone number formats
- **XSS Prevention**: Sanitizes all input data to prevent security vulnerabilities

### ✅ Rate Limiting with IP Hashing
- **IP Hashing**: Uses SHA-256 to hash IP addresses for privacy compliance
- **Configurable Limits**: Default 5 requests per 15-minute window
- **Spam Detection**: Advanced honeypot and content pattern detection
- **Duplicate Prevention**: Detects and blocks duplicate submissions

### ✅ Contact API with Resend Integration
- **Transactional Storage**: Stores contact messages in Supabase database
- **Immediate + Queued Delivery**: Attempts immediate delivery, falls back to outbox
- **Professional Email Templates**: HTML and text versions with LGPD compliance
- **Error Handling**: Comprehensive error responses with user-friendly messages

### ✅ Message Outbox System
- **Reliable Delivery**: Guarantees message delivery with retry logic
- **Exponential Backoff**: Smart retry timing to avoid overwhelming services
- **Dead Letter Queue**: Failed messages after max retries for manual review
- **Status Tracking**: Complete audit trail of message delivery attempts

## API Endpoints

### Contact Form Submission
```
POST /api/contact
```

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com", 
  "phone": "(11) 99999-9999",
  "message": "Gostaria de agendar uma consulta",
  "consent": true,
  "honeypot": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  "contactId": "uuid-here",
  "messageId": "resend-message-id",
  "timestamp": "2025-09-21T22:00:00.000Z",
  "deliveryMethod": "immediate"
}
```

### Outbox Processing (Cron Job)
```
POST /api/outbox/drain
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "message": "Outbox processing completed",
  "data": {
    "processed": 5,
    "failed": 0,
    "total": 5
  },
  "processingTime": "1.2s"
}
```

### Retry Failed Messages
```
POST /api/outbox/retry
Authorization: Bearer <ADMIN_SECRET>
```

**Response:**
```json
{
  "success": true,
  "message": "Failed messages retry completed",
  "data": {
    "retriedCount": 3
  }
}
```

### Outbox Statistics
```
GET /api/outbox/drain
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 2,
    "sent": 145,
    "failed": 3,
    "byType": {
      "email": 148,
      "sms": 2
    },
    "last24h": 25
  }
}
```

## Database Schema

### Contact Messages
```sql
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  ip_hash VARCHAR(64), -- SHA-256 hashed IP
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Message Outbox
```sql
CREATE TABLE message_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('email', 'sms')),
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  template_data JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  send_after TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Environment Variables

### Required
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (bypasses RLS)
- `RESEND_API_KEY`: Resend API key for email delivery
- `DOCTOR_EMAIL`: Destination email for contact form submissions

### Optional
- `RATE_LIMIT_WINDOW`: Rate limit window in minutes (default: 15)
- `RATE_LIMIT_MAX`: Max requests per window (default: 5)
- `CRON_SECRET`: Secret for authenticating cron job requests
- `ADMIN_SECRET`: Secret for admin operations (retry, stats)

## Security Features

### LGPD Compliance
- **Explicit Consent**: Required checkbox for data processing
- **Data Minimization**: Only collects necessary information
- **IP Hashing**: Privacy-compliant rate limiting
- **Audit Trail**: Complete logging without exposing PII

### Spam Protection
- **Honeypot Fields**: Hidden fields to catch bots
- **Content Analysis**: Detects suspicious patterns and links
- **Rate Limiting**: Prevents abuse from single IPs
- **Duplicate Detection**: Blocks repeated submissions

### Input Validation
- **XSS Prevention**: Sanitizes all user input
- **SQL Injection Protection**: Uses parameterized queries
- **Phone Validation**: Brazilian phone number format validation
- **Email Validation**: RFC-compliant email validation

## Monitoring and Observability

### Event Logging
All events are logged to the `event_log` table with structured data:
- Contact form submissions
- Email delivery attempts
- Rate limiting events
- Spam detection
- System errors

### Metrics Available
- Contact form conversion rates
- Email delivery success rates
- Rate limiting effectiveness
- Spam detection accuracy
- System performance metrics

## Deployment

### Vercel Configuration
```json
{
  "functions": {
    "api/contact/index.js": { "maxDuration": 15 },
    "api/outbox/drain.js": { "maxDuration": 30 }
  },
  "crons": [
    {
      "path": "/api/outbox/drain",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Cron Job Setup
The outbox drain endpoint should be called every 5 minutes to process pending messages:
```bash
# Vercel cron job (automatic)
*/5 * * * * POST /api/outbox/drain

# Manual cron job (if needed)
*/5 * * * * curl -X POST https://your-domain.com/api/outbox/drain \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Testing

### Unit Tests
```bash
npm test -- api/contact/__tests__/outbox-simple.test.js --run
```

### Integration Tests
```bash
npm test -- api/contact/__tests__/e2e.test.js --run
```

### Manual Testing
```bash
# Test contact form submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "(11) 99999-9999", 
    "message": "Test message",
    "consent": true
  }'

# Test outbox processing
curl -X POST http://localhost:3000/api/outbox/drain \
  -H "Authorization: Bearer test-secret"
```

## Error Handling

### Client Errors (4xx)
- `400 Bad Request`: Invalid input data or validation errors
- `401 Unauthorized`: Missing or invalid authentication
- `429 Too Many Requests`: Rate limit exceeded

### Server Errors (5xx)
- `500 Internal Server Error`: Unexpected application errors
- `503 Service Unavailable`: External service failures

### Retry Logic
- **Exponential Backoff**: 1min, 2min, 4min, 8min, 16min
- **Max Retries**: 3 attempts by default
- **Dead Letter Queue**: Failed messages stored for manual review

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Automatic cleanup of old event logs
- Connection pooling for high throughput

### Caching Strategy
- Rate limit data cached in memory
- Template compilation cached
- Database query result caching

### Scalability
- Stateless serverless functions
- Horizontal scaling via Vercel
- Database connection management
- Outbox processing batching

## Maintenance

### Regular Tasks
1. **Monitor outbox statistics** for delivery issues
2. **Review failed messages** in dead letter queue  
3. **Clean up old event logs** (>30 days)
4. **Update spam detection patterns** as needed
5. **Review rate limiting effectiveness**

### Troubleshooting
- Check Vercel function logs for errors
- Monitor Supabase database performance
- Verify Resend API key validity
- Test email delivery to doctor's inbox
- Validate cron job execution

This implementation provides a production-ready contact form system with enterprise-grade reliability, security, and observability features.