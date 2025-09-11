# Quickstart Guide: Resend Email Integration Testing

## Overview
This guide walks through testing the complete contact form email integration flow, from frontend submission to email delivery confirmation.

## Prerequisites

### Environment Setup
```bash
# 1. Install dependencies
npm install resend zod express-rate-limit winston

# 2. Set environment variables
export RESEND_API_KEY="re_your_resend_api_key_here"
export CONTACT_EMAIL="philipe_cruz@outlook.com"
export NODE_ENV="development"

# 3. Verify Resend API access
curl -X GET "https://api.resend.com/domains" \
  -H "Authorization: Bearer $RESEND_API_KEY"
```

### Required Files
- `api/lib/email-service.js` - Resend integration library
- `api/lib/validator.js` - Form validation library  
- `api/contact.js` - Contact form API endpoint
- `src/components/Contact.jsx` - Updated contact form component

## Test Scenarios

### Scenario 1: Happy Path - Valid Form Submission

**Purpose**: Verify end-to-end email delivery with valid patient data

**Steps**:
1. **Submit valid form data**:
   ```bash
   curl -X POST http://localhost:3001/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "João Silva",
       "email": "joao.silva@email.com", 
       "phone": "+55 11 99999-9999",
       "message": "Gostaria de agendar uma consulta para avaliar minha visão.",
       "consent": true
     }'
   ```

2. **Expected API Response**:
   ```json
   {
     "success": true,
     "message": "Sua mensagem foi enviada com sucesso! Dr. Philipe entrará em contato em breve.",
     "submissionId": "550e8400-e29b-41d4-a716-446655440000",
     "estimatedDelivery": "2025-09-11T14:30:00Z"
   }
   ```

3. **Verify email delivery**:
   - Check Dr. Philipe's inbox (philipe_cruz@outlook.com)
   - Email subject: "New Patient Inquiry - João Silva - SaraivaVision"
   - Email contains all patient information in professional format
   - Email includes clear response instructions

**Success Criteria**:
- ✅ API returns 200 status with success response
- ✅ Email delivered to Dr. Philipe within 30 seconds
- ✅ Email content matches professional template
- ✅ Patient information is properly formatted and escaped

### Scenario 2: Form Validation - Invalid Input

**Purpose**: Test client and server-side validation handling

**Steps**:
1. **Submit invalid email format**:
   ```bash
   curl -X POST http://localhost:3001/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "invalid-email-format",
       "message": "Short",
       "consent": false
     }'
   ```

2. **Expected API Response**:
   ```json
   {
     "success": false,
     "message": "Por favor, corrija os erros abaixo",
     "error": "validation_failed",
     "code": "VALIDATION_ERROR",
     "fieldErrors": {
       "email": ["Formato de email inválido"],
       "message": ["A mensagem deve ter pelo menos 10 caracteres"],
       "consent": ["O consentimento de privacidade é obrigatório"]
     }
   }
   ```

**Success Criteria**:
- ✅ API returns 400 status
- ✅ No email is sent
- ✅ Field-specific error messages in Portuguese
- ✅ All validation rules properly enforced

### Scenario 3: Rate Limiting - Excessive Submissions

**Purpose**: Verify rate limiting prevents spam and abuse

**Steps**:
1. **Submit 6 requests rapidly from same IP**:
   ```bash
   for i in {1..6}; do
     curl -X POST http://localhost:3001/api/contact \
       -H "Content-Type: application/json" \
       -d '{"name":"Test","email":"test@example.com","message":"Rate limit test","consent":true}'
     echo "Request $i completed"
   done
   ```

2. **Expected Behavior**:
   - First 5 requests: Success (200)
   - 6th request: Rate limited (429)

3. **Expected Rate Limit Response**:
   ```json
   {
     "success": false,
     "message": "Muitas tentativas. Tente novamente em 1 hora.",
     "error": "rate_limit_exceeded", 
     "code": "RATE_LIMIT_ERROR",
     "retryAfter": 3600
   }
   ```

**Success Criteria**:
- ✅ First 5 requests succeed
- ✅ 6th request returns 429 status
- ✅ Rate limit window properly enforced
- ✅ Only 5 emails sent, not 6

### Scenario 4: Spam Detection - Honeypot Field

**Purpose**: Test spam bot detection using honeypot field

**Steps**:
1. **Submit form with honeypot field filled**:
   ```bash
   curl -X POST http://localhost:3001/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Bot User",
       "email": "bot@example.com",
       "message": "This is a spam message",
       "consent": true,
       "website": "http://spam-site.com"
     }'
   ```

2. **Expected API Response**:
   ```json
   {
     "success": false,
     "message": "Envio suspeito detectado. Entre em contato diretamente se isso for um erro.",
     "error": "spam_detected",
     "code": "SPAM_ERROR"
   }
   ```

