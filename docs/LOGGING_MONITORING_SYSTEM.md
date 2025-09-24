# Comprehensive Logging and Monitoring System

## Overview

This document describes the comprehensive logging and monitoring system implemented for Saraiva Vision. The system provides structured logging, performance monitoring, error tracking, and alerting capabilities with PII sanitization and LGPD compliance.

## Components

### 1. Structured Logger (`src/lib/logger.js`)

#### Features
- **Structured Logging**: JSON-formatted logs with consistent schema
- **PII Sanitization**: Automatic removal of sensitive data (emails, phones, CPF, etc.)
- **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Centralized Storage**: Logs stored in Supabase `event_log` table
- **Request Tracing**: Unique request IDs for correlation
- **Performance Logging**: Built-in performance metrics tracking

#### Usage
```javascript
import { createLogger } from '../lib/logger.js';

const logger = createLogger('service-name');

// Basic logging
await logger.info('User action completed', { userId: 'user_123' });
await logger.error('Database connection failed', { error: error.message });

// Performance logging
await logger.logPerformance('database_query', 150, { table: 'users' });

// API call logging
await logger.logApiCall('GET', '/api/users', 200, 250);

// Child logger with same request ID
const childLogger = logger.child('child-service');
```

#### PII Sanitization
The logger automatically sanitizes:
- Email addresses → `[EMAIL]`
- Brazilian phone numbers → `[PHONE]`
- CPF numbers → `[CPF]`
- Credit card numbers → `[CARD]`
- IP addresses → `192.168.xxx.xxx` (partial masking)

### 2. Performance Monitor (`src/lib/performanceMonitor.js`)

#### Features
- **API Performance Tracking**: Response times, error rates
- **Database Operation Monitoring**: Query performance and failures
- **External Service Monitoring**: Third-party API call tracking
- **Statistical Analysis**: P95, P99 percentiles, averages
- **Threshold Alerting**: Automatic alerts for performance degradation

#### Usage
```javascript
import { performanceMonitor, trackDbOperation, trackExternalCall } from '../lib/performanceMonitor.js';

// Manual recording
performanceMonitor.recordApiCall('/api/users', 'GET', 200, 150);
performanceMonitor.recordDbOperation('SELECT', 'users', 50, true);

// Decorator usage
class UserService {
  @trackDbOperation('SELECT', 'users')
  async getUsers() {
    // Database operation
  }

  @trackExternalCall('resend', 'send_email')
  async sendEmail() {
    // External API call
  }
}

// Get metrics
const metrics = performanceMonitor.getPerformanceSummary();
const report = await performanceMonitor.generateReport();
```

#### Middleware Integration
```javascript
import { performanceTrackingMiddleware } from '../lib/performanceMonitor.js';

// Express/Vercel middleware
app.use(performanceTrackingMiddleware);
```

### 3. Alerting System (`src/lib/alertingSystem.js`)

#### Features
- **Email/SMS Delivery Tracking**: Monitor message delivery success rates
- **Failure Rate Monitoring**: Automatic alerts for high failure rates
- **Alert Deduplication**: Prevent spam with cooldown periods
- **Multi-channel Notifications**: Email and SMS alerts
- **Privacy-compliant Logging**: Hash sensitive data for tracking

#### Usage
```javascript
import { alertingSystem, ALERT_TYPES, ALERT_SEVERITY } from '../lib/alertingSystem.js';

// Track email delivery
await alertingSystem.trackEmailDelivery(
  'msg_123',
  'user@example.com',
  true, // success
  null, // error (if failed)
  { contact_id: 'contact_123' }
);

// Track SMS delivery
await alertingSystem.trackSmsDelivery(
  'sms_123',
  '+5511999999999',
  false, // failed
  new Error('API timeout'),
  { appointment_id: 'apt_123' }
);

// Create custom alert
await alertingSystem.createAlert(
  ALERT_TYPES.HIGH_ERROR_RATE,
  ALERT_SEVERITY.HIGH,
  'API error rate exceeded 10%',
  { error_rate: 15, endpoint: '/api/appointments' }
);

// Get statistics
const deliveryStats = await alertingSystem.getDeliveryStats(24); // last 24 hours
const recentAlerts = await alertingSystem.getRecentAlerts(24);
```

### 4. Monitoring APIs

#### Health Check API (`/api/monitoring/health`)
Basic health check endpoint for monitoring tools.

```bash
# Basic health check
curl https://saraivavision.com.br/api/monitoring/health

# Detailed health check
curl https://saraivavision.com.br/api/monitoring/health?detailed=true
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "uptime": 3600,
    "checks": {
      "api": { "status": "healthy", "response_time_ms": 5 },
      "database": { "status": "healthy", "response_time_ms": 25 },
      "external_services": {
        "resend": { "status": "healthy", "response_time_ms": 150 },
        "zenvia": { "status": "healthy", "response_time_ms": 200 }
      },
      "message_queue": { "status": "healthy", "pending_messages": 5 }
    }
  }
}
```

#### Metrics API (`/api/monitoring/metrics`)
Comprehensive system metrics (requires authentication).

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://saraivavision.com.br/api/monitoring/metrics?include=all&hours=24
```

Response includes:
- Performance metrics (response times, error rates)
- Delivery statistics (email/SMS success rates)
- Recent alerts and their severity
- Database health and connection status
- Message queue status and backlog
- Overall system health summary

## Database Schema

### Event Log Table
```sql
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  severity VARCHAR(20) DEFAULT 'info',
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Message Outbox Table
```sql
CREATE TABLE message_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type VARCHAR(20) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  template_data JSONB,
  status VARCHAR(20) DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  send_after TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Configuration

### Environment Variables
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Monitoring
MONITORING_API_TOKEN=secure_token_for_metrics_api
ADMIN_EMAIL=admin@saraivavision.com.br
ADMIN_PHONE=+5511999999999

# External Services
RESEND_API_KEY=re_your_api_key
ZENVIA_API_TOKEN=your_zenvia_token
```

