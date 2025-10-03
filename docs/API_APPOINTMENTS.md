# Appointment Booking API Documentation

## Overview

The Appointment Booking API provides endpoints for managing patient appointments at Saraiva Vision. The system includes availability checking, appointment creation, conflict detection, and email notifications.

## Base URL

```
/api/appointments
```

## Endpoints

### 1. Get Available Slots

**Endpoint:** `GET /api/appointments/availability`

**Description:** Returns available time slots for the next N business days (Monday-Friday, 08:00-18:00).

**Query Parameters:**
- `days` (optional): Number of business days to fetch (1-30). Default: 14

**Example Request:**
```bash
GET /api/appointments/availability?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "availability": {
      "2025-10-06": [
        {
          "slot_time": "08:00",
          "is_available": true,
          "slot_id": "2025-10-06-08:00"
        },
        {
          "slot_time": "08:30",
          "is_available": false
        }
      ]
    },
    "schedulingEnabled": true,
    "contact": {
      "whatsapp": "+5533984207437",
      "phone": "+5533984207437",
      "phoneDisplay": "(33) 98420-7437",
      "externalUrl": "https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613"
    }
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Parâmetros inválidos",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `500` - Internal server error

**Caching:**
- No caching (real-time availability)
- Headers: `Cache-Control: private, no-cache, no-store, must-revalidate`

---

### 2. Create Appointment

**Endpoint:** `POST /api/appointments`

**Description:** Books a new appointment for a patient.

**Rate Limiting:**
- 5 appointments per hour per IP address
- Headers returned:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

**Request Body:**
```json
{
  "patient_name": "João Silva",
  "patient_email": "joao@example.com",
  "patient_phone": "(33) 98765-4321",
  "appointment_date": "2025-10-06",
  "appointment_time": "09:00",
  "notes": "Primeira consulta - visão turva"
}
```

**Field Validations:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `patient_name` | string | Yes | 2-100 chars, letters only |
| `patient_email` | string | Yes | Valid email format |
| `patient_phone` | string | Yes | Brazilian phone format |
| `appointment_date` | string | Yes | YYYY-MM-DD, Mon-Fri, future date |
| `appointment_time` | string | Yes | HH:MM, 08:00-18:00, 30-min slots |
| `notes` | string | No | Max 1000 chars |
| `honeypot` | string | No | Anti-spam (should be empty) |

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "APT-1696334400000-abc123xyz",
    "appointment": {
      "id": "APT-1696334400000-abc123xyz",
      "patient_name": "João Silva",
      "patient_email": "joao@example.com",
      "patient_phone": "33987654321",
      "appointment_date": "2025-10-06",
      "appointment_time": "09:00",
      "notes": "Primeira consulta - visão turva",
      "status": "pending",
      "created_at": "2025-10-03T10:00:00.000Z"
    },
    "confirmationSent": true
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**Error Responses:**

**Slot Unavailable (409):**
```json
{
  "success": false,
  "error": {
    "message": "Este horário não está mais disponível. Por favor, escolha outro horário.",
    "code": "SLOT_UNAVAILABLE"
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**Rate Limited (429):**
```json
{
  "success": false,
  "error": {
    "message": "Muitas tentativas de agendamento. Aguarde 1 hora antes de tentar novamente.",
    "code": "RATE_LIMIT"
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "message": "Dados inválidos. Verifique os campos e tente novamente.",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "2025-10-03T10:00:00.000Z"
}
```

**HTTP Status Codes:**
- `201` - Appointment created successfully
- `400` - Invalid request data
- `409` - Slot no longer available (conflict)
- `429` - Rate limit exceeded
- `500` - Internal server error

---

## Business Rules

### Operating Hours
- **Days:** Monday - Friday
- **Hours:** 08:00 - 18:00 (BRT - Brazil Time)
- **Slot Duration:** 30 minutes
- **Time Slots:** 08:00, 08:30, 09:00, ..., 17:00, 17:30

### Appointment Validation
1. Date must be a business day (Mon-Fri)
2. Date must be today or in the future
3. Time must be within operating hours
4. Time must align with 30-minute intervals
5. Slot must not be already booked
6. Patient data must pass validation

### Rate Limiting
- **Limit:** 5 appointments per hour per IP address
- **Purpose:** Prevent abuse and spam
- **Reset:** 1 hour rolling window

### Email Notifications
- Confirmation sent to clinic email (`CONTACT_TO_EMAIL`)
- Includes all appointment details
- Patient contact info for confirmation
- HTML and plain text formats

---

## Integration Guide

### Frontend Component Integration

The API is designed to work with the existing `AppointmentBooking` component (`src/components/AppointmentBooking.jsx`).

**Step 1: Fetch Availability**
```javascript
const response = await fetch('/api/appointments/availability?days=14');
const result = await response.json();

if (result.success) {
  const availability = result.data.availability;
  // Display available slots grouped by date
}
```

**Step 2: Create Appointment**
```javascript
const appointmentData = {
  patient_name: 'João Silva',
  patient_email: 'joao@example.com',
  patient_phone: '(33) 98765-4321',
  appointment_date: '2025-10-06',
  appointment_time: '09:00',
  notes: 'Primeira consulta'
};

const response = await fetch('/api/appointments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(appointmentData)
});

const result = await response.json();

if (result.success) {
  // Show confirmation
  console.log('Appointment ID:', result.data.id);
} else if (result.error.code === 'SLOT_UNAVAILABLE') {
  // Refresh availability and ask user to select another slot
}
```

**Step 3: Handle Errors**
```javascript
try {
  const response = await fetch('/api/appointments', { /* ... */ });
  const result = await response.json();
  
  if (!result.success) {
    switch (result.error.code) {
      case 'SLOT_UNAVAILABLE':
        // Refresh availability
        break;
      case 'RATE_LIMIT':
        // Show rate limit message
        break;
      case 'VALIDATION_ERROR':
        // Show validation errors
        break;
      default:
        // Generic error
        break;
    }
  }
} catch (error) {
  // Network error
}
```

---

## Backend Integration Notes

### Current Implementation
The API currently uses **in-memory storage** (Map objects) for:
- Booked slots tracking
- Appointments storage
- Rate limiting

### Production Requirements

**Replace with database:**
```typescript
// Instead of:
const mockBookedSlots = new Map<string, Set<string>>();

// Use:
// - PostgreSQL (Supabase)
// - MongoDB
// - MySQL
// etc.
```

**Recommended Schema:**
```sql
CREATE TABLE appointments (
  id VARCHAR(50) PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  patient_email VARCHAR(255) NOT NULL,
  patient_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(appointment_date, appointment_time)
);

CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**Rate Limiting:**
Replace in-memory Map with Redis:
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Use Redis for distributed rate limiting
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Email Configuration
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=contato@saraivavision.com.br

# Rate Limiting (optional)
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=3600000  # 1 hour in ms
```

---

## LGPD Compliance

### Data Collected
- Patient name
- Email address
- Phone number
- Appointment date/time
- Optional notes

### Data Protection Measures
1. **Anonymization:** PII is anonymized in logs
2. **Validation:** All inputs sanitized and validated
3. **Secure Transmission:** HTTPS only
4. **Rate Limiting:** Prevents data harvesting
5. **Honeypot:** Anti-spam protection

### User Rights
Under LGPD, patients have rights to:
- Access their data
- Request deletion
- Withdraw consent
- Data portability

Contact DPO: `saraivavision@gmail.com`

---

## Testing

### Test Availability Endpoint
```bash
curl -X GET "http://localhost:3000/api/appointments/availability?days=7"
```

### Test Appointment Creation
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "João Silva",
    "patient_email": "joao@example.com",
    "patient_phone": "(33) 98765-4321",
    "appointment_date": "2025-10-06",
    "appointment_time": "09:00",
    "notes": "Teste"
  }'
```

### Test Rate Limiting
Run the above POST request 6 times within an hour to trigger rate limit.

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `SLOT_UNAVAILABLE` | 409 | Time slot already booked |
| `RATE_LIMIT` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Changelog

### Version 1.0.0 (2025-10-03)
- Initial release
- Availability checking
- Appointment creation
- Email notifications
- Rate limiting
- LGPD compliance
- Mock data implementation

### Future Enhancements
- [ ] Database integration (Supabase/PostgreSQL)
- [ ] Admin endpoints (list, update, cancel appointments)
- [ ] SMS confirmations (Twilio)
- [ ] Calendar integration (Google Calendar)
- [ ] Appointment reminders (24h, 2h before)
- [ ] Recurring appointments
- [ ] Multi-doctor support
- [ ] Payment integration

---

## Support

For API support or bug reports:
- Email: saraivavision@gmail.com
- Documentation: `/docs/API_APPOINTMENTS.md`
