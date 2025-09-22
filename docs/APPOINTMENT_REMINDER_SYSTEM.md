# Appointment Reminder System

## Overview

The appointment reminder system automatically sends email and SMS notifications to patients at T-24h and T-2h before their scheduled appointments. The system uses a reliable outbox pattern for message delivery with retry logic and prevents duplicate reminders.

## Architecture

### Components

1. **Reminder Processing API** (`/api/appointments/reminders`)
   - Finds appointments due for reminders
   - Sends reminder notifications via outbox
   - Tracks reminder status to prevent duplicates

2. **Outbox System** (`/api/contact/outboxService.js`)
   - Reliable message delivery with retry logic
   - Handles both email (Resend) and SMS (Zenvia) delivery
   - Exponential backoff for failed deliveries

3. **SMS Service** (`/api/contact/smsService.js`)
   - Brazilian phone number validation and formatting
   - Zenvia API integration for SMS delivery
   - Appointment-specific SMS templates

4. **Cron Job** (`/api/outbox/drain`)
   - Runs every 5 minutes via Vercel cron
   - Processes pending messages and due reminders
   - Automated system maintenance

## Database Schema

### Appointments Table
```sql
-- Reminder tracking fields
reminder_24h_sent BOOLEAN DEFAULT false,
reminder_2h_sent BOOLEAN DEFAULT false
```

### Message Outbox Table
```sql
-- Reliable message delivery
message_type VARCHAR(20) -- 'email' or 'sms'
recipient VARCHAR(255)
content TEXT
template_data JSONB
status VARCHAR(20) -- 'pending', 'sent', 'failed'
retry_count INTEGER DEFAULT 0
send_after TIMESTAMPTZ -- Scheduled delivery time
```

## Workflow

### 1. Appointment Creation
When a patient books an appointment:
1. Appointment is created with `reminder_24h_sent: false` and `reminder_2h_sent: false`
2. Confirmation notifications are sent immediately
3. Reminder notifications are scheduled for future delivery

### 2. Reminder Scheduling
The system calculates reminder times:
- **24-hour reminder**: `appointment_datetime - 24 hours`
- **2-hour reminder**: `appointment_datetime - 2 hours`

Messages are added to the outbox with `send_after` set to the calculated reminder time.

### 3. Reminder Processing
Every 5 minutes, the cron job:
1. Finds appointments within the reminder window (±30 minutes)
2. Checks if reminders haven't been sent (`reminder_24h_sent: false`)
3. Sends email and SMS reminders via outbox
4. Marks reminders as sent to prevent duplicates

### 4. Message Delivery
The outbox system:
1. Processes pending messages ready for delivery
2. Attempts delivery via Resend (email) or Zenvia (SMS)
3. Retries failed messages with exponential backoff
4. Marks messages as sent or permanently failed

## Configuration

### Environment Variables
```bash
# SMS Configuration
ZENVIA_API_TOKEN=your_zenvia_token
ZENVIA_FROM_NUMBER=+5511999999999

# Email Configuration  
RESEND_API_KEY=re_your_api_key
DOCTOR_EMAIL=philipe_cruz@outlook.com

# Cron Security
CRON_SECRET=supersecret_cron_token
```

