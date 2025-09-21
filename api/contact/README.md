# Contact API Endpoint

This directory contains the Vercel serverless function implementation for the contact form API endpoint, integrated with Resend for reliable email delivery.

## Overview

The contact API endpoint (`/api/contact`) processes contact form submissions from the Saraiva Vision website, validates the data, applies rate limiting and spam protection, and sends professional medical emails to Dr. Philipe using the Resend service.

## Features

- **Validation**: Comprehensive form validation using Zod schemas with Brazilian phone number support
- **Rate Limiting**: IP-based rate limiting with configurable limits to prevent abuse
- **Spam Protection**: Honeypot fields and content analysis to detect spam submissions
- **Email Service**: Professional medical email templates with Resend API integration
- **LGPD Compliance**: Explicit consent validation and privacy-compliant data handling
- **Security**: Input sanitization, XSS prevention, and secure error handling
- **Monitoring**: Structured logging without PII exposure for monitoring and debugging
- **Accessibility**: WCAG 2.1 AA compliant error responses and user feedback

## API Specification

### Endpoint
```
POST /api/contact
```

### Request Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+55 11 99999-9999",
  "message": "Gostaria de agendar uma consulta oftalmológica.",
  "consent": true,
  "honeypot": ""
}
```

### Response Format

#### Success Response (200)
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  "contactId": "contact_abc123_def456",
  "messageId": "resend_message_id",
  "timestamp": "2025-09-21T19:45:34.658Z"
}
```

#### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "validation_error",
    "message": "Form validation failed",
    "validationErrors": {
      "email": "Por favor, insira um email válido",
      "consent": "Você deve aceitar os termos de privacidade"
    }
  }
}
```

#### Rate Limit Error (429)
```json
{
  "success": false,
  "error": {
    "code": "rate_limit",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 900
  }
}
```

## Environment Variables

The following environment variables must be configured in Vercel:

- `RESEND_API_KEY`: Your Resend API key for email sending
- `DOCTOR_EMAIL`: Dr. Philipe's email address (default: philipe_cruz@outlook.com)
- `RATE_LIMIT_WINDOW`: Rate limiting window in minutes (default: 15)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 5)
- `NODE_ENV`: Environment identifier (production/development)

## File Structure

```
api/contact/
├── index.js                 # Main API endpoint handler
├── emailService.js          # Resend email service integration
├── rateLimiter.js          # Rate limiting and spam detection
├── utils.js                # Utility functions and helpers
├── README.md               # This documentation
└── __tests__/              # Comprehensive test suite
    ├── index.test.js       # API endpoint unit tests
    ├── integration.test.js # End-to-end integration tests
    ├── emailService.test.js # Email service tests
    ├── rateLimiter.test.js # Rate limiting tests
    └── utils.test.js       # Utility function tests
```

## Key Components

### Main Handler (`index.js`)
- Processes POST requests to `/api/contact`
- Applies CORS headers for cross-origin requests
- Handles request parsing and validation
- Integrates rate limiting, validation, and email services
- Provides structured error responses and logging

### Email Service (`emailService.js`)
- Integrates with Resend API for reliable email delivery
- Professional medical email templates (HTML and text)
- Retry logic with exponential backoff
- Input sanitization and template data mapping
- Health check and configuration validation

### Rate Limiter (`rateLimiter.js`)
- IP-based rate limiting with hashed storage for privacy
- Honeypot spam detection
- Automatic cleanup of expired entries
- Configurable rate limits and windows
- Stateless design optimized for serverless

### Utilities (`utils.js`)
- Form data sanitization and validation helpers
- Standardized error and success response creation
- Request logging without PII exposure
- Rate limiting middleware integration

## Performance Requirements

- **Response Time**: < 3 seconds including cold starts (Requirement 4.2)
- **Email Delivery**: 99.9%+ reliability through Resend (Requirement 3.1)
- **Rate Limiting**: Configurable limits to prevent abuse (Requirement 3.3)
- **Memory Usage**: Optimized for Vercel's serverless environment

## Security Features

- **Input Sanitization**: XSS prevention and injection attack protection
- **Rate Limiting**: IP-based limits with spam detection
- **Privacy Compliance**: LGPD consent validation and data minimization
- **Secure Logging**: No PII exposure in logs or error messages
- **Error Handling**: Graceful degradation with user-friendly messages

## Testing

The API includes comprehensive test coverage:

- **Unit Tests**: Individual component testing with mocks
- **Integration Tests**: End-to-end workflow testing
- **Performance Tests**: Response time and concurrency testing
- **Security Tests**: Input validation and spam protection testing
- **Accessibility Tests**: WCAG compliance and error message testing

Run tests with:
```bash
npm test -- api/contact/__tests__ --run
```

## Deployment

The API is deployed as a Vercel serverless function. Configuration is handled through:

1. **vercel.json**: Function configuration and environment variables
2. **Environment Variables**: Secure storage of API keys and settings
3. **Automatic Deployment**: Triggered by git commits to main branch

## Monitoring and Logging

The API provides structured logging for monitoring:

- **Success Metrics**: Contact submissions, processing times, email delivery
- **Error Tracking**: Validation failures, rate limiting, service errors
- **Performance Monitoring**: Response times, cold start metrics
- **Privacy Compliance**: No PII in logs, hashed IP addresses

## LGPD Compliance

The API ensures compliance with Brazilian data protection laws:

- **Explicit Consent**: Required before processing any personal data
- **Data Minimization**: Only collects necessary information
- **Purpose Limitation**: Data used only for medical inquiry purposes
- **Security Measures**: Appropriate technical and organizational measures
- **Privacy by Design**: Built-in privacy protection throughout the system