### Alert Thresholds
Default thresholds can be configured in `AlertingSystem`:
```javascript
alertThresholds = {
  email_failure_rate: 5,     // 5% failure rate
  sms_failure_rate: 5,       // 5% failure rate
  error_rate: 10,            // 10% general error rate
  response_time_p95: 5000,   // 5 seconds P95
  consecutive_failures: 3     // 3 consecutive failures
}
```

## Integration Examples

### Contact API Integration
```javascript
import { createLogger } from '../../src/lib/logger.js';
import { alertingSystem } from '../../src/lib/alertingSystem.js';

export default async function handler(req, res) {
  const logger = createLogger('contact-api', req.headers['x-request-id']);
  
  try {
    await logger.info('Contact form submission started');
    
    // Process contact form...
    const result = await sendEmail(contactData);
    
    // Track email delivery
    await alertingSystem.trackEmailDelivery(
      messageId,
      recipient,
      result.success,
      result.success ? null : result.error
    );
    
    await logger.info('Contact form processed successfully');
    
  } catch (error) {
    await logger.error('Contact form processing failed', {
      error_message: error.message
    });
    throw error;
  }
}
```

### Outbox Service Integration
```javascript
import { alertingSystem } from '../../src/lib/alertingSystem.js';

async function processMessage(message) {
  const logger = createLogger('outbox-processor');
  
  try {
    const result = await deliverMessage(message);
    
    // Track delivery based on message type
    if (message.message_type === 'email') {
      await alertingSystem.trackEmailDelivery(
        message.id,
        message.recipient,
        result.success,
        result.success ? null : result.error
      );
    } else if (message.message_type === 'sms') {
      await alertingSystem.trackSmsDelivery(
        message.id,
        message.recipient,
        result.success,
        result.success ? null : result.error
      );
    }
    
  } catch (error) {
    await logger.error('Message delivery failed', {
      message_id: message.id,
      error_message: error.message
    });
  }
}
```

## Monitoring and Alerting

### Alert Types
- `EMAIL_DELIVERY_FAILURE`: High email failure rate
- `SMS_DELIVERY_FAILURE`: High SMS failure rate
- `HIGH_ERROR_RATE`: API error rate exceeded threshold
- `SLOW_RESPONSE`: Response time exceeded threshold
- `SERVICE_UNAVAILABLE`: External service unavailable
- `QUOTA_EXCEEDED`: API quota exceeded
- `SECURITY_INCIDENT`: Security-related events

### Alert Severity Levels
- `LOW`: Informational alerts
- `MEDIUM`: Warning conditions
- `HIGH`: Error conditions requiring attention
- `CRITICAL`: Critical errors requiring immediate action

### Alert Delivery
- **Email**: All alerts sent to admin email
- **SMS**: Critical alerts also sent via SMS
- **Deduplication**: 5-minute cooldown to prevent spam
- **Escalation**: Critical alerts bypass normal throttling

## Performance Considerations

### Log Volume Management
- Debug logs only in development
- Automatic log rotation (handled by Supabase)
- Efficient indexing on `created_at` and `severity`

### Performance Impact
- Asynchronous logging to prevent blocking
- Fallback to console logging if database unavailable
- Minimal overhead for production operations

### Scalability
- Horizontal scaling through Supabase
- Efficient querying with proper indexes
- Configurable retention policies

## Security and Privacy

### LGPD Compliance
- Automatic PII sanitization in logs
- Hashed identifiers for tracking
- No sensitive data in log messages
- Configurable data retention

### Access Control
- Monitoring API requires authentication
- Row Level Security (RLS) policies
- Admin-only access to sensitive metrics

### Data Protection
- Encrypted data at rest (Supabase)
- Encrypted data in transit (HTTPS)
- Minimal data collection principle

## Testing

### Test Coverage
- Unit tests for core logging functions
- Integration tests for API endpoints
- Performance tests for high-load scenarios
- Security tests for PII sanitization

### Running Tests
```bash
# Run all logging tests
npm test -- --run src/__tests__/logging-basic.test.js

# Run monitoring API tests
npm test -- --run api/__tests__/monitoring.test.js
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check Supabase credentials
   - Verify network connectivity
   - Check RLS policies

2. **High Alert Volume**
   - Review alert thresholds
   - Check for system issues
   - Verify deduplication settings

3. **Missing Logs**
   - Check environment variables
   - Verify database permissions
   - Check fallback console logs

### Debug Mode
Enable debug logging in development:
```bash
NODE_ENV=development
```

### Log Analysis
Query logs directly in Supabase:
```sql
SELECT * FROM event_log 
WHERE severity IN ('error', 'critical')
AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Future Enhancements

### Planned Features
- Real-time log streaming
- Advanced analytics dashboard
- Machine learning anomaly detection
- Custom alert rules engine
- Integration with external monitoring tools

### Metrics to Add
- Business metrics (conversion rates, user engagement)
- Infrastructure metrics (CPU, memory usage)
- Custom application metrics
- User experience metrics (Core Web Vitals)

This comprehensive logging and monitoring system provides the foundation for reliable, observable, and maintainable operations for Saraiva Vision's digital platform.