### Vercel Cron Jobs
```json
{
  "crons": [
    {
      "path": "/api/outbox/drain",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Message Templates

### Email Reminders
- **24-hour reminder**: "Lembrete: Consulta em 24 horas - Saraiva Vision"
- **2-hour reminder**: "Lembrete: Consulta em 2 horas - Saraiva Vision"

Content includes:
- Patient name and appointment details
- Clinic location and doctor information
- Preparation instructions
- Contact information for changes

### SMS Reminders
- **24-hour**: "Saraiva Vision: Lembrete! [Nome], sua consulta é em 24h - [Data] às [Hora]. Chegue 15min antes."
- **2-hour**: "Saraiva Vision: Lembrete! [Nome], sua consulta é em 2h - [Data] às [Hora]. Chegue 15min antes."

SMS messages are kept under 160 characters for optimal delivery.

## Phone Number Validation

The system validates and formats Brazilian phone numbers:

### Supported Formats
- `5511999999999` - Full international format (country + area + number)
- `11999999999` - National format (area + mobile number)
- `1133334444` - National format (area + landline)
- `999999999` - Mobile without area code (assumes São Paulo 11)
- `33334444` - Landline without area code (assumes São Paulo 11)

### Validation Rules
- Mobile numbers: 11 digits total (area code + 9 + 8 digits)
- Landline numbers: 10 digits total (area code + 8 digits)
- Country code: 55 (Brazil)
- Default area code: 11 (São Paulo)

## Error Handling

### Retry Logic
- **Email**: 1min, 2min, 4min, 8min, 16min, 30min (max)
- **SMS**: 30s, 1min, 2min, 4min, 8min, 15min (max)
- **Max retries**: 3 attempts
- **Jitter**: 5-15% random delay to prevent thundering herd

### Failure Scenarios
1. **Temporary failures**: Network issues, API rate limits
   - Messages are retried with exponential backoff
   - Status remains 'pending' until max retries reached

2. **Permanent failures**: Invalid phone numbers, blocked emails
   - Messages are marked as 'failed' after max retries
   - Errors are logged for manual review

3. **Duplicate prevention**: 
   - Database flags prevent sending duplicate reminders
   - Unique constraints ensure one reminder per type per appointment

## Monitoring

### Key Metrics
- Reminder delivery success rate
- Average retry count
- Failed message count
- Processing time per batch

### Logging
All reminder activities are logged with:
- Event type (reminder_sent, reminder_failed, etc.)
- Appointment ID and patient info (anonymized)
- Delivery status and error details
- Processing timestamps

### Health Checks
- `/api/appointments/reminders` (GET) - Reminder statistics
- `/api/outbox/drain` - Outbox processing status
- Database connectivity and queue depth

## Testing

### Unit Tests
- Phone number validation
- Reminder time calculations
- Template generation
- Database operations

### Integration Tests
- End-to-end reminder workflow
- Outbox message processing
- External API integration (mocked)
- Error handling scenarios

### Manual Testing
1. Create test appointment 25 hours in future
2. Verify 24h reminder is sent at correct time
3. Verify 2h reminder is sent at correct time
4. Confirm no duplicate reminders are sent
5. Test failure scenarios and retry logic

## Deployment

### Database Migrations
Run the outbox functions migration:
```sql
-- Apply database/migrations/006_outbox_functions.sql
```

### Vercel Configuration
1. Set environment variables in Vercel dashboard
2. Deploy with cron job configuration
3. Verify cron job is active in Vercel Functions tab

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Cron jobs active
- [ ] SMS provider (Zenvia) configured
- [ ] Email provider (Resend) configured
- [ ] Monitoring alerts set up
- [ ] Test appointment created and verified

## Troubleshooting

### Common Issues

1. **Reminders not sending**
   - Check cron job is running (`/api/outbox/drain`)
   - Verify appointment status is 'confirmed'
   - Check reminder flags in database

2. **SMS delivery failures**
   - Verify Zenvia API token and from number
   - Check phone number format validation
   - Review SMS content length (<160 chars)

3. **Email delivery failures**
   - Verify Resend API key configuration
   - Check email template rendering
   - Review spam/bounce reports

4. **Duplicate reminders**
   - Check reminder flags in appointments table
   - Verify cron job isn't running multiple times
   - Review outbox message deduplication

### Debug Commands
```bash
# Check pending reminders
curl -X GET /api/appointments/reminders

# Process outbox manually
curl -X POST /api/outbox/drain \
  -H "Authorization: Bearer $CRON_SECRET"

# Check outbox statistics
curl -X GET /api/dashboard/metrics
```

## Future Enhancements

1. **Customizable reminder times** - Allow patients to choose reminder preferences
2. **WhatsApp integration** - Send reminders via WhatsApp Business API
3. **Reminder confirmation** - Allow patients to confirm attendance via reply
4. **Smart scheduling** - Avoid sending reminders during sleep hours
5. **Multi-language support** - Support for English and Spanish reminders
6. **Appointment rescheduling** - Allow patients to reschedule via reminder links