**Success Criteria**:
- ✅ API returns 422 status
- ✅ No email is sent
- ✅ Spam detection message displayed
- ✅ IP may be temporarily blocked

### Scenario 5: Service Failure - Email API Down

**Purpose**: Test graceful degradation when Resend API fails

**Steps**:
1. **Temporarily disable internet or use invalid API key**:
   ```bash
   export RESEND_API_KEY="invalid_key"
   
   curl -X POST http://localhost:3001/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "message": "Testing service failure",
       "consent": true
     }'
   ```

2. **Expected API Response**:
   ```json
   {
     "success": false,
     "message": "Erro interno do servidor. Tente novamente em alguns minutos.", 
     "error": "email_service_error",
     "code": "EMAIL_ERROR"
   }
   ```

**Success Criteria**:
- ✅ API returns 500 status
- ✅ User-friendly error message (no technical details exposed)
- ✅ Error is logged for debugging (without PII)
- ✅ System remains stable despite failure

### Scenario 6: Frontend Integration - Complete User Journey

**Purpose**: Test complete user experience from form to confirmation

**Steps**:
1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to contact form**:
   - Open http://localhost:5173
   - Scroll to contact section
   - Fill out form with valid data

3. **Submit form and observe**:
   - Form shows loading state during submission
   - Success message appears after submission
   - Form resets to initial state
   - No console errors logged

**Success Criteria**:
- ✅ Form submission shows loading state
- ✅ Success message displays clearly
- ✅ Form resets after successful submission
- ✅ Error handling works for invalid inputs
- ✅ LGPD consent checkbox is required

## Performance Testing

### Response Time Validation
```bash
# Test API response time (should be <3 seconds)
time curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Performance Test","email":"test@example.com","message":"Testing response time","consent":true}'

# Expected: real time < 3s
```

### Load Testing
```bash
# Install hey for load testing
go install github.com/rakyll/hey@latest

# Test concurrent submissions (within rate limits)
hey -n 50 -c 5 -m POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Load Test","email":"load@example.com","message":"Load testing the API","consent":true}' \
  http://localhost:3001/api/contact
```

## Security Testing

### Input Sanitization
```bash
# Test XSS prevention
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"xss\")</script>John Doe",
    "email": "test@example.com",
    "message": "<img src=x onerror=alert(1)>Valid message here",
    "consent": true
  }'

# Verify: Script tags are sanitized in email content
```

### SQL Injection Prevention
```bash
# Test SQL injection attempts
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert\"; DROP TABLE users; --",
    "email": "test@example.com",
    "message": "Testing SQL injection prevention",
    "consent": true
  }'

# Verify: Input is properly sanitized, no SQL errors
```

## Monitoring & Debugging

### Log Analysis
```bash
# View application logs
tail -f logs/contact-api.log

# Look for patterns:
# - Successful submissions: INFO level
# - Validation errors: WARN level  
# - Service failures: ERROR level
# - No PII in logs: Names/emails should be redacted
```

### Health Check
```bash
# Verify service health
curl http://localhost:3001/api/contact/health

# Expected response:
{
  "status": "healthy",
  "uptime": 86400,
  "emailService": {
    "available": true,
    "lastCheck": "2025-09-11T14:00:00Z",
    "deliveryRate": 0.999
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: Email not delivered
- Check RESEND_API_KEY is valid
- Verify sender domain is verified in Resend
- Check spam folder in recipient email
- Review Resend dashboard for delivery status

**Issue**: Rate limiting too aggressive
- Adjust RATE_LIMIT_MAX in environment
- Clear rate limit cache: restart server
- Check if multiple requests from same IP

**Issue**: Form validation not working
- Verify Zod schema matches frontend validation
- Check console for JavaScript errors
- Ensure form fields match API contract

**Issue**: LGPD consent not enforced
- Verify consent checkbox is required
- Check validation schema includes consent: true
- Ensure privacy notice is displayed

## Success Validation

### Complete System Check
Run this comprehensive test to validate the entire integration:

```bash
#!/bin/bash
echo "🧪 Running Resend Integration Tests..."

# 1. Health check
echo "1. Testing service health..."
curl -s http://localhost:3001/api/contact/health | jq .

# 2. Valid submission
echo "2. Testing valid submission..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"test@example.com","message":"Testing complete integration","consent":true}')
echo $RESPONSE | jq .

# 3. Validation errors
echo "3. Testing validation..."
curl -s -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","message":"","consent":false}' | jq .

# 4. Rate limiting
echo "4. Testing rate limits..."
for i in {1..6}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Rate Test","email":"rate@example.com","message":"Rate limit test","consent":true}')
  echo "Request $i: HTTP $STATUS"
done

echo "✅ Integration tests complete!"
```

This quickstart guide ensures the complete contact form integration is working correctly with proper validation, security, and email delivery.